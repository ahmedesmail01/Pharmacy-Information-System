import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  try {
    const targetBase = "http://50.6.228.16:4000"; // الباك HTTP
    const path = event.queryStringParameters?.path || "";
    const url = `${targetBase}/${path}`.replace(/([^:]\/)\/+/g, "$1");

    const method = event.httpMethod || "GET";

    // Body
    const body = method !== "GET" && method !== "HEAD" ? event.body : undefined;

    const res = await fetch(url, {
      method,
      headers: {
        "content-type": event.headers["content-type"] || "application/json",
        // لو الباك محتاج Authorization من الفرونت مرّره:
        ...(event.headers.authorization
          ? { authorization: event.headers.authorization }
          : {}),
      },
      body,
    });

    const text = await res.text();

    return {
      statusCode: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json",
        // CORS للفرونت
        "access-control-allow-origin": "*",
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
