"use client";

import { ApiResponse } from '@/types/ApiResponse';
import axios, { AxiosError } from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Loader2, Send, Bot, User, Sparkles,
  MessageSquare, Brain, Copy, Check,
  ThumbsUp, ThumbsDown, BookOpen, Lightbulb,
  GraduationCap, MoreHorizontal, ArrowDown, X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

type ChatProps = { contentId: string }

interface ChatMessage {
  _id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
}

const ChatMarkdownComponents = (theme: string | undefined) => ({
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "");
    const [copied, setCopied] = useState(false);
    const syntaxTheme = theme === "dark" ? vscDarkPlus : vs;

    if (!inline && match) {
      return (
        <div className="relative group my-3 max-w-full">
          <button
            onClick={() => { 
              navigator.clipboard.writeText(String(children)); 
              setCopied(true); 
              setTimeout(() => setCopied(false), 2000); 
            }}
            className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <div className="overflow-x-auto max-w-full rounded-xl">
            <SyntaxHighlighter 
              style={syntaxTheme} 
              language={match[1]} 
              PreTag="div" 
              className={cn(
                "!rounded-xl !text-xs !whitespace-pre !break-words",
                theme === "dark" ? "!bg-[#0d1b2e]" : "!bg-muted"
              )}
              customStyle={{ 
                margin: 0, 
                padding: '1rem',
                maxWidth: '100%',
                overflowX: 'auto',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap'
              }} 
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          </div>
        </div>
      );
    }
    return (
      <code className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md text-xs font-mono break-words" {...props}>
        {children}
      </code>
    );
  },
  // Add wrapper for all markdown content
  div: ({ children }: any) => <div className="break-words overflow-hidden">{children}</div>,
  p: ({ children }: any) => <p className="text-sm leading-6 mb-2 text-muted-foreground break-words">{children}</p>,
  h1: ({ children }: any) => <h1 className="text-lg font-bold text-foreground mt-3 mb-2 break-words">{children}</h1>,
  h2: ({ children }: any) => (
    <h2 className="text-base font-semibold mt-3 mb-1.5 text-foreground/90 flex items-center gap-1.5 break-words flex-wrap">
      <span className="w-1 h-4 bg-blue-500 rounded-full inline-block flex-shrink-0"></span>
      <span className="break-words">{children}</span>
    </h2>
  ),
  h3: ({ children }: any) => <h3 className="text-sm font-semibold mt-2 mb-1 text-foreground/80 break-words">{children}</h3>,
  ul: ({ children }: any) => <ul className="space-y-1 mb-2 pl-3 break-words">{children}</ul>,
  li: ({ children }: any) => (
    <li className="flex items-start gap-2 text-muted-foreground break-words">
      <span className="mt-2 w-1 h-1 rounded-full bg-blue-400 flex-shrink-0"></span>
      <span className="text-sm break-words">{children}</span>
    </li>
  ),
  ol: ({ children }: any) => <ol className="list-decimal pl-5 mb-2 space-y-1 text-muted-foreground text-sm break-words">{children}</ol>,
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-3 border-blue-500 pl-3 py-1.5 my-2 bg-blue-500/5 rounded-r-lg text-xs italic text-muted-foreground/80 break-words">
      {children}
    </blockquote>
  ),
  a: ({ href, children }: any) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline decoration-blue-300 dark:decoration-blue-700 hover:decoration-blue-500 transition-all text-sm break-words"
    >
      {children}
    </a>
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-2 rounded-xl border border-border max-w-full">
      <div className="min-w-full inline-block align-middle">
        <table className="min-w-full text-xs divide-y divide-border">{children}</table>
      </div>
    </div>
  ),
  th: ({ children }: any) => (
    <th className="px-3 py-2 bg-blue-500/5 text-left text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wider break-words">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-3 py-2 border-t border-border text-muted-foreground/80 text-xs break-words">
      {children}
    </td>
  ),
});

const SUGGESTIONS = [
  { icon: "📋", text: "Summarize the main points" },
  { icon: "🔍", text: "Explain this in simple terms" },
  { icon: "💡", text: "What are the key takeaways?" },
  { icon: "📝", text: "Create a study guide" },
  { icon: "❓", text: "Quiz me on this topic" },
];

