import { cookies } from "next/headers";

import { registerUrql } from "@urql/next/rsc";
import { cacheExchange, createClient, fetchExchange } from "urql/core";

const GRAPHQL_ENDPOINT =
  process.env.GRAPHQL_ENDPOINT || "http://gateway/graphql";

const makeClient = async () => {
  const cookieList = (await cookies()).getAll();
  const cookieHeader = cookieList.length
    ? cookieList.map((c) => `${c.name}=${c.value}`).join("; ")
    : undefined;

  return createClient({
    url: GRAPHQL_ENDPOINT,
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: {
      cache: "no-store",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
      },
    },
  });
};

const { getClient: _rscGetClient } = registerUrql(makeClient);

export const getClient = () => {
  return {
    query: async (document, variables) => {
      const client = await _rscGetClient();
      const result = client.query(document, variables);
      // urql query returns an object with toPromise method
      return result.toPromise ? await result.toPromise() : await result;
    },
    mutation: async (document, variables) => {
      const client = await _rscGetClient();
      const result = client.mutation(document, variables);
      return result.toPromise ? await result.toPromise() : await result;
    },
  };
};
