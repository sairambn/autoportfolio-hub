import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Check,
  ChevronDown,
  Copy,
  GraduationCap,
  Maximize2,
  Minimize2,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  User,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  modelUsed?: string;
}

export type AssistantPersona =
  "portfolio_architect" | "career_coach" | "resume_reviewer" | "tech_mentor";

const PERSONAS: Record<
  AssistantPersona,
  {
    title: string;
    description: string;
    systemInstruction: string;
    quickPrompts: string[];
  }
> = {
  portfolio_architect: {
    title: "Portfolio Architect",
    description: "Craft magnetic project highlights, headlines, and bio showcases.",
    systemInstruction: `You are Folio's Portfolio Architect, an elite web portfolio copywriter and design strategist.
Help users showcase their engineering projects, design choices, and technical capabilities in compelling ways.
Suggest impactful project titles, punchy problem-solution summaries, and clear tech stack justifications.
Keep answers concise, direct, and structured.`,
    quickPrompts: [
      "Critique and improve my portfolio headline & bio",
      "Give me 3 high-impact project ideas for my tech stack",
      "How do I explain a complex backend project simply?",
      "Suggest modern color palette & layout tips for developers",
    ],
  },
  career_coach: {
    title: "Career & Interview Coach",
    description: "Google & Tier-1 tech roadmap prep, DSA, and system design.",
    systemInstruction: `You are Folio's Career & Interview Coach.
Help aspiring engineers, students, and professionals prepare for Google, Amazon, Microsoft, and top tier-1 product company interviews.
Provide concrete guidance on data structures, algorithmic patterns, system design fundamentals, and behavioral questions.
Focus on actionable milestones and encouraging, professional advice.`,
    quickPrompts: [
      "How should I structure a 45-minute system design interview?",
      "Give me a 3-month roadmap to master DSA for Google",
      "How do I answer 'Tell me about a challenging bug you fixed'?",
      "What topics should I study for a cloud backend engineer role?",
    ],
  },
  resume_reviewer: {
    title: "Resume & ATS Optimizer",
    description: "Polish bullet points using Google's X-Y-Z formula.",
    systemInstruction: `You are Folio's Resume & ATS Optimizer.
Expertly review resume points, experience blurbs, and technical skills.
Always guide users to apply the Google X-Y-Z framework: "Accomplished [X] as measured by [Y], by doing [Z]".
Quantify impact with metrics (latency, scale, cost reduction, accuracy, active users).`,
    quickPrompts: [
      "Rewrite my project bullet using the Google X-Y-Z formula",
      "What keywords should I include for full-stack ATS scanners?",
      "How do I make a 0-experience college resume stand out?",
      "Review my experience bullet for maximum hiring impact",
    ],
  },
  tech_mentor: {
    title: "Technical Mentor",
    description: "Architecture reviews, clean code, and technology advice.",
    systemInstruction: `You are Folio's Technical Mentor.
Help developers with software architecture, API design, TypeScript, React, distributed systems, and modern tools.
Offer practical, production-ready code examples and clear explanations of technical tradeoffs.`,
    quickPrompts: [
      "What are the tradeoffs between SSR, SSG, and client SPA?",
      "Explain Event-Driven architecture with a real-world example",
      "How should I structure database indexing for high read volume?",
      "Suggest best practices for scalable TypeScript React state",
    ],
  },
};

const MODELS = [
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash Lite",
    tag: "Lifelong Free & Ultra-Fast",
    speed: "Ultra-Fast",
    free: true,
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    tag: "Flagship & Detailed",
    speed: "Fast",
    free: true,
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro",
    tag: "Deep Reasoning",
    speed: "Complex",
    free: false,
  },
];

interface GeminiChatbotProps {
  mode?: "floating" | "embedded";
  initialPersona?: AssistantPersona;
  onClose?: () => void;
  className?: string;
}

