"use client";

import { bodoniModa } from "@/fonts";
import {
  VoxdChat,
  type VoxdMessage,
  type VoxdRunEvent,
} from "@/utils/voxdBrowser";
import {
  ArrowUp,
  Check,
  MessageCircleQuestion,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Square,
} from "lucide-react";
import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const VOXD_BASE_URL = "https://agents.voxd.ai";
const VOXD_AGENT_ID = "c6c212b2-6c02-4d4b-82e0-d2d869865d65";
const VISITOR_STORAGE_KEY = "sapperton-school:visitor-id";

const suggestions = [
  "When are the next term dates?",
  "How do I arrange a school visit?",
  "What clubs are available?",
  "Tell me about admissions",
];

function messageText(message: VoxdMessage) {
  return message.parts.map((part) => part.text).join("\n");
}

function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g);

  return parts.map((part, index) => {
    const bold = part.match(/^\*\*(.+)\*\*$/);
    if (bold) return <strong key={index}>{bold[1]}</strong>;

    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) {
      return (
        <a
          key={index}
          href={link[2]}
          target="_blank"
          rel="noreferrer"
          className="font-medium underline decoration-current/40 underline-offset-2 hover:decoration-current"
        >
          {link[1]}
        </a>
      );
    }

    return part;
  });
}

