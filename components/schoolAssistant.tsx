"use client";

import {
  createActivityState,
  reduceActivityState,
  shouldShowActivity,
  VoxdChat,
  type VoxdFilePart,
  type VoxdActivityState,
  type VoxdMessage,
  type VoxdMessagePart,
  type VoxdRunEvent,
} from "@/utils/voxdBrowser";
import {
  NAVIGATE_TO_CONTENT_TOOL,
  navigateToContentDefinition,
} from "@/utils/voxdClientTools";
import {
  ArrowUp,
  Check,
  Download,
  FileText,
  ImageIcon,
  MessageCircleQuestion,
  Paperclip,
  RefreshCw,
  Square,
  UploadCloud,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const VOXD_BASE_URL = "https://agents.voxd.ai";
const VOXD_AGENT_ID = "c6c212b2-6c02-4d4b-82e0-d2d869865d65";
const VISITOR_STORAGE_KEY = "sapperton-school:visitor-id";
const CHAT_BOTTOM_THRESHOLD = 72;
const MAX_ATTACHMENTS = 10;
const MAX_ATTACHMENT_BYTES = 50 * 1024 * 1024;

const suggestions = [
  "When are the next term dates?",
  "How do I arrange a school visit?",
  "What clubs are available?",
  "Tell me about admissions",
];

function navigationPath(input: Record<string, unknown>) {
  const destination = input.destination;
  const identifier = input.identifier;

  const requireIdentifier = () => {
    if (
      typeof identifier !== "string" ||
      !/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(identifier)
    ) {
      throw new Error(`A valid identifier is required for ${destination}`);
    }

    return identifier
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
  };

  switch (destination) {
    case "home":
      return "/";
    case "content_page":
      return `/${requireIdentifier()}`;
    case "news_index":
      return "/news";
    case "news_article":
      return `/news/${requireIdentifier()}`;
    case "events_index":
      return "/events";
    case "event":
      return `/events/${requireIdentifier()}`;
    case "classes_index":
      return "/classes";
    case "class":
      return `/classes/${requireIdentifier()}`;
    case "staff_index":
      return "/our-school/staff";
    case "staff_member":
      return `/our-school/staff/${requireIdentifier()}`;
    case "letters":
      return "/letters";
    case "term_dates":
      return "/term-dates";
    case "contact":
      return "/contact-us";
    default:
      throw new Error("The requested website destination is not available");
  }
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function MessageAttachment({ part }: { part: VoxdFilePart }) {
  if (part.kind === "image") {
    return (
      <a
        href={part.url}
        target="_blank"
        rel="noreferrer"
        className="group block overflow-hidden rounded-xl bg-black/5 ring-1 ring-black/10"
      >
        {/* The attachment host is configured in next.config.ts; dimensions come from Voxd. */}
        <img
          src={part.thumbnailUrl ?? part.url}
          alt={part.filename}
          width={part.width ?? 640}
          height={part.height ?? 480}
          className="max-h-64 w-full object-cover"
        />
        <span className="flex items-center gap-2 px-3 py-2 text-xs font-medium">
          <ImageIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{part.filename}</span>
          <Download aria-hidden="true" className="h-3.5 w-3.5 opacity-60 transition group-hover:opacity-100" />
        </span>
      </a>
    );
  }

  return (
    <a
      href={part.url}
      target="_blank"
      rel="noreferrer"
      download={part.filename}
      className="group flex min-w-0 items-center gap-3 rounded-xl bg-black/5 px-3 py-2.5 ring-1 ring-black/10 transition hover:bg-black/10"
    >
      <FileText aria-hidden="true" className="h-5 w-5 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{part.filename}</span>
        <span className="block text-xs opacity-70">{formatFileSize(part.size)}</span>
      </span>
      <Download aria-hidden="true" className="h-4 w-4 shrink-0 opacity-60 transition group-hover:opacity-100" />
    </a>
  );
}

function MessageParts({ parts }: { parts: VoxdMessagePart[] }) {
  return (
    <div className="space-y-2.5">
      {parts.map((part, index) =>
        part.type === "text" ? (
          part.text ? <ChatText key={`text-${index}`} text={part.text} /> : null
        ) : (
          <MessageAttachment key={part.id} part={part} />
        ),
      )}
    </div>
  );
}

function InlineText({ text }: { text: string }) {
  const parts = text.split(
    /(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\)|https?:\/\/[^\s<]+)/g,
  );

  return parts.map((part, index) => {
    const bold = part.match(/^\*\*(.+)\*\*$/);
    if (bold) {
      return (
        <strong key={index}>
          <InlineText text={bold[1]} />
        </strong>
      );
    }

    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) {
      return (
        <a
          key={index}
          href={link[2]}
          target="_blank"
          rel="noreferrer"
          className="pointer-events-auto cursor-pointer break-all font-medium underline decoration-current/40 underline-offset-2 [overflow-wrap:anywhere] hover:decoration-current"
        >
          <InlineText text={link[1]} />
        </a>
      );
    }

    const bareLink = part.match(/^(https?:\/\/[^\s<]+)$/);
    if (bareLink) {
      return (
        <a
          key={index}
          href={bareLink[1]}
          target="_blank"
          rel="noreferrer"
          className="pointer-events-auto cursor-pointer break-all font-medium underline decoration-current/40 underline-offset-2 [overflow-wrap:anywhere] hover:decoration-current"
        >
          {bareLink[1]}
        </a>
      );
    }

    return part;
  });
}

