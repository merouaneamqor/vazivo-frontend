/**
 * Proxy API requests to the backend so auth cookies are same-origin.
 * Forwards method, headers, and body to avoid rewrite issues with POST.
 */

import { type NextRequest, NextResponse } from "next/server";

function getBackendBase(): string {
  const url =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3000/api/v1";
  const base = url.replace(/\/api\/v1\/?$/, "");
  // Use 127.0.0.1 when proxying to localhost to avoid resolution issues in Node
  return base.replace(/^http:\/\/localhost/i, "http://127.0.0.1");
}

const BACKEND_BASE = getBackendBase();

const FORWARD_HEADERS = [
  "content-type",
  "content-length",
  "accept",
  "accept-language",
  "cookie",
  "x-locale",
] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, await params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, await params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, await params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, await params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, await params);
}

async function proxy(
  request: NextRequest,
  { path }: { path: string[] }
): Promise<NextResponse> {
  const pathSegment = Array.isArray(path) ? path.join("/") : path || "";
  const search = request.nextUrl.search;
  const url = `${BACKEND_BASE}/api/v1/${pathSegment}${search}`;

  const headers = new Headers();
  FORWARD_HEADERS.forEach((name) => {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  });

  const contentType = request.headers.get("content-type") ?? "";
  let body: string | ArrayBuffer | undefined;
  if (
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    request.body
  ) {
    try {
      // Multipart/form-data must use arrayBuffer to preserve file bytes; text() corrupts binaries
      if (contentType.includes("multipart/form-data")) {
        body = await request.arrayBuffer();
      } else {
        body = await request.text();
      }
    } catch {
      // no body
    }
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: request.method,
      headers,
      body: body ?? undefined,
    });
  } catch (err) {
    console.error("[api proxy] backend fetch failed:", url, err);
    return NextResponse.json(
      {
        error: "Backend unavailable",
        details:
          process.env.NODE_ENV === "development"
            ? `${String(err)}. Check API_URL (backend at ${url}) and that the backend is running.`
            : undefined,
      },
      { status: 502 }
    );
  }

  const resHeaders = new Headers();
  res.headers.forEach((value, key) => {
    resHeaders.set(key, value);
  });
  // Preserve multiple Set-Cookie headers (get() only returns first)
  if ("getSetCookie" in res.headers && typeof res.headers.getSetCookie === "function") {
    resHeaders.delete("set-cookie");
    res.headers.getSetCookie().forEach((cookie) => {
      resHeaders.append("set-cookie", cookie);
    });
  }

  return new NextResponse(res.body ?? null, {
    status: res.status,
    statusText: res.statusText,
    headers: resHeaders,
  });
}
