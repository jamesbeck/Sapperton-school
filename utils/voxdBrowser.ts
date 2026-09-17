export type VoxdMessage = {
  id: string;
  role: "user" | "assistant";
  parts: Array<{ type: "text"; text: string }>;
};

export type VoxdConversation = {
  id: string;
  title?: string | null;
};

export type VoxdRunEvent = {
  schemaVersion: number;
  id: string;
  sequence: number;
  conversationId: string;
  runId: string;
  createdAt?: string;
  type: string;
  payload: Record<string, unknown>;
};

export type VoxdStreamEvent = {
  id?: string;
  type: string;
  data: VoxdRunEvent;
};

type VoxdActivityTool = {
  id: string;
  label: string;
  startedAt: number;
};

export type VoxdActivityState = {
  active: boolean;
  runId: string | null;
  startedAt: number | null;
  label: string | null;
  activeTools: VoxdActivityTool[];
  phase: "idle" | "working" | "tool";
};

const activityLabel = (value: unknown, fallback = "Thinking") => {
  const label =
    typeof value === "string"
      ? value.trim().replace(/[.\u2026]+$/, "")
      : fallback;
  return `${label || fallback}\u2026`;
};

const runEvent = (
  event: VoxdStreamEvent | VoxdRunEvent,
): VoxdRunEvent => ("data" in event ? event.data : event);

export function createActivityState(): VoxdActivityState {
  return {
    active: false,
    runId: null,
    startedAt: null,
    label: null,
    activeTools: [],
    phase: "idle",
  };
}

export function reduceActivityState(
  currentState: VoxdActivityState | null | undefined,
  streamedEvent: VoxdStreamEvent | VoxdRunEvent,
): VoxdActivityState {
  const state = currentState ?? createActivityState();
  const event = runEvent(streamedEvent);
  if (!event?.type) return state;

  const payload = event.payload ?? {};
  const parsedTimestamp = event.createdAt
    ? Date.parse(event.createdAt)
    : Number.NaN;
  const timestamp = Number.isFinite(parsedTimestamp)
    ? parsedTimestamp
    : Date.now();
  const startedAt =
    state.active && state.runId === event.runId
      ? state.startedAt
      : timestamp;

  if (
    [
      "message.delta",
      "message.completed",
      "run.completed",
      "run.failed",
      "run.cancelled",
    ].includes(event.type)
  ) {
    return createActivityState();
  }

  if (["run.queued", "run.started"].includes(event.type)) {
    return {
      ...state,
      active: true,
      runId: event.runId ?? state.runId,
      startedAt,
      label: state.label ?? "Thinking\u2026",
      phase: "working",
    };
  }

  if (["step.started", "step.completed"].includes(event.type)) {
    return {
      ...state,
      active: true,
      runId: event.runId ?? state.runId,
      startedAt,
      label: activityLabel(payload.label),
      phase: "working",
    };
  }

  if (event.type === "tool.started") {
    const id =
      typeof payload.activityId === "string"
        ? payload.activityId
        : `event-${event.sequence ?? timestamp}`;
    const tool = {
      id,
      label: activityLabel(payload.label),
      startedAt: timestamp,
    };
    const activeTools = [
      ...state.activeTools.filter((item) => item.id !== id),
      tool,
    ];
    return {
      ...state,
      active: true,
      runId: event.runId ?? state.runId,
      startedAt,
      label: tool.label,
      activeTools,
      phase: "tool",
    };
  }

  if (["tool.completed", "tool.failed"].includes(event.type)) {
    const id =
      typeof payload.activityId === "string" ? payload.activityId : null;
    const label = activityLabel(payload.label);
    const activeTools = id
      ? state.activeTools.filter((item) => item.id !== id)
      : state.activeTools.filter((item) => item.label !== label);
    const latestTool = activeTools.at(-1);
    return {
      ...state,
      active: true,
      runId: event.runId ?? state.runId,
      startedAt,
      label:
        latestTool?.label ??
        (event.type === "tool.failed"
          ? "Continuing\u2026"
          : "Reviewing the results\u2026"),
      activeTools,
      phase: latestTool ? "tool" : "working",
    };
  }

  return state;
}

