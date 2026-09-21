import assert from "node:assert/strict";
import test from "node:test";
import {
  createActivityState,
  isConversationTimedOut,
  reduceActivityState,
  VoxdChat,
  type VoxdConversation,
} from "./voxdBrowser";

const NOW = Date.parse("2026-09-21T12:00:00.000Z");

test("treats the server timeout flag as authoritative", () => {
  const conversation: VoxdConversation = {
    id: "timed-out",
    sessionTimedOut: true,
    sessionExpiresAt: "2026-09-22T12:00:00.000Z",
  };

  assert.equal(isConversationTimedOut(conversation, NOW), true);
});

test("treats an elapsed session expiry as timed out", () => {
  const conversation: VoxdConversation = {
    id: "elapsed",
    sessionTimedOut: false,
    sessionExpiresAt: "2026-09-21T11:59:59.999Z",
  };

  assert.equal(isConversationTimedOut(conversation, NOW), true);
});

test("allows active and not-yet-started sessions to resume", () => {
  assert.equal(
    isConversationTimedOut(
      {
        id: "active",
        sessionTimedOut: false,
        sessionExpiresAt: "2026-09-21T12:00:00.001Z",
      },
      NOW,
    ),
    false,
  );
  assert.equal(
    isConversationTimedOut(
      {
        id: "empty",
        lastClientMessageAt: null,
        sessionExpiresAt: null,
        sessionTimedOut: false,
      },
      NOW,
    ),
    false,
  );
});

test("externally authored messages do not clear an active run", () => {
  const active = {
    ...createActivityState(),
    active: true,
    runId: "run-1",
    startedAt: NOW,
    label: "Thinking…",
    phase: "working" as const,
  };

  const next = reduceActivityState(active, {
    schemaVersion: 1,
    id: "event-2",
    sequence: 2,
    conversationId: "conversation-1",
    runId: null,
    type: "message.completed",
    payload: {},
  });

  assert.deepEqual(next, active);
});

test("terminal run events clear progress", () => {
  const active = {
    ...createActivityState(),
    active: true,
    runId: "run-1",
    startedAt: NOW,
    label: "Thinking…",
    phase: "working" as const,
  };

  for (const type of ["run.completed", "run.failed", "run.cancelled"]) {
    const next = reduceActivityState(active, {
      schemaVersion: 1,
      id: `event-${type}`,
      sequence: 3,
      conversationId: "conversation-1",
      runId: "run-1",
      type,
      payload: {},
    });
    assert.deepEqual(next, createActivityState());
  }
});

test("keeps the conversation stream open after a terminal run event", async () => {
  const stored = new Map<string, string>([
    ["voxd:conversation-1:last-event", "12"],
  ]);
  const originalFetch = globalThis.fetch;
  const originalSessionStorage = globalThis.sessionStorage;
  const requests: Array<{ url: URL; lastEventId: string | null }> = [];
  const controller = new AbortController();
  const receivedTypes: string[] = [];
  let canonicalMessages: unknown = null;

  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => stored.set(key, value),
    },
  });

  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input));
    const headers = new Headers(init?.headers);
    requests.push({ url, lastEventId: headers.get("Last-Event-ID") });

    if (url.pathname.endsWith("/client-tool-calls")) {
      return Response.json({ data: [] });
    }

    if (url.pathname.endsWith("/messages")) {
      return Response.json({
        data: [{ id: "external-1", role: "assistant", parts: [] }],
      });
    }

    const frames = [
      {
        id: 13,
        type: "run.completed",
        runId: "run-1",
      },
      {
        id: 14,
        type: "message.completed",
        runId: null,
      },
    ]
      .map(
        ({ id, type, runId }) =>
          `id: ${id}\nevent: ${type}\ndata: ${JSON.stringify({
            schemaVersion: 1,
            id: `event-${id}`,
            sequence: id,
            conversationId: "conversation-1",
            runId,
            type,
            payload: {},
          })}\n\n`,
      )
      .join("");
    return new Response(frames, {
      headers: { "Content-Type": "text/event-stream" },
    });
  };

  try {
    const chat = new VoxdChat({
      baseUrl: "https://agents.voxd.test",
      token: "token",
      expiresAt: "2099-01-01T00:00:00.000Z",
      sessionEndpoint: "/api/voxd/session",
      agentId: "agent-1",
    });

    await chat.stream("conversation-1", {
      signal: controller.signal,
      onEvent: (event) => receivedTypes.push(event.type),
      onMessages: (messages) => {
        canonicalMessages = messages;
        controller.abort();
      },
    });

    const eventRequest = requests.find(({ url }) =>
      url.pathname.endsWith("/events"),
    );
    assert.deepEqual(receivedTypes, ["run.completed", "message.completed"]);
    assert.deepEqual(canonicalMessages, [
      { id: "external-1", role: "assistant", parts: [] },
    ]);
    assert.equal(eventRequest?.url.searchParams.get("live"), "true");
    assert.equal(eventRequest?.url.searchParams.get("after"), "12");
    assert.equal(eventRequest?.lastEventId, "12");
    assert.equal(stored.get("voxd:conversation-1:last-event"), "14");
  } finally {
    globalThis.fetch = originalFetch;
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      value: originalSessionStorage,
    });
  }
});

