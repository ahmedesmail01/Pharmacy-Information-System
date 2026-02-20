import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      },
      body: "",
    };
  }

  try {
    const targetBase = "http://50.6.228.16:4000";
    const path = event.queryStringParameters?.path || "";
    const url = `${targetBase}/${path}`.replace(/([^:]\/)\/+/g, "$1");

    const res = await fetch(url, {
      method: event.httpMethod,
      headers: {
        "content-type": event.headers["content-type"] || "application/json",
        ...(event.headers.authorization
          ? { authorization: event.headers.authorization }
          : {}),
      },
      body:
        event.httpMethod !== "GET" && event.httpMethod !== "HEAD"
          ? event.body
          : undefined,
    });

    const text = await res.text();

    return {
      statusCode: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: text,
    };
  } catch (e: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: e?.message || "Proxy error" }),
    };
  }
};
