import { NextRequest, NextResponse } from "next/server";

const DEFAULT_VOXD_URL = "https://agents.voxd.ai";
const DEFAULT_AGENT_ID = "c6c212b2-6c02-4d4b-82e0-d2d869865d65";
const RESUME_COOKIE = "sapperton_voxd_resume";
const BROWSER_TOKEN_TTL_SECONDS = 900;
const RESUME_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

function getAllowedOrigin(request: NextRequest) {
  const requestOrigin = request.headers.get("origin");

  if (requestOrigin) {
    try {
      const parsedOrigin = new URL(requestOrigin);
      if (parsedOrigin.protocol === "http:" || parsedOrigin.protocol === "https:") {
        return parsedOrigin.origin;
      }
    } catch {
      // Fall back to the route's own origin below.
    }
  }

  return request.nextUrl.origin;
}

async function callVoxd(
  baseUrl: string,
  apiKey: string,
  path: string,
  body: Record<string, unknown>,
) {
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.VOXD_API_KEY;
  const baseUrl = (process.env.VOXD_BASE_URL || DEFAULT_VOXD_URL).replace(/\/$/, "");
  const agentId = process.env.VOXD_AGENT_ID || DEFAULT_AGENT_ID;

  if (!apiKey) {
    return NextResponse.json(
      { error: "The school assistant is not configured yet." },
      { status: 503 },
    );
  }

  let body: { visitorId?: string; conversationTitle?: string } = {};
  try {
    body = await request.json();
  } catch {
    // An empty body is valid for an existing resume-cookie session.
  }

  const allowedOrigin = getAllowedOrigin(request);
  const resumeToken = request.cookies.get(RESUME_COOKIE)?.value;

  try {
    let voxdResponse: Response | null = null;

    if (resumeToken) {
      voxdResponse = await callVoxd(
        baseUrl,
        apiKey,
        "/v1/client-sessions/resume",
        {
          agentId,
          resumeToken,
          allowedOrigin,
          ttlSeconds: BROWSER_TOKEN_TTL_SECONDS,
        },
      );
    }

    if (
      !voxdResponse ||
      ([400, 401, 403, 404].includes(voxdResponse.status) && resumeToken)
    ) {
      voxdResponse = await callVoxd(baseUrl, apiKey, "/v1/client-sessions", {
        agentId,
        allowedOrigin,
        ttlSeconds: BROWSER_TOKEN_TTL_SECONDS,
        resumeTtlSeconds: RESUME_TOKEN_TTL_SECONDS,
        conversation: {
          title: body.conversationTitle || "Sapperton School website chat",
        },
        ...(body.visitorId
          ? { chatUser: { externalId: body.visitorId } }
          : {}),
      });
    }

    if (!voxdResponse.ok) {
      console.error("VOXD client session request failed", voxdResponse.status);
      return NextResponse.json(
        { error: "The school assistant is temporarily unavailable." },
        { status: 502 },
      );
    }

    const payload = await voxdResponse.json();
    const data = payload.data;
    const response = NextResponse.json(
      {
        data: {
          token: data.token,
          expiresAt: data.expiresAt,
          session: data.session,
          agent: data.agent,
          conversation: data.conversation,
          conversations: data.conversations,
          baseUrl,
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );

    if (data.resumeToken) {
      response.cookies.set(RESUME_COOKIE, data.resumeToken, {
        httpOnly: true,
        secure: request.nextUrl.protocol === "https:",
        sameSite: "lax",
        path: "/",
        maxAge: RESUME_TOKEN_TTL_SECONDS,
      });
    }

    return response;
  } catch (error) {
    console.error("VOXD is unreachable", error);
    return NextResponse.json(
      { error: "The school assistant is temporarily unavailable." },
      { status: 502 },
    );
  }
}
