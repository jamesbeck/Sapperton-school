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
  type: string;
  payload: Record<string, unknown>;
};

export type VoxdStreamEvent = {
  id?: string;
  type: string;
  data: VoxdRunEvent;
};

type SessionPayload = {
  token: string;
  expiresAt: string;
  baseUrl?: string;
  conversation?: VoxdConversation;
  conversations?: VoxdConversation[];
};

type RequestOptions = RequestInit & { headers?: Record<string, string> };

type ResumeOptions = {
  baseUrl: string;
  sessionEndpoint: string;
  agentId: string;
  visitorId: string;
  conversationTitle?: string;
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
  private abortController: AbortController | null = null;

  constructor({
    baseUrl,
    token,
    expiresAt,
    sessionEndpoint,
    agentId,
  }: {
    baseUrl: string;
    token: string;
    expiresAt: string;
    sessionEndpoint: string;
    agentId: string;
  }) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.token = token;
    this.expiresAt = new Date(expiresAt).getTime();
    this.sessionEndpoint = sessionEndpoint;
    this.agentId = agentId;
  }

  static async resumeOrCreate({
    baseUrl,
    sessionEndpoint,
    agentId,
    visitorId,
    conversationTitle = "Website chat",
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
      }),
    });
    const payload = await readResponse<SessionPayload>(response);
    const data = payload.data ?? payload;
    this.token = data.token;
    this.expiresAt = new Date(data.expiresAt).getTime();
  }
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