// Enhanced TypingIndicator with more sophisticated animation
const TypingIndicator = () => {
  const { theme } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 items-end max-w-full"
    >
      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/20">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className={cn(
        "border rounded-2xl rounded-bl-sm px-5 py-3 max-w-[calc(100%-3rem)]",
        theme === "dark" 
          ? "bg-muted/30 border-border" 
          : "bg-muted border-border"
      )}>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-blue-500"
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-1">AI is thinking...</span>
        </div>
      </div>
    </motion.div>
  );
};

// Thinking message that appears right after user sends a message
const ThinkingMessage = ({ userMessage }: { userMessage: string }) => {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-4 w-full overflow-hidden">
      {/* User message bubble */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex gap-2.5 flex-row-reverse items-end max-w-full"
      >
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-slate-600/20">
          <User className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex flex-col gap-1 items-end max-w-[calc(100%-3rem)]">
          <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-lg shadow-blue-600/20 break-words">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{userMessage}</p>
          </div>
          <span className="text-[10px] text-muted-foreground/50 px-1">
            Just now
          </span>
        </div>
      </motion.div>

      {/* Thinking indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="flex gap-3 items-end max-w-full"
      >
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/20">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
        <div className={cn(
          "border rounded-2xl rounded-bl-sm px-5 py-4 max-w-[calc(100%-3rem)]",
          theme === "dark" 
            ? "bg-muted/30 border-border" 
            : "bg-muted border-border"
        )}>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Brain icon with pulse animation */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Brain className="w-4 h-4 text-blue-500 flex-shrink-0" />
            </motion.div>
            
            {/* Animated dots */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-blue-500"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            
            <motion.span 
              className="text-xs text-muted-foreground"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Analyzing your question...
            </motion.span>
          </div>
          
          {/* Subtle progress bar */}
          <motion.div 
            className="h-0.5 bg-blue-500/20 rounded-full mt-3 overflow-hidden w-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const MessageBubble = ({ msg, index }: { msg: ChatMessage; index: number }) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const { theme } = useTheme();
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex gap-2.5 group ${isUser ? "flex-row-reverse" : "flex-row"} items-end w-full overflow-hidden`}
    >
      {/* Avatar */}
      <div className={cn(
        "w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg",
        isUser 
          ? "bg-gradient-to-br from-slate-600 to-slate-700 shadow-slate-600/20" 
          : "bg-gradient-to-br from-blue-600 to-blue-700 shadow-blue-600/20"
      )}>
        {isUser ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white" />}
      </div>

      <div className={`flex flex-col gap-1 max-w-[calc(100%-3rem)] ${isUser ? "items-end" : "items-start"} overflow-hidden`}>
        {/* Bubble */}
        <div className={cn(
          "relative rounded-2xl px-4 py-3 overflow-hidden w-full",
          isUser
            ? "bg-blue-600 text-white rounded-br-sm shadow-lg shadow-blue-600/20"
            : cn(
                "border rounded-bl-sm",
                theme === "dark"
                  ? "bg-muted/30 border-border"
                  : "bg-muted border-border"
              )
        )}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
          ) : (
            <div className="prose prose-sm max-w-none overflow-hidden [&_*]:break-words">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                components={ChatMarkdownComponents(theme)}
                // className="break-words"
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Meta row */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? "flex-row-reverse" : "flex-row"} flex-wrap`}>
          <span className="text-[10px] text-muted-foreground/50">
            {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </span>

          {/* Assistant actions */}
          {!isUser && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => { 
                  navigator.clipboard.writeText(msg.text); 
                  setCopied(true); 
                  toast.success("Copied to clipboard"); 
                  setTimeout(() => setCopied(false), 2000); 
                }}
                className="p-1 rounded-lg hover:bg-blue-500/10 text-muted-foreground/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              </button>
              <button
                onClick={() => {
                  setLiked(l => !l);
                  if (!liked) toast.success("Thanks for the feedback!");
                }}
                className={cn(
                  "p-1 rounded-lg hover:bg-blue-500/10 transition-colors",
                  liked ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground/60 hover:text-blue-600 dark:hover:text-blue-400"
                )}
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  setDisliked(d => !d);
                  if (!disliked) toast.success("Feedback recorded");
                }}
                className={cn(
                  "p-1 rounded-lg hover:bg-blue-500/10 transition-colors",
                  disliked ? "text-red-500" : "text-muted-foreground/60 hover:text-blue-600 dark:hover:text-blue-400"
                )}
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Chat = ({ contentId }: ChatProps) => {
  const [question, setQuestion] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [tempUserMessage, setTempUserMessage] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { theme } = useTheme();

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ["chats", contentId],
    queryFn: async () => {
      const res = await axios.get(`/api/chat/fetch-chats/${contentId}`);
      if (res.data.success) return res.data.data;
      return [];
    },
    enabled: !!contentId
  });

  useEffect(() => {
    if (isAtBottom) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, isAtBottom, tempUserMessage]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const atBottom = scrollHeight - scrollTop - clientHeight < 50;
      setIsAtBottom(atBottom);
      setShowScrollButton(!atBottom && (chats.length > 0 || !!tempUserMessage));
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    const q = question;
    setQuestion("");
    setIsSending(true);
    setTempUserMessage(q); // Show temporary user message
    
    try {
      const response = await axios.post("/api/chat", { contentId, question: q });
      if (response.data.success) {
        queryClient.invalidateQueries({ queryKey: ["chats", contentId] });
        // Clear temp message once we have the actual messages
        setTempUserMessage(null);
        inputRef.current?.focus();
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? "Failed to send message");
      setQuestion(q);
      setTempUserMessage(null);
    } finally { 
      setIsSending(false); 
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse w-16 h-16"></div>
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 relative" />
        </div>
        <p className="text-muted-foreground text-xs mt-4 tracking-wider">Loading conversation</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
      {/* Chat header */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-border backdrop-blur-sm bg-background/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <GraduationCap className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 flex-wrap">
                <span className="truncate">AI Tutor</span>
                <span className="text-[10px] font-normal text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
                  Online
                </span>
              </h3>
              <p className="text-[11px] text-muted-foreground truncate">
                {chats.length} message{chats.length !== 1 ? 's' : ''} · Ready to help
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground flex-shrink-0">
            <span className="text-xs text-muted-foreground/60">{chats.length} msg</span>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div 
        className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        <AnimatePresence mode="wait">
          {chats.length === 0 && !tempUserMessage ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[400px] text-center w-full overflow-hidden"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 flex items-center justify-center mb-5 flex-shrink-0"
              >
                <Lightbulb className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </motion.div>

              <h3 className="text-base font-semibold text-foreground mb-2 px-4">Start a conversation</h3>
              <p className="text-muted-foreground text-xs max-w-[220px] leading-relaxed mb-6 px-4">
                Ask anything about your content — I'll explain, summarize, and quiz you.
              </p>

              {/* Suggestion chips */}
              <div className="flex flex-col gap-2 w-full max-w-[280px] px-4">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => { 
                      setQuestion(s.text); 
                      inputRef.current?.focus(); 
                    }}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-muted/30 border border-border hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-left group w-full"
                  >
                    <span className="text-sm flex-shrink-0">{s.icon}</span>
                    <span className="text-xs text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {s.text}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 w-full overflow-hidden"
            >
              {/* Show all existing chats */}
              {chats.map((msg: ChatMessage, index: number) => (
                <MessageBubble key={msg._id} msg={msg} index={index} />
              ))}
              
              {/* Show thinking state with temporary user message */}
              {tempUserMessage && isSending && (
                <ThinkingMessage userMessage={tempUserMessage} />
              )}
              
              <div ref={chatEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-8 p-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all z-10"
          >
            <ArrowDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="flex-shrink-0 p-4 border-t border-border backdrop-blur-sm bg-background/80 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-full">
          <div className="flex-1 relative min-w-0">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask anything about your content..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isSending}
              className="w-full bg-muted/30 border border-border hover:border-blue-500/30 focus:border-blue-500 text-foreground text-sm placeholder:text-muted-foreground/50 rounded-xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 truncate"
            />
            {question && !isSending && (
              <button
                type="button"
                onClick={() => setQuestion("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            disabled={isSending || !question.trim()}
            size="icon"
            className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 flex-shrink-0 disabled:opacity-50"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>

        <p className="text-[10px] text-muted-foreground/60 text-center mt-3 truncate">
          AI Tutor · Contextual responses based on your content
        </p>
      </div>
    </div>
  );
};

export default Chat;