function ChatText({ text }: { text: string }) {
  const normalizedText = text.replace(
    /\]\s*\(\s*(https?:\/\/[^)\s]+)\s*\)/g,
    "]($1)",
  );

  return (
    <div className="min-w-0 space-y-3 overflow-hidden [overflow-wrap:anywhere]">
      {normalizedText.split(/\n{2,}/).map((paragraph, index) => {
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
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<VoxdMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [assistantStatus, setAssistantStatus] = useState(
    "Getting things ready…",
  );
  const [visibleActivityLabel, setVisibleActivityLabel] = useState<
    string | null
  >(null);
  const [status, setStatus] = useState<
    "starting" | "ready" | "uploading" | "thinking" | "error"
  >("starting");
  const [error, setError] = useState<string | null>(null);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const chatRef = useRef<VoxdChat | null>(null);
  const chatWindowRef = useRef<HTMLDivElement | null>(null);
  const followLatestRef = useRef(true);
  const autoScrollPausedRef = useRef(false);
  const autoScrollUntilRef = useRef(0);
  const touchYRef = useRef<number | null>(null);
  const dragDepthRef = useRef(0);
  const activityRef = useRef<VoxdActivityState>(createActivityState());
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const clientTools = useMemo(
    () => ({
      [NAVIGATE_TO_CONTENT_TOOL]: {
        description: navigateToContentDefinition.description,
        inputSchema: navigateToContentDefinition.inputSchema,
        requiresConfirmation: false,
        execute: async (input: Record<string, unknown>) => {
          const path = navigationPath(input);
          router.push(path);

          return {
            navigated: true,
            destination: input.destination,
            identifier: input.identifier ?? null,
          };
        },
      },
    }),
    [router],
  );

  useEffect(() => {
    if (isOpen) return;

    const interval = window.setInterval(() => {
      setSuggestionIndex((current) => (current + 1) % suggestions.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const resetActivity = useCallback(() => {
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    revealTimerRef.current = null;
    activityRef.current = createActivityState();
    setVisibleActivityLabel(null);
  }, []);

  const applyActivityEvent = useCallback(
    (event: Parameters<typeof reduceActivityState>[1]) => {
      const nextActivity = reduceActivityState(activityRef.current, event);
      activityRef.current = nextActivity;

      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;

      const visible = shouldShowActivity(nextActivity);
      setVisibleActivityLabel(visible ? nextActivity.label : null);

      if (nextActivity.active && !visible) {
        revealTimerRef.current = setTimeout(() => {
          const currentActivity = activityRef.current;
          setVisibleActivityLabel(
            shouldShowActivity(currentActivity) ? currentActivity.label : null,
          );
        }, 800);
      }
    },
    [],
  );

  const handleChatScroll = useCallback(() => {
    const chatWindow = chatWindowRef.current;
    if (!chatWindow || autoScrollPausedRef.current) return;

    const distanceFromBottom =
      chatWindow.scrollHeight -
      chatWindow.scrollTop -
      chatWindow.clientHeight;

    if (distanceFromBottom <= CHAT_BOTTOM_THRESHOLD) {
      followLatestRef.current = true;
    } else if (Date.now() > autoScrollUntilRef.current) {
      autoScrollPausedRef.current = true;
      followLatestRef.current = false;
    }
  }, []);

  const stopFollowingLatest = useCallback(() => {
    const chatWindow = chatWindowRef.current;
    if (chatWindow) {
      chatWindow.scrollTo({
        top: chatWindow.scrollTop,
        behavior: "auto",
      });
    }

    autoScrollPausedRef.current = true;
    followLatestRef.current = false;
    autoScrollUntilRef.current = 0;
  }, []);

  useLayoutEffect(() => {
    const chatWindow = chatWindowRef.current;
    if (!chatWindow || !followLatestRef.current) return;

    const animationFrame = requestAnimationFrame(() => {
      autoScrollUntilRef.current = Date.now() + 600;
      chatWindow.scrollTo({
        top: chatWindow.scrollHeight,
        behavior: "smooth",
      });
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [messages, streamedText, visibleActivityLabel, status]);

  const initialise = useCallback(async () => {
    chatRef.current?.stop();
    autoScrollPausedRef.current = false;
    followLatestRef.current = true;
    resetActivity();
    setStatus("starting");
    setError(null);
    setAssistantStatus("Getting things ready…");
    setMessages([]);
    setPendingFiles([]);
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
        clientTools,
      });
      const restoredMessages = await chat.listMessages(conversation.id);

      chatRef.current = chat;
      setConversationId(conversation.id);
      setMessages(restoredMessages);
      setStatus("ready");
      setAssistantStatus(
        restoredMessages.length > 0 ? "Chat restored" : "Ready to help",
      );
    } catch (cause) {
      console.error(cause);
      setStatus("error");
      setError(
        cause instanceof Error
          ? cause.message
          : "The assistant is taking a short break. Please try again.",
      );
    }
  }, [clientTools, resetActivity]);

  useEffect(() => {
    void initialise();
    return () => {
      chatRef.current?.stop();
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, [initialise]);

  const streamRun = useCallback(
    async (chat: VoxdChat, currentConversationId: string, runId: string) => {
      try {
        const terminalEvent = await chat.stream(currentConversationId, {
          runId,
          onEvent: (streamEvent) => {
            const event: VoxdRunEvent = streamEvent.data;
            if (event.runId !== runId) return;

            applyActivityEvent(streamEvent);

            if (event.type === "message.delta") {
              const delta = event.payload.delta;
              if (typeof delta === "string") {
                setStreamedText((current) => current + delta);
              }
            }
          },
          onMessages: (canonicalMessages) => {
            setMessages(canonicalMessages);
            setStreamedText("");
          },
        });

        if (terminalEvent?.type === "run.completed") {
          setAssistantStatus("Ready to help");
          setError(null);
        } else if (terminalEvent?.type === "run.cancelled") {
          setAssistantStatus("Response stopped");
        } else if (terminalEvent?.type === "run.failed") {
          throw new Error("I couldn’t complete that response. Please try again.");
        }
      } catch (cause) {
        resetActivity();
        setAssistantStatus("Ready to help");
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
    [applyActivityEvent, resetActivity],
  );

  const startNewChat = async () => {
    const chat = chatRef.current;
    if (!chat || status !== "ready") return;

    setStatus("starting");
    setError(null);
    autoScrollPausedRef.current = false;
    followLatestRef.current = true;
    resetActivity();
    setAssistantStatus("Starting a new chat…");

    try {
      const conversation = await chat.createConversation(
        "Sapperton School website chat",
      );
      chat.rememberConversation(conversation.id);
      setConversationId(conversation.id);
      setMessages([]);
      setPendingFiles([]);
      setStreamedText("");
      setAssistantStatus("Ready to help");
      setStatus("ready");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "A new chat could not be started.",
      );
      setStatus("ready");
      setAssistantStatus("Ready to help");
    }
  };

  const addFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;

    const oversized = files.find((file) => file.size > MAX_ATTACHMENT_BYTES);
    if (oversized) {
      setError(`${oversized.name} is larger than the 50 MB upload limit.`);
      return;
    }

    const empty = files.find((file) => file.size === 0);
    if (empty) {
      setError(`${empty.name} is empty and cannot be uploaded.`);
      return;
    }

    setPendingFiles((current) => {
      const available = MAX_ATTACHMENTS - current.length;
      if (files.length > available) {
        setError(`You can attach up to ${MAX_ATTACHMENTS} files to one message.`);
      } else {
        setError(null);
      }
      return [...current, ...files.slice(0, Math.max(available, 0))];
    });
  }, []);

  const sendMessage = async (text: string, files = pendingFiles) => {
    const cleanText = text.trim();
    const chat = chatRef.current;
    if (
      (!cleanText && files.length === 0) ||
      !chat ||
      !conversationId ||
      status !== "ready"
    ) return;

    autoScrollPausedRef.current = false;
    followLatestRef.current = true;
    setError(null);
    setStreamedText("");
    setStatus(files.length > 0 ? "uploading" : "thinking");
    resetActivity();
    setAssistantStatus(files.length > 0 ? "Uploading files…" : "Thinking…");

    let optimisticMessageId: string | null = null;
    try {
      const uploaded = await Promise.all(
        files.map((file) => chat.uploadAttachment(conversationId, file)),
      );
      const optimisticMessage: VoxdMessage = {
        id: `local-${crypto.randomUUID()}`,
        role: "user",
        parts: [
          ...(cleanText ? [{ type: "text" as const, text: cleanText }] : []),
          ...uploaded,
        ],
      };
      optimisticMessageId = optimisticMessage.id;

      setMessages((current) => [...current, optimisticMessage]);
      setDraft("");
      setPendingFiles([]);
      setStatus("thinking");
      setAssistantStatus("Thinking…");

      const queued = await chat.sendMessage(conversationId, cleanText, uploaded);
      setActiveRunId(queued.run.id);
      void streamRun(chat, conversationId, queued.run.id);
    } catch (cause) {
      if (optimisticMessageId) {
        setMessages((current) =>
          current.filter((message) => message.id !== optimisticMessageId),
        );
      }
      setDraft(cleanText);
      setPendingFiles(files);
      setStatus("ready");
      resetActivity();
      setAssistantStatus("Ready to help");
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
    setAssistantStatus("Stopping…");
  };

  const hasConversation = messages.length > 0 || Boolean(streamedText);
  const currentSuggestion = suggestions[suggestionIndex];

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <div className="fixed inset-0 z-[110]">
            <motion.button
              type="button"
              aria-label="Close school assistant"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 hidden bg-[#102d25]/35 backdrop-blur-[2px] sm:block"
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-labelledby="school-assistant-title"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onDragEnter={(event) => {
                if (!event.dataTransfer.types.includes("Files")) return;
                event.preventDefault();
                dragDepthRef.current += 1;
                setIsDraggingFiles(true);
              }}
              onDragOver={(event) => {
                if (!event.dataTransfer.types.includes("Files")) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
              }}
              onDragLeave={(event) => {
                if (!event.dataTransfer.types.includes("Files")) return;
                event.preventDefault();
                dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
                if (dragDepthRef.current === 0) setIsDraggingFiles(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                dragDepthRef.current = 0;
                setIsDraggingFiles(false);
                if (status === "ready") addFiles(Array.from(event.dataTransfer.files));
              }}
              className="absolute inset-0 flex min-h-0 flex-col overflow-hidden bg-[#f7f8f5] shadow-[-24px_0_70px_rgba(10,35,28,0.22)] sm:inset-y-3 sm:left-auto sm:right-3 sm:w-[min(30rem,calc(100vw-1.5rem))] sm:rounded-[1.5rem] sm:ring-1 sm:ring-black/10"
            >
              {isDraggingFiles ? (
                <div className="pointer-events-none absolute inset-3 z-30 flex items-center justify-center rounded-[1.25rem] border-2 border-dashed border-sapperton-green bg-white/95 shadow-xl">
                  <div className="flex flex-col items-center gap-3 px-6 text-center text-sapperton-green">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sapperton-green/10">
                      <UploadCloud aria-hidden="true" className="h-7 w-7" />
                    </span>
                    <span>
                      <strong className="block text-base">Drop files to attach</strong>
                      <span className="mt-1 block text-xs text-slate-500">Up to 10 files, 50 MB each</span>
                    </span>
                  </div>
                </div>
              ) : null}
              <div className="flex items-center justify-between border-b border-black/8 bg-white px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sapperton-green text-white shadow-sm">
                <MessageCircleQuestion aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <h2
                  id="school-assistant-title"
                  className="font-semibold text-[#173d32]"
                >
                  Ask Sapperton
                </h2>
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${status === "error" ? "bg-amber-500" : "bg-emerald-500"}`}
                  />
                  {status === "starting" ? "Connecting…" : assistantStatus}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {hasConversation && status === "ready" ? (
                <button
                  type="button"
                  onClick={() => void startNewChat()}
                  className="rounded-full p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-sapperton-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapperton-green"
                  aria-label="Start a new chat"
                  title="Start a new chat"
                >
                  <RefreshCw aria-hidden="true" className="h-4 w-4" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  requestAnimationFrame(() => launcherRef.current?.focus());
                }}
                className="rounded-full p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-sapperton-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapperton-green"
                aria-label="Close school assistant"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            ref={chatWindowRef}
            onScroll={handleChatScroll}
            onWheel={(event) => {
              if (event.deltaY < 0) stopFollowingLatest();
            }}
            onTouchStart={(event) => {
              touchYRef.current = event.touches[0]?.clientY ?? null;
            }}
            onTouchMove={(event) => {
              const currentY = event.touches[0]?.clientY;
              if (
                currentY !== undefined &&
                touchYRef.current !== null &&
                currentY > touchYRef.current
              ) {
                stopFollowingLatest();
              }
              touchYRef.current = currentY ?? null;
            }}
            onTouchEnd={() => {
              touchYRef.current = null;
            }}
            onTouchCancel={() => {
              touchYRef.current = null;
            }}
            onMouseDown={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect();
              if (event.clientX >= bounds.right - 16) stopFollowingLatest();
            }}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-5"
          >
            <div role="log" aria-live="polite">
              {!hasConversation ? (
                <div className="flex h-full flex-col justify-center">
                  <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-white px-4 py-3 text-[0.95rem] leading-6 text-slate-700 shadow-sm ring-1 ring-black/5">
                    Hello! I’m here to help with questions about Sapperton
                    School. What would you like to know?
                  </div>
                  <p className="mb-3 mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Popular questions
                  </p>
                  <div className="grid gap-2 min-[420px]:grid-cols-2 sm:grid-cols-1">
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
                        className={`min-w-0 max-w-[88%] overflow-hidden rounded-2xl px-4 py-3 text-[0.95rem] leading-6 shadow-sm [overflow-wrap:anywhere] sm:max-w-[78%] ${message.role === "user" ? "rounded-br-md bg-sapperton-green text-white" : "rounded-tl-md bg-white text-slate-700 ring-1 ring-black/5"}`}
                      >
                        <MessageParts parts={message.parts} />
                      </div>
                    </div>
                  ))}

                  {status === "thinking" && !visibleActivityLabel ? (
                    <div className="flex justify-start">
                      <div className="min-w-0 max-w-[88%] overflow-hidden rounded-2xl rounded-tl-md bg-white px-4 py-3 text-[0.95rem] leading-6 text-slate-700 shadow-sm ring-1 ring-black/5 [overflow-wrap:anywhere] sm:max-w-[78%]">
                        {streamedText ? (
                          <ChatText text={streamedText} />
                        ) : (
                          <div
                            className="flex h-6 items-center gap-1.5"
                            aria-label="The assistant is thinking"
                          >
                            {[0, 1, 2].map((dot) => (
                              <span
                                key={dot}
                                aria-hidden="true"
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
            <div
              id="agent-progress"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              hidden={!visibleActivityLabel}
              className="py-1.5 text-sm italic text-slate-500/70"
            >
              {visibleActivityLabel}
            </div>
          </div>

          <div className="border-t border-black/8 bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:p-4">
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
            {pendingFiles.length > 0 ? (
              <div className="mb-2.5 flex max-h-28 flex-wrap gap-2 overflow-y-auto" aria-label="Files ready to attach">
                {pendingFiles.map((file, index) => (
                  <span
                    key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                    className="flex min-w-0 max-w-full items-center gap-2 rounded-lg bg-sapperton-green/8 py-1.5 pl-2.5 pr-1.5 text-xs text-[#285d4c] ring-1 ring-sapperton-green/15"
                  >
                    {file.type.startsWith("image/") ? (
                      <ImageIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <FileText aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span className="max-w-48 truncate font-medium">{file.name}</span>
                    <span className="shrink-0 text-slate-500">{formatFileSize(file.size)}</span>
                    <button
                      type="button"
                      onClick={() => setPendingFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                      disabled={status !== "ready"}
                      aria-label={`Remove ${file.name}`}
                      className="rounded-md p-1 text-slate-500 transition hover:bg-white hover:text-slate-800 disabled:opacity-40"
                    >
                      <X aria-hidden="true" className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-[#f7f8f5] p-2 focus-within:border-sapperton-green/50 focus-within:ring-3 focus-within:ring-sapperton-green/10"
            >
              <label htmlFor="school-chat-message" className="sr-only">
                Ask the Sapperton School assistant
              </label>
              <label
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 transition ${status === "ready" ? "cursor-pointer hover:bg-white hover:text-sapperton-green" : "cursor-not-allowed opacity-40"}`}
                aria-label="Attach files"
                title="Attach files"
              >
                <Paperclip aria-hidden="true" className="h-5 w-5" />
                <input
                  type="file"
                  multiple
                  disabled={status !== "ready"}
                  className="sr-only"
                  onChange={(event) => {
                    addFiles(Array.from(event.target.files ?? []));
                    event.currentTarget.value = "";
                  }}
                />
              </label>
              <textarea
                id="school-chat-message"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={status !== "ready"}
                rows={1}
                maxLength={4000}
                placeholder={
                  status === "starting"
                    ? "Connecting to the assistant…"
                    : status === "uploading"
                      ? "Uploading files…"
                      : status === "thinking"
                        ? "Waiting for the assistant…"
                        : "Ask a question or attach files…"
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
                  disabled={(!draft.trim() && pendingFiles.length === 0) || status !== "ready"}
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
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>

      {!isOpen ? (
        <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[90] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2 sm:bottom-6 sm:right-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.button
              key={currentSuggestion}
              type="button"
              onClick={() => {
                setDraft(currentSuggestion);
                setIsOpen(true);
              }}
              initial={{ opacity: 0, y: 5, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="relative max-w-[15rem] rounded-2xl rounded-br-md bg-white px-3.5 py-2.5 text-left text-xs font-medium leading-4 text-[#285d4c] shadow-[0_8px_28px_rgba(17,61,49,0.2)] ring-1 ring-black/8 transition hover:-translate-y-0.5 hover:ring-sapperton-green/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapperton-green"
              aria-label={`Ask: ${currentSuggestion}`}
            >
              {currentSuggestion}
            </motion.button>
          </AnimatePresence>

          <motion.button
            ref={launcherRef}
            type="button"
            onClick={() => setIsOpen(true)}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 rounded-full bg-sapperton-green py-3 pl-3 pr-5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(17,61,49,0.35)] ring-1 ring-white/20 transition-colors hover:bg-[#285d4c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sapperton-green"
            aria-label="Open the Sapperton School assistant"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <MessageCircleQuestion aria-hidden="true" className="h-5 w-5" />
            </span>
            Ask Sapperton
          </motion.button>
        </div>
      ) : null}
    </>
  );
}