test("renews through the customer backend when an expired token cannot refresh", async () => {
  const originalFetch = globalThis.fetch;
  const originalSessionStorage = globalThis.sessionStorage;
  const originalWindow = globalThis.window;
  const controller = new AbortController();
  const requests: Array<{
    path: string;
    authorization: string | null;
    credentials?: RequestCredentials;
  }> = [];

  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: () => null,
      setItem: () => undefined,
    },
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location: { origin: "https://school.example" } },
  });

  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input), "https://school.example");
    const headers = new Headers(init?.headers);
    requests.push({
      path: url.pathname,
      authorization: headers.get("Authorization"),
      credentials: init?.credentials,
    });

    if (url.pathname === "/chat/v1/session/refresh") {
      return Response.json(
        { error: { message: "Token expired" } },
        { status: 401 },
      );
    }

    if (url.pathname === "/api/voxd/session") {
      return Response.json({
        data: {
          token: "replacement-token",
          expiresAt: "2099-01-01T00:00:00.000Z",
        },
      });
    }

    if (url.pathname.endsWith("/client-tool-calls")) {
      return Response.json({ data: [] });
    }

    const frame = `id: 1\nevent: message.delta\ndata: ${JSON.stringify({
      schemaVersion: 1,
      id: "event-1",
      sequence: 1,
      conversationId: "conversation-1",
      runId: "run-1",
      type: "message.delta",
      payload: { delta: "Hello" },
    })}\n\n`;
    return new Response(frame, {
      headers: { "Content-Type": "text/event-stream" },
    });
  };

  try {
    const chat = new VoxdChat({
      baseUrl: "https://agents.voxd.test",
      token: "expired-token",
      expiresAt: "2000-01-01T00:00:00.000Z",
      sessionEndpoint: "/api/voxd/session",
      agentId: "agent-1",
    });

    await chat.stream("conversation-1", {
      signal: controller.signal,
      onEvent: () => controller.abort(),
    });

    assert.deepEqual(
      requests.map(({ path }) => path),
      [
        "/chat/v1/session/refresh",
        "/api/voxd/session",
        "/chat/v1/conversations/conversation-1/client-tool-calls",
        "/chat/v1/conversations/conversation-1/events",
      ],
    );
    assert.equal(requests[1]?.credentials, "include");
    assert.equal(requests[2]?.authorization, "Bearer replacement-token");
    assert.equal(requests[3]?.authorization, "Bearer replacement-token");
  } finally {
    globalThis.fetch = originalFetch;
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      value: originalSessionStorage,
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    });
  }
});