export function shouldShowActivity(
  state: VoxdActivityState,
  now = Date.now(),
  delayMs = 800,
) {
  return Boolean(
    state.active &&
      state.label &&
      state.startedAt !== null &&
      now - state.startedAt >= delayMs,
  );
}

type SessionPayload = {
  token: string;
  expiresAt: string;
  baseUrl?: string;
  conversation?: VoxdConversation;
  conversations?: VoxdConversation[];
};

type RequestOptions = RequestInit & { headers?: Record<string, string> };

export type VoxdClientToolContext = {
  toolCallId: string;
  name: string;
};

export type VoxdClientTool = {
  description: string;
  inputSchema: Record<string, unknown>;
  requiresConfirmation?: boolean;
  execute: (
    input: Record<string, unknown>,
    context: VoxdClientToolContext,
  ) => unknown | Promise<unknown>;
};

export type VoxdClientTools = Record<string, VoxdClientTool>;

type VoxdClientToolCall = {
  id?: string;
  callId?: string;
  name?: string;
  input?: Record<string, unknown>;
  requiresConfirmation?: boolean;
};

type VoxdClientToolResult =
  | { status: "completed"; output: unknown }
  | {
      status: "failed";
      error: { code: string; message: string };
    };

type ConfirmClientTool = (call: {
  id: string;
  name: string;
  input: Record<string, unknown>;
}) => boolean | Promise<boolean>;

type ResumeOptions = {
  baseUrl: string;
  sessionEndpoint: string;
  agentId: string;
  visitorId: string;
  conversationTitle?: string;
  clientTools?: VoxdClientTools;
  confirmClientTool?: ConfirmClientTool;
};

type StreamOptions = {
  onEvent?: (event: VoxdStreamEvent) => void;
  onMessages?: (messages: VoxdMessage[]) => void;
  runId?: string;
  signal?: AbortSignal;
};

export class VoxdChat {
  private baseUrl: string;
  private token: string;
  private expiresAt: number;
  private sessionEndpoint: string;
  private agentId: string;
  private clientTools: VoxdClientTools;
  private confirmClientTool?: ConfirmClientTool;
  private executingClientToolIds = new Set<string>();
  private completedClientToolIds = new Set<string>();
  private pendingClientToolResults = new Map<string, VoxdClientToolResult>();
  private abortController: AbortController | null = null;

