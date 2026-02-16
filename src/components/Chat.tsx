"use client"

import { ApiResponse } from '@/types/ApiResponse';
import axios, { AxiosError } from 'axios';
import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Loader2, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  MessageSquare, 
  Brain,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Trash2,
  RefreshCw,
  BookOpen,
  Lightbulb,
  GraduationCap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type ChatProps = {
  contentId: string
}

interface ChatMessage {
  _id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
}

// Enhanced markdown components for chat
const ChatMarkdownComponents = {
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "");
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(String(children));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Code copied to clipboard!");
    };

    return !inline && match ? (
      <div className="relative group my-3">
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-blue-900/50 hover:bg-blue-800 text-white rounded-md"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          className="rounded-lg text-sm shadow-lg"
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: '#0a1929', // Dark blue background
          }}
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-md text-sm font-mono" {...props}>
        {children}
      </code>
    );
  },
  h1: ({ children }: any) => (
    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent mt-4 mb-2">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-xl font-semibold mt-3 mb-2 flex items-center gap-2">
      <Sparkles className="h-4 w-4 text-blue-500" />
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-lg font-semibold mt-2 mb-1 text-neutral-800 dark:text-neutral-200">
      {children}
    </h3>
  ),
  p: ({ children }: any) => (
    <p className="text-sm leading-6 mb-2 text-neutral-700 dark:text-neutral-300">
      {children}
    </p>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc pl-5 mb-2 space-y-1 text-neutral-700 dark:text-neutral-300">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal pl-5 mb-2 space-y-1 text-neutral-700 dark:text-neutral-300">
      {children}
    </ol>
  ),
  li: ({ children }: any) => (
    <li className="text-sm leading-6">{children}</li>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-blue-500 pl-3 py-2 my-2 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/30 rounded-r-lg text-sm">
      <p className="italic text-neutral-700 dark:text-neutral-300">{children}</p>
    </blockquote>
  ),
  a: ({ href, children }: any) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline decoration-2 decoration-blue-200 dark:decoration-blue-800 hover:decoration-blue-400 transition-all"
    >
      {children}
    </a>
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
      <table className="min-w-full text-sm divide-y divide-neutral-200 dark:divide-neutral-800">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: any) => (
    <th className="px-4 py-2 bg-blue-50 dark:bg-blue-950/30 text-left text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
      {children}
    </td>
  ),
};

