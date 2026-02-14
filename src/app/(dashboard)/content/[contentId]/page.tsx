"use client";

import Chat from "@/components/Chat";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiResponse } from "@/types/ApiResponse";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import {
  Download,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Youtube,
  FileText,
  ExternalLink,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Content = () => {
  const params = useParams();
  const contentId = params.contentId as string;

  const [files, setFiles] = useState<File[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [summary, setSummary] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const queryClient = useQueryClient();

  const handleFileUpload = (files: File[]) => {
    setFiles(files);
  };

  const handleUpload = async () => {
    if (!files.length) return toast.error("Upload a file first");

    setDisabled(true);
    try {
      const formData = new FormData();
      formData.append("pdf", files[0]);
      formData.append("contentId", contentId);

      const response = await axios.post("/api/content/pdf-upload", formData);
      toast.success(response.data.message);

      queryClient.invalidateQueries({
        queryKey: ["content", contentId],
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? "Something went wrong"
      );
    } finally {
      setDisabled(false);
    }
  };

  const handleGenerate = async () => {
    try {
      await axios.post("/api/content/process-pdf", { contentId });

      const summaryRes = await axios.post(
        "/api/content/generate-summary",
        { contentId }
      );

      if (summaryRes.data.success) {
        setSummary(summaryRes.data.content);

        queryClient.invalidateQueries({
          queryKey: ["content", contentId],
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? "Something went wrong"
      );
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSourceUrl(e.target.value);
  };

  const handleURLSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/content/process-youtube", {
        contentId: params.contentId,
        sourceUrl: sourceUrl,
      });

      const summaryRes = await axios.post(
        "/api/content/generate-summary",
        { contentId }
      );

      if (summaryRes.data.success) {
        setSummary(summaryRes.data.content);

        queryClient.invalidateQueries({
          queryKey: ["content", contentId],
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? "Something went wrong"
      );
    }
  };

  const handleCopySummary = async () => {
    await navigator.clipboard.writeText(content?.summary || summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSummary = () => {
    const element = document.createElement("a");
    const file = new Blob([content?.summary || summary], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `summary-${contentId}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const { data: content, isLoading } = useQuery({
    queryKey: ["content", contentId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/content/fetch-content-by-id/${contentId}`
      );

      if (response.data.success) {
        return response.data.content;
      }

      return null;
    },
    enabled: !!contentId,
  });

  const isYoutube = content?.type === "youtube";
  const hasSummary = !!(content?.summary || summary);
  const url = content?.url;
  const thumbnailUrl = isYoutube ? `https://img.youtube.com/vi/${url}/maxresdefault.jpg` : "";

  // Custom components for markdown rendering
  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          className="rounded-lg my-4"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-md text-sm" {...props}>
          {children}
        </code>
      );
    },
    h1: ({ children }: any) => <h1 className="text-3xl font-bold mt-6 mb-4">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-2xl font-semibold mt-5 mb-3">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-semibold mt-4 mb-2">{children}</h3>,
    p: ({ children }: any) => <p className="text-base leading-7 mb-4">{children}</p>,
    ul: ({ children }: any) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 dark:bg-blue-950/30 italic">
        {children}
      </blockquote>
    ),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-50 to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return hasSummary ? (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-50 to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="container mx-auto p-4 max-w-7xl">
        

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Summary */}
          <div className="space-y-6">
            {/* Media Preview */}
            <Card className="relative overflow-hidden bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border-neutral-200 dark:border-neutral-800">
              <div className="aspect-video relative flex items-center justify-center p-6">
                <BackgroundRippleEffect />
                {isYoutube ? (
                  <div className="relative z-10 w-full max-w-2xl">
                    <Card className="overflow-hidden shadow-xl bg-white dark:bg-neutral-900">
                      <Image
                        src={thumbnailUrl}
                        width={1280}
                        height={720}
                        alt="Video thumbnail"
                        className="w-full h-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://img.youtube.com/vi/default.jpg";
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <a
                          href={`https://youtube.com/watch?v=${url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-600 text-white p-4 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                        >
                          <ExternalLink className="h-6 w-6" />
                        </a>
                      </div>
                    </Card>
                  </div>
                ) : (
                  <Card className="shadow-lg border p-8 z-10 bg-white dark:bg-neutral-900">
                    <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground text-center">
                      {content?.fileUrl?.split("/").pop() || "PDF Document"}
                    </p>
                  </Card>
                )}
              </div>
            </Card>

            {/* Summary Content */}
            <Card className={`border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm ${
              isFullscreen ? "fixed inset-4 z-50 overflow-auto" : ""
            }`}>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>
                  AI-generated summary of your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className={isFullscreen ? "h-[calc(100vh-12rem)]" : "h-[400px]"}>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={MarkdownComponents}
                    >
                      {content?.summary || summary}
                    </ReactMarkdown>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Chat */}
          <div className="lg:sticky lg:top-4 h-fit">
            <Card className="border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <CardTitle>AI Tutor Chat</CardTitle>
                </div>
                <CardDescription>
                  Ask questions about the content and get instant answers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <Chat contentId={contentId} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  ) : isYoutube ? (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-50 to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="container mx-auto p-4 max-w-2xl">
        <Card className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle>Add YouTube Video</CardTitle>
            <CardDescription>
              Enter the YouTube URL to generate a summary and start chatting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleURLSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sourceUrl">YouTube URL</Label>
                <Input
                  id="sourceUrl"
                  placeholder="https://youtube.com/watch?v=..."
                  value={sourceUrl}
                  onChange={handleUrlChange}
                  required
                  className="bg-white dark:bg-neutral-900"
                />
              </div>
              <Button type="submit" className="w-full">
                Process Video
              </Button>
            </form>
            {summary && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Generated Summary</h3>
                <ScrollArea className="h-[300px] rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 bg-white/50 dark:bg-neutral-900/50">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={MarkdownComponents}
                  >
                    {summary}
                  </ReactMarkdown>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-50 to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="container mx-auto p-4 max-w-2xl">
        <Card className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle>Upload PDF</CardTitle>
            <CardDescription>
              Upload a PDF document to generate a summary and start chatting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg p-6 bg-white/50 dark:bg-neutral-900/50">
              <FileUpload onChange={handleFileUpload} />
            </div>

            <Button
              className="w-full"
              disabled={disabled || files.length === 0}
              onClick={handleUpload}
            >
              {disabled ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload PDF"
              )}
            </Button>

            <Separator className="bg-neutral-200 dark:border-neutral-800" />

            <div className="space-y-4">
              <Button
                onClick={handleGenerate}
                className="w-full"
                variant="secondary"
              >
                Generate Summary
              </Button>
              
              {summary && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Generated Summary</h3>
                  <ScrollArea className="h-[300px] rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 bg-white/50 dark:bg-neutral-900/50">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={MarkdownComponents}
                    >
                      {summary}
                    </ReactMarkdown>
                  </ScrollArea>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Content;