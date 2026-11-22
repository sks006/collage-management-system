import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

async function proxyToBackend(request: NextRequest, slug: string[]) {
  const path = slug.join("/");
  const search = request.nextUrl.search;
  const targetUrl = `${BACKEND_URL}/api/v1/${path}${search}`;
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const start = Date.now();

  const headers = new Headers();
  const incomingContentType = request.headers.get("content-type");
  if (incomingContentType) {
    headers.set("Content-Type", incomingContentType);
  }
  headers.set("X-Request-ID", requestId);

  // Forward explicit Bearer header OR promote HttpOnly session cookie
  const authHeader = request.headers.get("authorization");
  const cookieToken = request.cookies.get("sms_access_token")?.value;
  if (authHeader) {
    headers.set("Authorization", authHeader);
  } else if (cookieToken) {
    headers.set("Authorization", `Bearer ${cookieToken}`);
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const body = hasBody ? await request.arrayBuffer() : undefined;

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      signal: AbortSignal.timeout(10000),
    });

    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[BFF] ${request.method} /api/v1/${path} → ${upstream.status} (${duration}ms) [${requestId}]`,
      );
    }

    const responseBuffer = await upstream.arrayBuffer();
    return new NextResponse(responseBuffer, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
        "X-Request-Id": upstream.headers.get("X-Request-Id") || requestId,
      },
    });
  } catch (err: any) {
    console.error(`[BFF ERROR] ${request.method} /api/v1/${path} [${requestId}]:`, err?.message);
    return NextResponse.json(
      {
        statusCode: 502,
        message: "Upstream NestJS API unreachable",
        detail: err?.message || "Connection refused or timed out",
        requestId,
      },
      { status: 502 },
    );
  }
}

type RouteContext = { params: Promise<{ slug: string[] }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
  return proxyToBackend(req, (await ctx.params).slug);
}
export async function POST(req: NextRequest, ctx: RouteContext) {
  return proxyToBackend(req, (await ctx.params).slug);
}
export async function PUT(req: NextRequest, ctx: RouteContext) {
  return proxyToBackend(req, (await ctx.params).slug);
}
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return proxyToBackend(req, (await ctx.params).slug);
}
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  return proxyToBackend(req, (await ctx.params).slug);
}