function ChatText({ text }: { text: string }) {
  return (
    <div className="space-y-3">
      {text.split(/\n{2,}/).map((paragraph, index) => {
        const lines = paragraph.split("\n");
        const isList = lines.every((line) => /^[-*] /.test(line));

        if (isList) {
          return (
            <ul
              key={index}
              className="list-disc space-y-1.5 pl-5 marker:text-sapperton-green"
            >
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>
                  <InlineText text={line.replace(/^[-*] /, "")} />
                </li>
              ))}
            </ul>
          );
        }

        return (
          <div key={index} className="space-y-1.5">
            {lines.map((line, lineIndex) => {
              const listItem = line.match(/^[-*] (.+)$/);
              if (listItem) {
                return (
                  <div key={lineIndex} className="flex gap-2 pl-1">
                    <span aria-hidden="true" className="text-sapperton-green">
                      •
                    </span>
                    <span>
                      <InlineText text={listItem[1]} />
                    </span>
                  </div>
                );
              }

              return (
                <p key={lineIndex} className="whitespace-pre-wrap">
                  <InlineText text={line} />
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function SchoolAssistant() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<VoxdMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [streamedText, setStreamedText] = useState("");
  const [activity, setActivity] = useState("Getting things ready…");
  const [status, setStatus] = useState<
    "starting" | "ready" | "thinking" | "error"
  >("starting");
  const [error, setError] = useState<string | null>(null);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const chatRef = useRef<VoxdChat | null>(null);

  const initialise = useCallback(async () => {
    chatRef.current?.stop();
    setStatus("starting");
    setError(null);
    setActivity("Getting things ready…");
    setMessages([]);
    setStreamedText("");

    try {
      let visitorId = localStorage.getItem(VISITOR_STORAGE_KEY);
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
      }

      const { chat, conversation } = await VoxdChat.resumeOrCreate({
        baseUrl: VOXD_BASE_URL,
        sessionEndpoint: "/api/voxd/session",
        agentId: VOXD_AGENT_ID,
        visitorId,
        conversationTitle: "Sapperton School website chat",
      });
      const restoredMessages = await chat.listMessages(conversation.id);

      chatRef.current = chat;
      setConversationId(conversation.id);
      setMessages(restoredMessages);
      setStatus("ready");
      setActivity(restoredMessages.length > 0 ? "Chat restored" : "Ready to help");
    } catch (cause) {
      console.error(cause);
      setStatus("error");
      setError(
        cause instanceof Error
          ? cause.message
          : "The assistant is taking a short break. Please try again.",
      );
    }
  }, []);

  useEffect(() => {
    void initialise();
    return () => chatRef.current?.stop();
  }, [initialise]);

  const streamRun = useCallback(
    async (chat: VoxdChat, currentConversationId: string, runId: string) => {
      try {
        const terminalEvent = await chat.stream(currentConversationId, {
          runId,
          onEvent: ({ data: event }: { data: VoxdRunEvent }) => {
            if (event.runId !== runId) return;

            if (event.type === "run.started") {
              setActivity("Looking that up…");
            } else if (event.type === "message.delta") {
              const delta = event.payload.delta;
              if (typeof delta === "string") {
                setStreamedText((current) => current + delta);
                setActivity("Writing a response…");
              }
            } else if (event.type === "tool.started") {
              setActivity(
                typeof event.payload.label === "string"
                  ? event.payload.label
                  : "Checking school information…",
              );
            }
          },
          onMessages: (canonicalMessages) => {
            setMessages(canonicalMessages);
            setStreamedText("");
          },
        });

        if (terminalEvent?.type === "run.completed") {
          setActivity("Ready to help");
          setError(null);
        } else if (terminalEvent?.type === "run.cancelled") {
          setActivity("Response stopped");
        } else if (terminalEvent?.type === "run.failed") {
          throw new Error("I couldn’t complete that response. Please try again.");
        }
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "The response was interrupted. Please try again.",
        );
      } finally {
        setActiveRunId(null);
        setStatus("ready");
      }
    },
    [],
  );

  const startNewChat = async () => {
    const chat = chatRef.current;
    if (!chat || status !== "ready") return;

    setStatus("starting");
    setError(null);
    setActivity("Starting a new chat…");

    try {
      const conversation = await chat.createConversation(
        "Sapperton School website chat",
      );
      chat.rememberConversation(conversation.id);
      setConversationId(conversation.id);
      setMessages([]);
      setStreamedText("");
      setActivity("Ready to help");
      setStatus("ready");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "A new chat could not be started.",
      );
      setStatus("ready");
      setActivity("Ready to help");
    }
  };

  const sendMessage = async (text: string) => {
    const cleanText = text.trim();
    const chat = chatRef.current;
    if (!cleanText || !chat || !conversationId || status !== "ready") return;

    const optimisticMessage: VoxdMessage = {
      id: `local-${crypto.randomUUID()}`,
      role: "user",
      parts: [{ type: "text", text: cleanText }],
    };

    setMessages((current) => [...current, optimisticMessage]);
    setDraft("");
    setError(null);
    setStreamedText("");
    setStatus("thinking");
    setActivity("Thinking…");

    try {
      const queued = await chat.sendMessage(conversationId, cleanText);
      setActiveRunId(queued.run.id);
      void streamRun(chat, conversationId, queued.run.id);
    } catch (cause) {
      setMessages((current) =>
        current.filter((item) => item.id !== optimisticMessage.id),
      );
      setDraft(cleanText);
      setStatus("ready");
      setActivity("Ready to help");
      setError(
        cause instanceof Error
          ? cause.message
          : "Your message could not be sent.",
      );
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(draft);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const cancelRun = async () => {
    const chat = chatRef.current;
    if (!activeRunId || !chat) return;
    await chat.cancel(activeRunId).catch(() => undefined);
    setActivity("Stopping…");
  };

  const hasConversation = messages.length > 0 || Boolean(streamedText);

  return (
    <section
      id="school-assistant"
      aria-labelledby="school-assistant-title"
      className="relative overflow-hidden bg-sapperton-green px-5 py-16 sm:px-8 md:py-24"
    >
      <div className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -left-16 top-28 h-52 w-52 rounded-full border border-white/10" />
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-16">
        <div className="max-w-xl text-white">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
            <Sparkles aria-hidden="true" className="h-4 w-4 text-[#f6d47a]" />
            Sapperton School assistant
          </div>
          <h2
            id="school-assistant-title"
            className={`${bodoniModa.className} text-4xl leading-[1.08] tracking-tight sm:text-5xl md:text-6xl`}
          >
            A helpful answer,
            <br /> right when you need it.
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/80">
            Ask about school life, admissions, dates, clubs or arranging a visit.
            Our assistant can point you in the right direction in seconds.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm text-white/70">
            <ShieldCheck aria-hidden="true" className="h-5 w-5 text-[#f6d47a]" />
            Please don’t share sensitive personal information in the chat.
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] bg-[#f7f8f5] shadow-[0_30px_80px_rgba(10,35,28,0.35)] ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b border-black/8 bg-white px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sapperton-green text-white shadow-sm">
                <MessageCircleQuestion aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[#173d32]">Ask Sapperton</h3>
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${status === "error" ? "bg-amber-500" : "bg-emerald-500"}`}
                  />
                  {status === "starting" ? "Connecting…" : activity}
                </p>
              </div>
            </div>
            {hasConversation && status === "ready" ? (
              <button
                type="button"
                onClick={() => void startNewChat()}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-sapperton-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapperton-green"
                aria-label="Start a new chat"
                title="Start a new chat"
              >
                <RefreshCw aria-hidden="true" className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div
            className="h-[29rem] overflow-y-auto px-4 py-6 sm:px-6"
            aria-live="polite"
          >
            {!hasConversation ? (
              <div className="flex h-full flex-col justify-center">
                <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-white px-4 py-3 text-[0.95rem] leading-6 text-slate-700 shadow-sm ring-1 ring-black/5">
                  Hello! I’m here to help with questions about Sapperton School.
                  What would you like to know?
                </div>
                <p className="mb-3 mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Popular questions
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      disabled={status !== "ready"}
                      onClick={() => void sendMessage(suggestion)}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left text-sm font-medium leading-5 text-[#285d4c] transition hover:-translate-y-0.5 hover:border-sapperton-green/40 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapperton-green disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 text-[0.95rem] leading-6 shadow-sm sm:max-w-[78%] ${message.role === "user" ? "rounded-br-md bg-sapperton-green text-white" : "rounded-tl-md bg-white text-slate-700 ring-1 ring-black/5"}`}
                    >
                      <ChatText text={messageText(message)} />
                    </div>
                  </div>
                ))}

                {status === "thinking" ? (
                  <div className="flex justify-start">
                    <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-white px-4 py-3 text-[0.95rem] leading-6 text-slate-700 shadow-sm ring-1 ring-black/5 sm:max-w-[78%]">
                      {streamedText ? (
                        <ChatText text={streamedText} />
                      ) : (
                        <div
                          className="flex h-6 items-center gap-1.5"
                          aria-label={activity}
                        >
                          {[0, 1, 2].map((dot) => (
                            <span
                              key={dot}
                              className="h-1.5 w-1.5 animate-bounce rounded-full bg-sapperton-green/60"
                              style={{ animationDelay: `${dot * 120}ms` }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="border-t border-black/8 bg-white p-3 sm:p-4">
            {error ? (
              <div
                role="alert"
                className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900"
              >
                <span>{error}</span>
                {status === "error" ? (
                  <button
                    type="button"
                    onClick={() => void initialise()}
                    className="shrink-0 font-semibold underline underline-offset-2"
                  >
                    Try again
                  </button>
                ) : null}
              </div>
            ) : null}
            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-[#f7f8f5] p-2 focus-within:border-sapperton-green/50 focus-within:ring-3 focus-within:ring-sapperton-green/10"
            >
              <label htmlFor="school-chat-message" className="sr-only">
                Ask the Sapperton School assistant
              </label>
              <textarea
                id="school-chat-message"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={status === "starting" || status === "error"}
                rows={1}
                maxLength={4000}
                placeholder={
                  status === "starting"
                    ? "Connecting to the assistant…"
                    : "Ask a question about Sapperton…"
                }
                className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-base leading-6 text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
              />
              {status === "thinking" ? (
                <button
                  type="button"
                  onClick={() => void cancelRun()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
                  aria-label="Stop response"
                >
                  <Square aria-hidden="true" className="h-3.5 w-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!draft.trim() || status !== "ready"}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sapperton-green text-white shadow-sm transition hover:bg-[#285d4c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapperton-green disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  <ArrowUp aria-hidden="true" className="h-5 w-5" />
                </button>
              )}
            </form>
            <div className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[0.7rem] text-slate-400">
              <Check aria-hidden="true" className="h-3 w-3" />
              Check important details with the school office.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
