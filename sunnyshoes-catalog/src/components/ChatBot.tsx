"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
  products?: {
    id: string;
    name: string;
    image?: string;
    price?: number;
  }[];
}

const chatTranslations = {
  zh: {
    placeholder: "描述您想要的鞋子...",
    greeting:
      "您好！我是 Sunnyshoes 的智能购物助手 ✨\n\n告诉我您在找什么样的鞋子，我来为您推荐！",
    sending: "思考中",
    error: "抱歉，出了点问题，请稍后再试。",
    viewProduct: "查看",
  },
  en: {
    placeholder: "Describe what shoes you want...",
    greeting:
      "Hello! I'm Sunnyshoes' shopping assistant ✨\n\nTell me what kind of shoes you're looking for!",
    sending: "Thinking",
    error: "Sorry, something went wrong. Please try again later.",
    viewProduct: "View",
  },
  ko: {
    placeholder: "원하는 신발을 설명해주세요...",
    greeting:
      "안녕하세요! Sunnyshoes 쇼핑 어시스턴트입니다 ✨\n\n어떤 신발을 찾으시나요?",
    sending: "생각 중",
    error: "죄송합니다, 문제가 발생했습니다. 나중에 다시 시도해주세요.",
    viewProduct: "보기",
  },
};

// Simple Markdown parser
function parseMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      elements.push(<br key={`br-${lineIndex}`} />);
    }

    // Parse inline elements
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let partIndex = 0;

    while (remaining.length > 0) {
      // Bold: **text**
      const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
      if (boldMatch) {
        parts.push(
          <strong key={`b-${lineIndex}-${partIndex++}`} className="font-semibold">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Italic: *text* or _text_
      const italicMatch = remaining.match(/^(\*|_)(.+?)\1/);
      if (italicMatch) {
        parts.push(
          <em key={`i-${lineIndex}-${partIndex++}`} className="italic">
            {italicMatch[2]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Code: `text`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code
            key={`c-${lineIndex}-${partIndex++}`}
            className="rounded bg-muted px-1 py-0.5 font-mono text-xs"
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Plain text until next special char
      const nextSpecial = remaining.search(/[\*_`]/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    elements.push(...parts);
  });

  return elements;
}

// Markdown message component
function MarkdownMessage({ content }: { content: string }) {
  const parsed = useMemo(() => parseMarkdown(content), [content]);
  return <>{parsed}</>;
}

export function ChatBot() {
  const { locale } = useLocale();
  const t = chatTranslations[locale] || chatTranslations.zh;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t.greeting },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update greeting when locale changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === "assistant") {
      setMessages([{ role: "assistant", content: t.greeting }]);
    }
  }, [locale, t.greeting]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          locale,
          history,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.data.message,
            products: data.data.products,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: t.error },
        ]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: t.error }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
          isOpen
            ? "h-11 w-11 bg-muted text-muted-foreground hover:bg-muted/80"
            : "h-14 w-14 bg-primary text-primary-foreground hover:scale-105 hover:shadow-xl"
        }`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300 ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        {/* Messages */}
        <ScrollArea className="h-[420px] p-4" ref={scrollRef}>
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-3.5 w-3.5" />
                  ) : (
                    <Bot className="h-3.5 w-3.5" />
                  )}
                </div>

                {/* Content */}
                <div
                  className={`flex max-w-[270px] flex-col ${
                    message.role === "user" ? "items-end" : ""
                  }`}
                >
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 ${
                      message.role === "user"
                        ? "rounded-tr-sm bg-primary text-primary-foreground"
                        : "rounded-tl-sm bg-muted text-foreground"
                    }`}
                  >
                    <div className="text-[13px] leading-relaxed">
                      <MarkdownMessage content={message.content} />
                    </div>
                  </div>

                  {/* Product Recommendations */}
                  {message.products && message.products.length > 0 && (
                    <div className="mt-2 w-full space-y-1.5">
                      {message.products.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          className="flex items-center gap-2.5 rounded-xl border border-border bg-background p-2 transition-all hover:border-primary/40 hover:bg-muted/50"
                        >
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-[13px] font-medium">
                              {product.name}
                            </p>
                            <div className="flex items-center justify-between mt-0.5">
                              {product.price ? (
                                <span className="text-xs font-medium text-primary">
                                  ¥{product.price.toFixed(0)}
                                </span>
                              ) : (
                                <span />
                              )}
                              <span className="text-[11px] text-muted-foreground">
                                {t.viewProduct} →
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="text-[13px] text-muted-foreground">
                    {t.sending}
                  </span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border p-3">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              disabled={isLoading}
              className="flex-1 h-9 rounded-full border-border bg-muted/50 px-3.5 text-[13px] focus-visible:ring-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
