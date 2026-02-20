import type { Handler, HandlerEvent } from "@netlify/functions";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

export const handler: Handler = async (event: HandlerEvent) => {
  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: { ...CORS_HEADERS, "Content-Length": "0" },
      body: "",
    };
  }

  const targetBase = "http://50.6.228.16:4000";
  const path = event.queryStringParameters?.path ?? "";
  // Build target URL — preserve any remaining query params except "path"
  const remainingParams = new URLSearchParams(
    Object.fromEntries(
      Object.entries(event.queryStringParameters ?? {}).filter(
        ([k]) => k !== "path",
      ),
    ),
  ).toString();
  const targetUrl =
    `${targetBase}/${path}`.replace(/([^:]\/)\/+/g, "$1") +
    (remainingParams ? `?${remainingParams}` : "");

  // Decode body if Netlify base64-encoded it
  let body: string | undefined = undefined;
  if (event.body && event.httpMethod !== "GET" && event.httpMethod !== "HEAD") {
    body = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf-8")
      : event.body;
  }

  // Forward only safe headers
  const forwardHeaders: Record<string, string> = {
    "Content-Type":
      (event.headers["content-type"] as string) || "application/json",
  };
  const auth = event.headers["authorization"] ?? event.headers["Authorization"];
  if (auth) forwardHeaders["Authorization"] = auth;

  try {
    const res = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: forwardHeaders,
      body,
    });

    const contentType = res.headers.get("content-type") ?? "application/json";
    const responseBody = await res.text();

    return {
      statusCode: res.status,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": contentType,
      },
      body: responseBody,
    };
  } catch (e: any) {
    console.error("[proxy] error:", e?.message);
    return {
      statusCode: 502,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: e?.message ?? "Proxy error" }),
    };
  }
};
