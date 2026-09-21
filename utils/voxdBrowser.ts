export type VoxdTextPart = { type: "text"; text: string };

export type VoxdFilePart = {
  type: "file";
  id: string;
  kind: "image" | "document";
  mediaType: string;
  filename: string;
  url: string;
  thumbnailUrl: string | null;
  size: number;
  width: number | null;
  height: number | null;
  extractedText: string | null;
  storageKey: string;
  signature: string;
};

export type VoxdMessagePart = VoxdTextPart | VoxdFilePart;

export type VoxdMessage = {
  id: string;
  role: "user" | "assistant";
  parts: VoxdMessagePart[];
};

export type VoxdConversation = {
  id: string;
  title?: string | null;
  lastClientMessageAt?: string | null;
  sessionExpiresAt?: string | null;
  sessionTimedOut?: boolean;
};

export function isConversationTimedOut(
  conversation: VoxdConversation | null | undefined,
  at = Date.now(),
) {
  return Boolean(
    conversation?.sessionTimedOut ||
      (conversation?.sessionExpiresAt &&
        Date.parse(conversation.sessionExpiresAt) <= at),
  );
}

export type VoxdRunEvent = {
  schemaVersion: number;
  id: string;
  sequence: number;
  conversationId: string;
  runId: string | null;
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
  onMessages?: (
    messages: VoxdMessage[],
    event: VoxdStreamEvent,
  ) => void;
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
  private conversationAliases = new Map<string, string>();
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
    const remembered =
      resumable.find((item) => item.id === rememberedId) ?? null;
    let conversation =
      remembered && !isConversationTimedOut(remembered)
        ? remembered
        : resumable.find((item) => !isConversationTimedOut(item)) ?? null;

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
    const activeId = this.resolveConversationId(conversationId);
    return this.request<VoxdMessage[]>(
      `/chat/v1/conversations/${activeId}/messages`,
    );
  }

  async uploadAttachment(conversationId: string, file: File) {
    conversationId = this.resolveConversationId(conversationId);
    await this.ensureFreshToken();
    const form = new FormData();
    form.append("file", file, file.name);

    const upload = async () =>
      fetch(
        `${this.baseUrl}/chat/v1/conversations/${conversationId}/attachments`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${this.token}` },
          body: form,
        },
      );

    let response = await upload();
    if (response.status === 401) {
      await this.renewFromCustomerBackend();
      response = await upload();
    }

    const payload = await readResponse<VoxdFilePart>(response);
    return payload.data;
  }

  async sendMessage(
    conversationId: string,
    text: string,
    files: VoxdFilePart[] = [],
  ) {
    const requestedId = conversationId;
    const activeId = this.resolveConversationId(conversationId);
    const parts: VoxdMessagePart[] = [
      ...(text ? [{ type: "text" as const, text }] : []),
      ...files,
    ];

    const result = await this.request<{
      conversation: VoxdConversation;
      message: VoxdMessage;
      run: { id: string };
      eventUrl: string;
    }>(`/chat/v1/conversations/${activeId}/messages`, {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ parts }),
    });

    const nextId = result.conversation?.id;
    if (nextId) {
      if (nextId !== activeId) {
        this.conversationAliases.set(requestedId, nextId);
        this.conversationAliases.set(activeId, nextId);
      }
      this.rememberConversation(nextId);
    }

    return result;
  }

  async cancel(runId: string) {
    return this.request(`/chat/v1/runs/${runId}/cancel`, {
      method: "POST",
      body: "{}",
    });
  }

  async refresh() {
    try {
      const data = await this.request<{ token: string; expiresAt: string }>(
        "/chat/v1/session/refresh",
        { method: "POST", body: JSON.stringify({ ttlSeconds: 900 }) },
        false,
      );
      this.token = data.token;
      this.expiresAt = new Date(data.expiresAt).getTime();
    } catch (cause) {
      if (
        cause instanceof Error &&
        "status" in cause &&
        cause.status === 401
      ) {
        await this.renewFromCustomerBackend();
        return;
      }
      throw cause;
    }
  }

  async stream(
    conversationId: string,
    { onEvent, onMessages, signal }: StreamOptions = {},
  ) {
    conversationId = this.resolveConversationId(conversationId);
    this.abortController?.abort();
    const abortController = new AbortController();
    this.abortController = abortController;
    if (signal) {
      signal.addEventListener(
        "abort",
        () => abortController.abort(),
        { once: true },
      );
    }

    const storageKey = `voxd:${conversationId}:last-event`;
    let lastEventId = Number(sessionStorage.getItem(storageKey) ?? 0);
    let delay = 500;

    let pendingClientToolsChecked = false;

    while (!abortController.signal.aborted) {
      try {
        if (!pendingClientToolsChecked) {
          await this.executePendingClientTools(conversationId);
          pendingClientToolsChecked = true;
        }
        await this.ensureFreshToken();
        const streamUrl = new URL(
          `/chat/v1/conversations/${conversationId}/events`,
          `${this.baseUrl}/`,
        );
        streamUrl.searchParams.set("after", String(lastEventId));
        streamUrl.searchParams.set("live", "true");
        const response = await fetch(streamUrl, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Last-Event-ID": String(lastEventId),
          },
          signal: abortController.signal,
        });

        if (response.status === 401) {
          await this.renewFromCustomerBackend();
          continue;
        }
        if (!response.ok || !response.body) throw await responseError(response);

        for await (const event of parseSse(response.body)) {
          const sequence = Number(event.data.sequence ?? event.id);
          if (Number.isFinite(sequence)) lastEventId = sequence;
          sessionStorage.setItem(storageKey, String(lastEventId));
          delay = 500;
          onEvent?.(event);

          if (event.type === "client_tool.requested") {
            await this.executeClientTool(
              event.data.payload as VoxdClientToolCall,
            );
          }

          if (event.type === "message.completed" && onMessages) {
            let reloadDelay = 500;
            while (!abortController.signal.aborted) {
              try {
                onMessages(await this.listMessages(conversationId), event);
                break;
              } catch {
                if (abortController.signal.aborted) return null;
                await wait(reloadDelay);
                reloadDelay = Math.min(reloadDelay * 2, 5_000);
              }
            }
          }
        }

        if (abortController.signal.aborted) return null;
        await wait(delay);
        delay = Math.min(delay * 2, 5_000);
      } catch (error) {
        if (abortController.signal.aborted) return null;
        await wait(delay);
        delay = Math.min(delay * 2, 5_000);
      }
    }

    return null;
  }

  private async executePendingClientTools(conversationId: string) {
    conversationId = this.resolveConversationId(conversationId);
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

  private resolveConversationId(conversationId: string) {
    let resolved = conversationId;
    const visited = new Set<string>();

    while (this.conversationAliases.has(resolved) && !visited.has(resolved)) {
      visited.add(resolved);
      resolved = this.conversationAliases.get(resolved) ?? resolved;
    }

    return resolved;
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
