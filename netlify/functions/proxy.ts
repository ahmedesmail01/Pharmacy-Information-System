import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Content-Type": "text/plain",
      },
      body: "",
    };
  }

  try {
    const targetBase = "http://50.6.228.16:4000";
    const path = event.queryStringParameters?.path || "";
    const url = `${targetBase}/${path}`.replace(/([^:]\/)\/+/g, "$1");

    // Filter headers to avoid potential issues with host-specific headers
    const headers: Record<string, string> = {};
    const allowedHeaders = ["content-type", "authorization", "accept"];

    Object.keys(event.headers).forEach((key) => {
      if (allowedHeaders.includes(key.toLowerCase())) {
        headers[key.toLowerCase()] = event.headers[key] as string;
      }
    });

    const res = await fetch(url, {
      method: event.httpMethod,
      headers: headers,
      body:
        event.httpMethod !== "GET" && event.httpMethod !== "HEAD"
          ? event.body
          : undefined,
    });

    const contentType = res.headers.get("content-type");
    let body: any;

    if (contentType && contentType.includes("application/json")) {
      body = await res.text();
    } else {
      body = await res.text();
    }

    return {
      statusCode: res.status,
      headers: {
        "Content-Type": contentType || "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      },
      body: body,
    };
  } catch (e: any) {
    console.error("Proxy error:", e);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      },
      body: JSON.stringify({ message: e?.message || "Proxy error" }),
    };
  }
};