  constructor({
    baseUrl,
    token,
    expiresAt,
    sessionEndpoint,
    agentId,
    clientTools = {},
    confirmClientTool,
  }: {
    baseUrl: string;
    token: string;
    expiresAt: string;
    sessionEndpoint: string;
    agentId: string;
    clientTools?: VoxdClientTools;
    confirmClientTool?: ConfirmClientTool;
  }) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.token = token;
    this.expiresAt = new Date(expiresAt).getTime();
    this.sessionEndpoint = sessionEndpoint;
    this.agentId = agentId;
    this.clientTools = clientTools;
    this.confirmClientTool = confirmClientTool;
  }

  static async resumeOrCreate({
    baseUrl,
    sessionEndpoint,
    agentId,
    visitorId,
    conversationTitle = "Website chat",
    clientTools = {},
    confirmClientTool,
  }: ResumeOptions) {
    const response = await fetch(sessionEndpoint, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId,
        visitorId,
        allowedOrigin: window.location.origin,
        conversationTitle,
        clientTools: serializeClientTools(clientTools),
      }),
    });
    const payload = await readResponse<SessionPayload>(response);
    const data = payload.data ?? payload;
    const chat = new VoxdChat({
      baseUrl: data.baseUrl || baseUrl,
      sessionEndpoint,
      agentId,
      token: data.token,
      expiresAt: data.expiresAt,
      clientTools,
      confirmClientTool,
    });
    const storageKey = `voxd:${agentId}:conversation`;
    const rememberedId = localStorage.getItem(storageKey);
    const resumable = data.conversations ?? (data.conversation ? [data.conversation] : []);
    let conversation =
      resumable.find((item) => item.id === rememberedId) ?? resumable[0] ?? null;

    if (!conversation) {
      conversation = await chat.createConversation(conversationTitle);
    }

    localStorage.setItem(storageKey, conversation.id);
    return { chat, conversation };
  }

  rememberConversation(conversationId: string) {
    localStorage.setItem(`voxd:${this.agentId}:conversation`, conversationId);
  }

  async createConversation(title = "Website chat") {
    return this.request<VoxdConversation>("/chat/v1/conversations", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
  }

  async listMessages(conversationId: string) {
    return this.request<VoxdMessage[]>(
      `/chat/v1/conversations/${conversationId}/messages`,
    );
  }

  async sendMessage(conversationId: string, text: string) {
    return this.request<{
      message: VoxdMessage;
      run: { id: string };
      eventUrl: string;
    }>(`/chat/v1/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ parts: [{ type: "text", text }] }),
    });
  }

  async cancel(runId: string) {
    return this.request(`/chat/v1/runs/${runId}/cancel`, {
      method: "POST",
      body: "{}",
    });
  }

  async refresh() {
    const data = await this.request<{ token: string; expiresAt: string }>(
      "/chat/v1/session/refresh",
      { method: "POST", body: JSON.stringify({ ttlSeconds: 900 }) },
      false,
    );
    this.token = data.token;
    this.expiresAt = new Date(data.expiresAt).getTime();
  }

  async stream(
    conversationId: string,
    { onEvent, onMessages, runId, signal }: StreamOptions = {},
  ) {
    this.abortController?.abort();
    this.abortController = new AbortController();
    if (signal) {
      signal.addEventListener(
        "abort",
        () => this.abortController?.abort(),
        { once: true },
      );
    }

    const storageKey = `voxd:${conversationId}:last-event`;
    let lastEventId = Number(sessionStorage.getItem(storageKey) ?? 0);
    let delay = 500;

    await this.executePendingClientTools(conversationId);

    while (!this.abortController.signal.aborted) {
      await this.ensureFreshToken();
      const response = await fetch(
        `${this.baseUrl}/chat/v1/conversations/${conversationId}/events?after=${lastEventId}&live=true`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Last-Event-ID": String(lastEventId),
          },
          signal: this.abortController.signal,
        },
      );

      if (response.status === 401) {
        await this.renewFromCustomerBackend();
        continue;
      }
      if (!response.ok || !response.body) throw await responseError(response);

      try {
        for await (const event of parseSse(response.body)) {
          lastEventId = Number(event.id ?? lastEventId);
          sessionStorage.setItem(storageKey, String(lastEventId));
          onEvent?.(event);

          if (event.type === "client_tool.requested") {
            await this.executeClientTool(
              event.data.payload as VoxdClientToolCall,
            );
          }

          if (
            ["run.completed", "run.failed", "run.cancelled"].includes(event.type) &&
            (!runId || event.data.runId === runId)
          ) {
            if (onMessages) onMessages(await this.listMessages(conversationId));
            return event;
          }
        }
      } catch (error) {
        if (this.abortController.signal.aborted) return null;
        await wait(delay);
        delay = Math.min(delay * 2, 5_000);
      }
    }

    return null;
  }

  private async executePendingClientTools(conversationId: string) {
    const calls = await this.request<VoxdClientToolCall[]>(
      `/chat/v1/conversations/${conversationId}/client-tool-calls`,
    );

    for (const call of calls) await this.executeClientTool(call);
  }

  private async executeClientTool(call: VoxdClientToolCall) {
    const callId = call.callId ?? call.id;
    const name = call.name;

    if (
      !callId ||
      !name ||
      this.executingClientToolIds.has(callId) ||
      this.completedClientToolIds.has(callId)
    ) {
      return;
    }

    this.executingClientToolIds.add(callId);

    try {
      let result = this.pendingClientToolResults.get(callId);
      const registered = this.clientTools[name];

      if (!result && !registered?.execute) {
        result = {
          status: "failed",
          error: {
            code: "handler_unavailable",
            message: `No browser handler is registered for ${name}`,
          },
        };
      }

      if (!result && call.requiresConfirmation) {
        if (!this.confirmClientTool) {
          result = {
            status: "failed",
            error: {
              code: "confirmation_unavailable",
              message:
                "This action requires confirmation, but the website did not provide a confirmation handler",
            },
          };
        } else {
          const approved = await this.confirmClientTool({
            id: callId,
            name,
            input: call.input ?? {},
          });

          if (!approved) {
            result = {
              status: "failed",
              error: {
                code: "user_declined",
                message: "The user declined this browser action",
              },
            };
          }
        }
      }

      if (!result) {
        try {
          const output = await registered.execute(call.input ?? {}, {
            toolCallId: callId,
            name,
          });
          result = { status: "completed", output: output ?? null };
        } catch (cause) {
          result = {
            status: "failed",
            error: {
              code: "handler_failed",
              message:
                cause instanceof Error
                  ? cause.message.slice(0, 1_000)
                  : "The browser handler failed",
            },
          };
        }
      }

      this.pendingClientToolResults.set(callId, result);
      await this.submitClientToolResult(callId, result);
      this.pendingClientToolResults.delete(callId);
      this.completedClientToolIds.add(callId);
    } catch (cause) {
      if (
        cause instanceof Error &&
        "status" in cause &&
        cause.status === 409
      ) {
        this.pendingClientToolResults.delete(callId);
        this.completedClientToolIds.add(callId);
        return;
      }
      throw cause;
    } finally {
      this.executingClientToolIds.delete(callId);
    }
  }

  private async submitClientToolResult(
    callId: string,
    result: VoxdClientToolResult,
  ) {
    return this.request(`/chat/v1/client-tool-calls/${callId}/result`, {
      method: "POST",
      headers: { "Idempotency-Key": callId },
      body: JSON.stringify(result),
      keepalive: true,
    });
  }

  stop() {
    this.abortController?.abort();
  }

  private async request<T = unknown>(
    path: string,
    init: RequestOptions = {},
    refreshFirst = true,
  ): Promise<T> {
    if (refreshFirst) await this.ensureFreshToken();
    const response = await fetch(this.baseUrl + path, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
    });

    if (response.status === 401 && refreshFirst) {
      await this.renewFromCustomerBackend();
      return this.request<T>(path, init, false);
    }

    const payload = await readResponse<T>(response);
    return payload.data;
  }

  private async ensureFreshToken() {
    if (this.expiresAt - Date.now() < 60_000) await this.refresh();
  }

  private async renewFromCustomerBackend() {
    const response = await fetch(this.sessionEndpoint, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId: this.agentId,
        allowedOrigin: window.location.origin,
        clientTools: serializeClientTools(this.clientTools),
      }),
    });
    const payload = await readResponse<SessionPayload>(response);
    const data = payload.data ?? payload;
    this.token = data.token;
    this.expiresAt = new Date(data.expiresAt).getTime();
  }
}

function serializeClientTools(clientTools: VoxdClientTools) {
  return Object.entries(clientTools).map(([name, tool]) => ({
    name,
    description: tool.description,
    inputSchema: tool.inputSchema,
    requiresConfirmation: Boolean(tool.requiresConfirmation),
  }));
}

async function* parseSse(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      if (!frame || frame.startsWith(":")) continue;
      const fields = Object.fromEntries(
        frame
          .split("\n")
          .filter((line) => line.includes(":"))
          .map((line) => {
            const index = line.indexOf(":");
            return [line.slice(0, index), line.slice(index + 1).trimStart()];
          }),
      );
      if (fields.data) {
        yield {
          id: fields.id,
          type: fields.event ?? "message",
          data: JSON.parse(fields.data) as VoxdRunEvent,
        } satisfies VoxdStreamEvent;
      }
    }
  }
}

async function readResponse<T>(response: Response): Promise<{ data: T } & Partial<T>> {
  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(
      payload.error?.message ?? `VOXD request failed (${response.status})`,
    );
    Object.assign(error, { status: response.status, payload });
    throw error;
  }
  return payload;
}

async function responseError(response: Response) {
  try {
    return new Error(
      (await response.json()).error?.message ??
        `VOXD stream failed (${response.status})`,
    );
  } catch {
    return new Error(`VOXD stream failed (${response.status})`);
  }
}

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
