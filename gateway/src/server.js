/**
 * @file Server instantiation for the Apollo Gateway
 * @module src/server
 */

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloGateway, RemoteGraphQLDataSource } from "@apollo/gateway";
import { ApolloServerPluginLandingPageDisabled } from "@apollo/server/plugin/disabled";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

import http from "http";
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import { readFileSync } from "fs";
import { expressjwt } from "express-jwt";

/**
 * Custom logger function with timestamp
 * @param {string} level - Log level (INFO, ERROR, DEBUG)
 * @param {string} message - Log message
 */
function customLogger(level, message) {
  const now = new Date();
  const timestamp = now.toLocaleString('en-US', { 
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, '$3-$1-$2 $4:$5:$6');
  
  console.log(`[${timestamp}] ${level}: ${message}`);
}

// Logger convenience methods
const logger = {
  info: (message) => customLogger('INFO', message),
  error: (message) => customLogger('ERROR', message),
  debug: (message) => {
    if (debug) customLogger('DEBUG', message);
  }
};

/**
 * Debug flag indicating if the gateway is in debug mode.
 * @constant {number}
 */
const debug = parseInt(process.env.GLOBAL_DEBUG || 0);

/**
 * Port on which the gateway server will listen.
 * @constant {number}
 */
const port = process.env.GATEWAY_PORT || 80;

/**
 * Secret key for JWT authentication.
 * @constant {string}
 */
const jwt_secret =
  process.env.JWT_SECRET || "this-is-the-greatest-secret-of-all-time";

/**
 * CORS options configuration.
 * @constant {Object}
 * @property {string[]} origin - Array of allowed origins.
 * @property {boolean} credentials - Indicates if credentials are allowed.
 */
const corsOptions = {
  origin: (process.env.GATEWAY_ALLOWED_ORIGINS || "localhost 127.0.0.1").split(
    " "
  ),
  credentials: true,
};

/**
 * Path to the supergraph schema file.
 * @constant {string}
 */
const supergraphSchema = "./supergraph.graphql";

/**
 * Express application instance.
 * @constant {express.Application}
 */
const app = express();

/**
 * HTTP server created to handle Express requests.
 * @constant {http.Server}
 */
const httpServer = http.createServer(app);

logger.info("Initializing Apollo Gateway");

/**
 * Apollo Gateway instance configured with the supergraph schema.
 * @type {ApolloGateway}
 */
const gateway = new ApolloGateway({
  /**
   * Reads the supergraph schema from the file.
   * @type {string}
   */
  supergraphSdl: readFileSync(supergraphSchema).toString(),
  /**
   * Builds the service with the RemoteGraphQLDataSource.
   * The function sets the "user" and "cookies" headers on outgoing requests.
   *
   * @param {Object} param0 - Service configuration.
   * @param {string} param0.url - URL of the remote GraphQL service.
   * @param {string} param0.name - Name of the remote GraphQL service.
   * @returns {RemoteGraphQLDataSource} Instance of RemoteGraphQLDataSource.
   */
  buildService: ({ url, name }) => {
    logger.debug(`Building service for URL: ${url}, Name: ${name}`);
    return new RemoteGraphQLDataSource({
      url,
      /**
       * Hook executed before sending a request to a remote service.
       * Passes user information and cookies to the service via HTTP headers.
       *
       * @param {Object} params - Request parameters.
       * @param {Object} params.request - The outgoing request.
       * @param {Object} params.context - The current request context.
       */
      willSendRequest: ({ request, context }) => {
          request.http.headers.set(
            "user",
            context.user ? JSON.stringify(context.user) : null
          );
          request.http.headers.set(
            "cookies",
            context.cookies ? JSON.stringify(context.cookies) : null
          );
      },
    });
  },
});

/**
 * Apollo Server instance configured to work with the Apollo Gateway.
 * Uses the plugins: ApolloServerPluginDrainHttpServer and ApolloServerPluginLandingPageDisabled.
 * Enables the landing page, playground, and introspection in debug mode.
 * @constant {ApolloServer}
 */
const server = new ApolloServer({
  gateway: gateway,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    // Disable landing page on production if debug flag is false
    ...(debug ? [] : [ApolloServerPluginLandingPageDisabled()]),
    // Custom plugin for request logging
    {
      async serverWillStart() {
        logger.info("Apollo Server starting");
        return {
          async serverWillStop() {
            logger.info("Apollo Server stopping");
          },
        };
      },
      async requestDidStart() {
        const startTime = Date.now();
        
        return {
          async didEncounterErrors({ errors }) {
            errors.forEach(error => {
              logger.error(`GraphQL error: ${error.message}`);
              if (debug) {
                logger.debug(`Error stack: ${error.stack}`);
              }
            });
          },
          async willSendResponse({ response }) {
            const duration = Date.now() - startTime;
            logger.debug(`Request completed in ${duration}ms`);
          }
        };
      }
    }
  ],
  introspection: debug ? true : false,
});

// Ensure the Apollo server is started before handling requests
await server.start();
logger.info("Apollo Server started successfully");

// Health check endpoint to verify server status.
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Apply middleware to the Express application.
app.use(
  "/",
  cors(corsOptions),
  cookieParser(),
  bodyParser.json(),
  expressjwt({
    secret: jwt_secret,
    algorithms: ["HS256"],
    credentialsRequired: false,
    getToken: (req) => {
      // Fetch token from cookie if available
      if ("Authorization" in req.cookies) {
        return req.cookies.Authorization;
      }
      return null;
    },
  }),
  expressMiddleware(server, {
    /**
     * Sets up the request context with authenticated user and cookies.
     *
     * @param {Object} params - Request parameters.
     * @param {Object} params.req - The HTTP request.
     * @returns {Object} Context containing user and cookies.
     */
    context: ({ req }) => ({
      user: req.auth || null,
      cookies: req.cookies || null,
    }),
  })
);

// Starts the HTTP server and listens on the configured port.
await new Promise((resolve) => httpServer.listen({ port }, resolve));
logger.info(`Gateway started at port ${port}. Debug: ${debug}`);
