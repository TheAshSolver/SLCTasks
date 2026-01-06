["log", "warn", "error", "info", "debug"].forEach((method) => {
  const original = console[method];
  console[method] = (...args) => {
    const now = new Date();

    const formattedDate = now
      .toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(
        /(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/,
        "[$3/$1/$2 $4:$5:$6]",
      );

    original(`${formattedDate} - `, ...args);
  };
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "clubs.iiit.ac.in",
      },
      {
        protocol: "https",
        hostname: "life.iiit.ac.in",
      },
      {
        protocol: "https",
        hostname: "dev-clubs.iiit.ac.in",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "files",
      },
      {
        protocol: "http",
        hostname: "nginx",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/student-bodies/clubs",
        destination: "/clubs-council",
        permanent: true,
      },
      {
        source: "/clubs/clubs",
        destination: "/clubs-council",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/clubs-council",
        permanent: true,
      },
      {
        source: "/about/clubs-council",
        destination: "/clubs-council",
        permanent: true,
      },
    ];
  },
  compiler: {
    styledComponents: true,
    removeConsole: process.env.NODE_ENV === "production",
  },
  reactCompiler: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  turbopack: {
    root: '/',
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: {
              svgoConfig: {
                plugins: [
                  {
                    name: 'preset-default',
                    params: {
                      overrides: {
                        // customize default plugin options
                        removeViewBox: false,
                      },
                    },
                  },
                  'removeDimensions',
                ],
              },
            },
          },
        ],
        as: '*.js',
      },
    },
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

const withMDX = require("@next/mdx")();
module.exports = withMDX(nextConfig);