export function GeminiChatbot({
  mode = "floating",
  initialPersona = "portfolio_architect",
  onClose,
  className = "",
}: GeminiChatbotProps) {
  const [isOpen, setIsOpen] = useState(mode === "embedded");
  const [isMinimized, setIsMinimized] = useState(false);
  const [persona, setPersona] = useState<AssistantPersona>(initialPersona);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.1-flash-lite");
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load chat history from localStorage or start fresh
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem("folio_gemini_chat_history");
      if (saved) return JSON.parse(saved);
    } catch {
      /* ignore */
    }
    return [
      {
        id: "msg-welcome-01",
        role: "model",
        text: `Hello! I'm your **Lifelong Free AI Assistant** powered by Google Gemini.

I'm here to help you build standout portfolios, polish resume accomplishments, map your engineering prep, and ace technical interviews.

How can I help you excel today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: "gemini-3.1-flash-lite",
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("folio_gemini_chat_history", JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  async function handleSendMessage(textToSend?: string) {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInputMessage("");
    setLoading(true);

    try {
      const currentPersona = PERSONAS[persona];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          systemInstruction: currentPersona.systemInstruction,
          messages: nextHistory.map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${res.status}`);
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}-bot`,
        role: "model",
        text: data.reply || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: data.model || selectedModel,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to get reply";
      toast.error(`Gemini Error: ${msg}`);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: "model",
        text: `⚠️ **Service Notice:** ${msg}\n\nPlease try again or switch to another Gemini model above.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: selectedModel,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleClearChat() {
    if (!confirm("Clear your conversation history?")) return;
    const initial: ChatMessage[] = [
      {
        id: `msg-reset-${Date.now()}`,
        role: "model",
        text: `Conversation cleared. I'm ready for your next question!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: selectedModel,
      },
    ];
    setMessages(initial);
    toast.info("Conversation history reset");
  }

  function handleCopyMessage(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Floating trigger button when closed
  if (mode === "floating" && !isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 rounded-full border-2 border-ink bg-primary px-4 py-3 text-primary-foreground font-black shadow-[4px_4px_0_0_oklch(0.2_0.02_60)] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_0_oklch(0.2_0.02_60)] active:translate-y-0.5 transition-all"
        >
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-accent" />
          </span>
          <Sparkles className="size-5 transition-transform group-hover:rotate-12" />
          <span className="text-sm tracking-wide">Lifelong Free AI</span>
          <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] uppercase font-mono font-bold tracking-wider">
            Gemini
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={
        mode === "floating"
          ? `fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl border-2 border-ink bg-card shadow-[6px_6px_0_0_oklch(0.2_0.02_60)] transition-all ${
              isMinimized
                ? "h-16 w-80 sm:w-96"
                : "h-[85vh] max-h-[640px] w-[95vw] sm:w-[460px] md:w-[490px]"
            }`
          : `flex flex-col overflow-hidden rounded-2xl border-2 border-ink bg-card shadow-[4px_4px_0_0_oklch(0.2_0.02_60)] h-[680px] w-full ${className}`
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-ink bg-gradient-to-r from-card via-card to-accent/20 px-4 py-3 select-none">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-xl border border-ink/30 bg-primary text-primary-foreground shadow-xs">
            <Sparkles className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-black text-sm text-foreground">Folio AI Assistant</span>
              <span className="rounded-full border border-emerald-300 bg-emerald-50 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                Lifelong Free
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground truncate max-w-[200px]">
              {PERSONAS[persona].title} &bull; {MODELS.find((m) => m.id === selectedModel)?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleClearChat}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="size-4" />
          </button>
          {mode === "floating" && (
            <button
              type="button"
              onClick={() => setIsMinimized((v) => !v)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <Maximize2 className="size-4" /> : <Minimize2 className="size-4" />}
            </button>
          )}
          {mode === "floating" && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onClose?.();
              }}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Close"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Controls Bar: Persona & Model Selection */}
          <div className="grid grid-cols-2 gap-2 border-b border-ink/15 bg-muted/30 p-2.5 text-xs">
            {/* Persona Selector */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                Role Persona
              </label>
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value as AssistantPersona)}
                className="w-full rounded-lg border border-ink/20 bg-background px-2.5 py-1 text-xs font-semibold focus:border-primary focus:outline-none"
              >
                {Object.entries(PERSONAS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Selector */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                Gemini Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full rounded-lg border border-ink/20 bg-background px-2.5 py-1 text-xs font-semibold focus:border-primary focus:outline-none"
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.tag})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Messages Thread (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-sm ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="grid size-7 shrink-0 place-items-center rounded-lg border border-ink/20 bg-primary/10 text-primary mt-0.5">
                      <Bot className="size-4" />
                    </div>
                  )}

                  <div
                    className={`group relative max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-xs ${
                      isUser
                        ? "border-2 border-ink bg-primary text-primary-foreground rounded-br-xs"
                        : "border-2 border-ink/15 bg-background text-foreground rounded-bl-xs"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{msg.text}</div>

                    <div
                      className={`mt-1.5 flex items-center justify-between gap-2 text-[10px] font-medium opacity-75 border-t pt-1 ${
                        isUser ? "border-primary-foreground/20" : "border-ink/10"
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      <div className="flex items-center gap-1.5">
                        {msg.modelUsed && <span>{msg.modelUsed}</span>}
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:scale-110"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isUser && (
                    <div className="grid size-7 shrink-0 place-items-center rounded-lg border border-ink/20 bg-muted text-muted-foreground mt-0.5">
                      <User className="size-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 text-sm justify-start">
                <div className="grid size-7 shrink-0 place-items-center rounded-lg border border-ink/20 bg-primary/10 text-primary mt-0.5 animate-pulse">
                  <Bot className="size-4" />
                </div>
                <div className="rounded-2xl border-2 border-ink/15 bg-background px-4 py-3 text-xs text-muted-foreground flex items-center gap-2 shadow-xs">
                  <RefreshCw className="size-3.5 animate-spin text-primary" />
                  <span>Thinking with {MODELS.find((m) => m.id === selectedModel)?.name}…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="border-t border-ink/10 bg-muted/20 px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase text-muted-foreground shrink-0 flex items-center gap-1">
              <Zap className="size-3 text-amber-500" /> Suggestions:
            </span>
            {PERSONAS[persona].quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="shrink-0 rounded-full border border-ink/15 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground hover:border-primary/60 hover:bg-primary/5 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="border-t-2 border-ink bg-card p-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={2}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Ask ${PERSONAS[persona].title} anything… (Press Enter)`}
                className="flex-1 resize-none rounded-xl border-2 border-ink/20 bg-background p-2.5 text-xs sm:text-sm font-medium focus:border-primary focus:outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-ink bg-primary text-primary-foreground shadow-[2px_2px_0_0_oklch(0.2_0.02_60)] disabled:opacity-50 hover:opacity-95 active:translate-y-0.5 transition-all"
                title="Send Message"
              >
                <Send className="size-4" />
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Shift+Enter for newline</span>
              <span className="font-mono">Google GenAI SDK &bull; 100% Free</span>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
