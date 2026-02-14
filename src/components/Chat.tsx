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
import { Loader2, Send, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

type ChatProps = {
  contentId: string
}

interface ChatMessage {
  _id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
}

// Custom components for markdown rendering in chat
const ChatMarkdownComponents = {
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        className="rounded-lg my-2 text-sm"
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className="bg-neutral-200/50 dark:bg-neutral-700/50 px-1.5 py-0.5 rounded-md text-sm" {...props}>
        {children}
      </code>
    );
  },
  h1: ({ children }: any) => <h1 className="text-xl font-bold mt-3 mb-2">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-lg font-semibold mt-3 mb-2">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-base font-semibold mt-2 mb-1">{children}</h3>,
  p: ({ children }: any) => <p className="text-sm leading-6 mb-2">{children}</p>,
  ul: ({ children }: any) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
  li: ({ children }: any) => <li className="text-sm">{children}</li>,
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-blue-500 pl-3 py-1 my-2 bg-blue-50/50 dark:bg-blue-950/30 italic text-sm">
      {children}
    </blockquote>
  ),
  a: ({ href, children }: any) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
      {children}
    </a>
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full text-sm divide-y divide-neutral-200 dark:divide-neutral-700">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: any) => (
    <th className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 font-semibold text-left">{children}</th>
  ),
  td: ({ children }: any) => (
    <td className="px-3 py-1.5 border-t border-neutral-200 dark:border-neutral-700">{children}</td>
  ),
};

const Chat = ({ contentId }: ChatProps) => {
  const [question, setQuestion] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
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
        toast.success(response.data.message);
        queryClient.invalidateQueries({ queryKey: ["chats", contentId] });
        setQuestion("");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? "Something went wrong");
    } finally {
      setIsSending(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px]">
      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No messages yet</h3>
              <p className="text-muted-foreground max-w-sm">
                Start a conversation with the AI tutor by asking a question about your content
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {chats.map((msg: ChatMessage) => (
                <div
                  key={msg._id}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Avatar className={`${
                    msg.role === "user" 
                      ? "bg-blue-600" 
                      : "bg-neutral-600"
                  } flex-shrink-0`}>
                    <AvatarFallback>
                      {msg.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex-1 rounded-lg p-3 max-w-[calc(100%-3rem)] ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-100 dark:bg-neutral-800"
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
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                    )}
                    <p className="text-xs opacity-70 mt-2">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Input - Fixed at bottom */}
      <div className="flex-shrink-0 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Ask a question about your content..."
            value={question}
            onChange={handleChange}
            disabled={isSending}
            className="flex-1 bg-white dark:bg-neutral-900"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isSending || !question.trim()}
            className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default Chat;