// Message bubble component with animations
const MessageBubble = ({ msg, index }: { msg: ChatMessage; index: number }) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Message copied!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`flex gap-3 group ${
        msg.role === "user" ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar with blue gradient for assistant */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Avatar className={`${
          msg.role === "user" 
            ? "bg-gradient-to-br from-blue-600 to-blue-700 ring-2 ring-blue-200 dark:ring-blue-900" 
            : "bg-gradient-to-br from-blue-500 to-blue-600 ring-2 ring-blue-200 dark:ring-blue-900"
        } flex-shrink-0 shadow-lg`}>
          <AvatarFallback>
            {msg.role === "user" ? (
              <User className="h-4 w-4 text-white" />
            ) : (
              <Bot className="h-4 w-4 text-white" />
            )}
          </AvatarFallback>
        </Avatar>
      </motion.div>

      {/* Message content */}
      <div
        className={`flex-1 max-w-[calc(100%-5rem)] ${
          msg.role === "user" ? "items-end" : "items-start"
        }`}
      >
        {/* Message bubble */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`rounded-2xl p-4 shadow-md ${
            msg.role === "user"
              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
              : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
          }`}
        >
          {msg.role === "assistant" ? (
            <div className="prose prose-neutral dark:prose-invert max-w-none prose-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={ChatMarkdownComponents}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
              {msg.text}
            </p>
          )}
          
          {/* Timestamp */}
          <div className="flex items-center justify-between mt-3">
            <p className={`text-xs ${
              msg.role === "user" ? "text-blue-100" : "text-neutral-500"
            }`}>
              {new Date(msg.createdAt).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </p>
            
            {/* Message actions (only for assistant messages) */}
            {msg.role === "assistant" && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy message</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full ${
                          liked ? 'text-blue-500' : ''
                        }`}
                        onClick={() => setLiked(!liked)}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Helpful</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full ${
                          disliked ? 'text-red-500' : ''
                        }`}
                        onClick={() => setDisliked(!disliked)}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Not helpful</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Suggestion chips component
const SuggestionChips = ({ onSelect }: { onSelect: (text: string) => void }) => {
  const suggestions = [
    "Summarize the main points",
    "Explain this in simple terms",
    "What are the key takeaways?",
    "Give me examples",
    "Create a study guide"
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {suggestions.map((suggestion, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <Badge
            variant="outline"
            className="px-3 py-1.5 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all text-sm border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
            onClick={() => onSelect(suggestion)}
          >
            {suggestion}
          </Badge>
        </motion.div>
      ))}
    </div>
  );
};

const Chat = ({ contentId }: ChatProps) => {
  const [question, setQuestion] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ["chats", contentId],
    queryFn: async () => {
      const res = await axios.get(`/api/chat/fetch-chats/${contentId}`);
      if (res.data.success) {
        return res.data.data;
      }
      return [];
    },
    enabled: !!contentId
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  useEffect(() => {
    // Hide suggestions when there are messages
    if (chats.length > 0) {
      setShowSuggestions(false);
    }
  }, [chats.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(e.target.value);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsSending(true);
    try {
      const response = await axios.post("/api/chat", {
        contentId,
        question
      });

      if (response.data.success) {
        toast.success("Message sent!", {
          icon: <Send className="h-4 w-4" />,
        });
        queryClient.invalidateQueries({ queryKey: ["chats", contentId] });
        setQuestion("");
        inputRef.current?.focus();
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? "Failed to send message");
    } finally {
      setIsSending(false);
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    // Add clear chat functionality here
    toast.success("Chat cleared");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 blur-xl opacity-50 animate-pulse"></div>
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 relative" />
          </div>
        </motion.div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 animate-pulse">
          Loading your conversation...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-gradient-to-b from-transparent to-blue-50/30 dark:to-blue-950/30 rounded-xl">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-blue-100 dark:border-blue-900 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></div>
            <div className="w-2 h-2 rounded-full bg-blue-500 relative"></div>
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-blue-600" />
              AI Tutor
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                Online
              </Badge>
            </h3>
            <p className="text-xs text-neutral-500">
              {chats.length} messages • Ready to help
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem onClick={clearChat} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear chat
            </DropdownMenuItem>
            <DropdownMenuItem>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-hidden bg-gradient-to-b from-transparent to-blue-50/20 dark:to-blue-950/20">
        <ScrollArea className="h-full px-4">
          <AnimatePresence mode="wait">
            {chats.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center min-h-[400px] text-center"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                    <Lightbulb className="h-10 w-10 text-white" />
                  </div>
                </motion.div>
                
                <h3 className="font-semibold text-xl mb-2 bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                  Start Learning with AI
                </h3>
                <p className="text-muted-foreground max-w-sm mb-6">
                  Ask questions about your content and get instant, intelligent responses
                </p>
                
                <div className="space-y-2 text-left bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl p-4 border border-blue-100 dark:border-blue-900">
                  <p className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    <span>Get summaries of complex topics</span>
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span>Ask for explanations and examples</span>
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <Brain className="h-4 w-4 text-blue-700" />
                    <span>Generate practice questions</span>
                  </p>
                </div>

                {showSuggestions && (
                  <div className="mt-6 w-full">
                    <p className="text-xs text-neutral-500 mb-3 text-left">Try asking:</p>
                    <SuggestionChips onSelect={handleSuggestionClick} />
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="space-y-4 py-4">
                {chats.map((msg: ChatMessage, index: number) => (
                  <MessageBubble key={msg._id} msg={msg} index={index} />
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </div>

      {/* Chat Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-blue-100 dark:border-blue-900 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-b-xl">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder="Ask anything about your content..."
              value={question}
              onChange={handleChange}
              disabled={isSending}
              className="w-full h-12 pl-4 pr-12 bg-white dark:bg-neutral-900 border-blue-200 dark:border-blue-800 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-base"
            />
            {question && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                type="button"
                onClick={() => setQuestion("")}
              >
                ×
              </motion.button>
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={isSending || !question.trim()}
                  className="h-12 w-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                >
                  {isSending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </form>

        {/* Quick actions */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-neutral-500">
            AI Tutor • Powered by advanced language models
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400">
              {chats.length} messages
            </Badge>
          </div>
        </div>
      </div>

      {/* Typing indicator animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}

export default Chat;