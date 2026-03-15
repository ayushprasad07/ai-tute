// app/content/[contentId]/page.tsx

"use client";

import Chat from "@/components/Chat";
import { FileUpload } from "@/components/ui/file-upload";
import { ApiResponse } from "@/types/ApiResponse";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { useTheme } from "next-themes";
import {
  Download, Copy, Check, FileText, ExternalLink,
  Loader2, Brain, Award, ChevronRight, ChevronLeft,
  RotateCcw, Sparkles, GraduationCap, BookOpen, Zap,
  MessageSquare, AlignLeft, Moon, Sun, Github, GitBranch,
  Code, FolderTree, Star, Eye, GitFork
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import RepoGraph from "@/components/RepoGraph";

interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: string | number;
  explanation: string;
}

interface QuizData {
  _id: string;
  contentId: string;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

interface RepoFile {
  path: string;
  size: number;
  type: string;
}

interface RepoGraphData {
  nodes: { id: string; label: string; folder: string }[];
  edges: { source: string; target: string }[];
}

const Content = () => {
  const params = useParams();
  const contentId = params.contentId as string;
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [files, setFiles] = useState<File[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [summary, setSummary] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState<"summary" | "chat" | "graph">("summary");

  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isProcessingYoutube, setIsProcessingYoutube] = useState(false);
  const [isProcessingGithub, setIsProcessingGithub] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: quizData, isLoading: isLoadingQuiz } = useQuery<QuizData>({
    queryKey: ["quiz", contentId],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/quiz/get-quiz/${contentId}`);
        if (response.data.success) return response.data.data;
        return null;
      } catch { return null; }
    },
    enabled: !!contentId,
    retry: false,
  });

  const { data: content, isLoading } = useQuery({
    queryKey: ["content", contentId],
    queryFn: async () => {
      const response = await axios.get(`/api/content/fetch-content-by-id/${contentId}`);
      if (response.data.success) return response.data.content;
      return null;
    },
    enabled: !!contentId,
  });

  
  const handleFileUpload = (files: File[]) => setFiles(files);

  const handleUpload = async () => {
    if (!files.length) return toast.error("Upload a file first");
    setIsUploading(true); setDisabled(true);
    try {
      const formData = new FormData();
      formData.append("pdf", files[0]);
      formData.append("contentId", contentId);
      const response = await axios.post("/api/content/pdf-upload", formData);
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: ["content", contentId] });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? "Something went wrong");
    } finally { setIsUploading(false); setDisabled(false); }
  };

  const handleGenerate = async () => {
    setIsGeneratingSummary(true);
    try {
      await axios.post("/api/content/process-pdf", { contentId });
      const summaryRes = await axios.post("/api/content/generate-summary", { contentId });
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.content);
        queryClient.invalidateQueries({ queryKey: ["content", contentId] });
        toast.success("Summary generated!");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? "Something went wrong");
    } finally { setIsGeneratingSummary(false); }
  };

  const handleURLSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setIsProcessingYoutube(true);
    try {
      await axios.post("/api/content/process-youtube", { contentId: params.contentId, sourceUrl });
      const summaryRes = await axios.post("/api/content/generate-summary", { contentId });
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.content);
        queryClient.invalidateQueries({ queryKey: ["content", contentId] });
        toast.success("Video processed successfully!");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? "Something went wrong");
    } finally { setIsProcessingYoutube(false); }
  };

  const handleGithubSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessingGithub(true);
    try {
      // First process the GitHub repo
      await axios.post("/api/content/process-github", { 
        contentId, 
        sourceUrl: repoUrl 
      });
      
      // Then generate summary
      const summaryRes = await axios.post("/api/content/generate-summary", { contentId });
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.content);
        queryClient.invalidateQueries({ queryKey: ["content", contentId] });
        toast.success("Repository processed successfully!");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? "Something went wrong");
    } finally { setIsProcessingGithub(false); }
  };

  const handleCopySummary = async () => {
    await navigator.clipboard.writeText(content?.summary || summary);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSummary = () => {
    const element = document.createElement("a");
    const file = new Blob([content?.summary || summary], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `summary-${contentId}.md`;
    document.body.appendChild(element); element.click(); document.body.removeChild(element);
  };

  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    try {
      const response = await axios.post("/api/quiz", { contentId });
      if (response.data.success) {
        toast.success("Quiz generated!");
        queryClient.invalidateQueries({ queryKey: ["quiz", contentId] });
        setSelectedAnswers({}); setShowResults(false); setCurrentQuestionIndex(0);
        setQuizDialogOpen(true);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? "Failed to generate quiz");
    } finally { setIsGeneratingQuiz(false); }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) =>
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));

  const isAnswerCorrect = (question: QuizQuestion, questionIndex: number): boolean => {
    const sel = selectedAnswers[questionIndex];
    if (sel === undefined) return false;
    const correctIdx = typeof question.correctAnswer === "string"
      ? question.options.indexOf(question.correctAnswer)
      : question.correctAnswer;
    return sel === correctIdx;
  };

  const calculateScore = () => {
    if (!quizData?.questions) return 0;
    return quizData.questions.filter((q, i) => isAnswerCorrect(q, i)).length;
  };

  const allQuestionsAnswered = quizData?.questions
    ? Object.keys(selectedAnswers).length === quizData.questions.length : false;

  const isYoutube = content?.type === "youtube";
  const isGithub = content?.type === "github";
  const hasSummary = !!(content?.summary || summary);
  const url = content?.url;
  const thumbnailUrl = isYoutube ? `https://img.youtube.com/vi/${url}/maxresdefault.jpg` : "";
  const title = content?.title || "Content Studio";
  const hasQuiz = quizData?.questions && quizData.questions.length > 0;
  const repoGraph = content?.repoGraph as RepoGraphData | undefined;

  const syntaxTheme = theme === "dark" ? vscDarkPlus : vs;

  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={syntaxTheme}
          language={match[1]}
          PreTag="div"
          className="rounded-xl my-4 border border-border"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg text-sm font-mono" {...props}>
          {children}
        </code>
      );
    },
    h1: ({ children }: any) => <h1 className="text-2xl font-bold mt-6 mb-3 text-foreground">{children}</h1>,
    h2: ({ children }: any) => (
      <h2 className="text-lg font-semibold mt-5 mb-2 flex items-center gap-2 text-foreground">
        <span className="w-1.5 h-5 bg-blue-500 rounded-full inline-block flex-shrink-0" />
        {children}
      </h2>
    ),
    h3: ({ children }: any) => <h3 className="text-base font-semibold mt-4 mb-2 text-foreground/90">{children}</h3>,
    p: ({ children }: any) => <p className="text-sm leading-7 mb-3 text-muted-foreground">{children}</p>,
    ul: ({ children }: any) => <ul className="space-y-2 mb-3 pl-3">{children}</ul>,
    li: ({ children }: any) => (
      <li className="flex items-start gap-2 text-muted-foreground">
        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
        <span className="text-sm">{children}</span>
      </li>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-3 bg-blue-500/5 rounded-r-xl text-muted-foreground italic text-sm">
        {children}
      </blockquote>
    ),
  };

  // Loading state
  if (isLoading || !mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-blue-500/40 animate-ping" style={{ animationDelay: "0.2s" }} />
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 absolute inset-0 m-auto" />
          </div>
          <p className="text-muted-foreground text-xs tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  // Main view with summary
  if (hasSummary) {
    return (
      <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 h-15 border-b border-border bg-background/90 backdrop-blur-xl flex items-center p-6 gap-3 z-20">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
              {isGithub ? (
                <Github className="w-3.5 h-3.5 text-white" />
              ) : (
                <GraduationCap className="w-3.5 h-3.5 text-white" />
              )}
            </div>
            <h1 className="text-sm font-semibold text-foreground/90 truncate">{title}</h1>
            {isGithub && (
              <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                <GitBranch className="w-3 h-3 mr-1" />
                GitHub
              </Badge>
            )}
            <span className="hidden md:flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full flex-shrink-0">
              <Sparkles className="w-3 h-3" /> AI Summary
            </span>
          </div>

          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopySummary}
              className="h-8 px-3 text-xs gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              size="sm"
              onClick={handleGenerateQuiz}
              disabled={isGeneratingQuiz}
              className="h-8 px-3 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isGeneratingQuiz ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
              {isGeneratingQuiz ? "Generating..." : "Take Quiz"}
            </Button>
          </div>

          {/* Mobile quiz button */}
          <Button
            size="sm"
            onClick={handleGenerateQuiz}
            disabled={isGeneratingQuiz}
            className="sm:hidden h-8 px-3 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
          >
            {isGeneratingQuiz ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
            Quiz
          </Button>
        </header>

        {/* Mobile tab switcher */}
        <div className="lg:hidden flex-shrink-0 flex bg-muted/30 border-b border-border">
          <button
            onClick={() => setMobileTab("summary")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all border-b-2",
              mobileTab === "summary"
                ? "text-blue-600 dark:text-blue-400 border-blue-500"
                : "text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            <AlignLeft className="w-4 h-4" /> Summary
          </button>
          {isGithub && (
            <button
              onClick={() => setMobileTab("graph")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all border-b-2",
                mobileTab === "graph"
                  ? "text-purple-600 dark:text-purple-400 border-purple-500"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              )}
            >
              <GitBranch className="w-4 h-4" /> Repo Graph
            </button>
          )}
          <button
            onClick={() => setMobileTab("chat")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all border-b-2",
              mobileTab === "chat"
                ? "text-blue-600 dark:text-blue-400 border-blue-500"
                : "text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            <MessageSquare className="w-4 h-4" /> AI Tutor
          </button>
        </div>

        {/* Body - Three column layout for GitHub, two for others */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left panel - Summary for all content types */}
          <div className={cn(
            "flex-col overflow-hidden border-r border-border transition-all duration-300",
            isGithub ? "lg:w-[40%]" : "lg:w-[55%]",
            // Mobile visibility: show only when active, desktop always show
            mobileTab === "summary" ? "flex" : "hidden lg:flex"
          )}>
            {/* Media preview */}
            <div className="flex-shrink-0 relative overflow-hidden bg-muted/20" style={{ height: "190px" }}>
              <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

              {isYoutube ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-black/20 border border-border" style={{ width: "260px" }}>
                    <Image
                      src={thumbnailUrl}
                      width={520} height={293}
                      alt="Video thumbnail"
                      className="w-full h-auto object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://img.youtube.com/vi/default.jpg"; }}
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <a
                        href={`https://youtube.com/watch?v=${url}`}
                        target="_blank" rel="noopener noreferrer"
                        className="w-11 h-11 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110"
                      >
                        <ExternalLink className="w-4 h-4 text-white" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      {isGithub ? (
                        <Github className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground max-w-[200px] truncate text-center">
                      {isGithub 
                        ? content?.url?.split("/").slice(-2).join("/") || "GitHub Repository"
                        : content?.fileUrl?.split("/").pop() || "PDF Document"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Summary label bar */}
            <div className="flex-shrink-0 flex items-center gap-3 px-6 py-3 border-b border-border bg-background">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-600 to-blue-400 flex-shrink-0" />
              <h2 className="text-sm font-semibold text-foreground">Summary</h2>
              <div className="ml-auto flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopySummary}
                  className="sm:hidden h-8 w-8"
                  title="Copy"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownloadSummary}
                  className="sm:hidden h-8 w-8"
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
                <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BookOpen className="w-3.5 h-3.5" /> AI-Generated
                </span>
              </div>
            </div>

            {/* Scrollable summary body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
              <div className="max-w-2xl mx-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                  {content?.summary || summary}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Middle panel - Graph for GitHub */}
          {isGithub && (
            <div className={cn(
              "flex-col overflow-hidden border-r border-border transition-all duration-300",
              "lg:w-[30%]",
              // Mobile visibility: show only when active, desktop always show
              mobileTab === "graph" ? "flex" : "hidden lg:flex"
            )}>
              <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-background/50 flex items-center justify-between">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-purple-500" />
                  Repository Graph
                </h2>
                {repoGraph && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-purple-500/10">
                      {repoGraph.nodes?.length || 0} nodes
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-blue-500/10">
                      {repoGraph.edges?.length || 0} edges
                    </Badge>
                  </div>
                )}
              </div>
              <div className="flex-1 relative min-h-0 p-2">
                {repoGraph ? (
                  <div className="absolute inset-2">
                    <RepoGraph graph={repoGraph} />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
                      <p className="text-sm text-muted-foreground">Loading graph...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right panel - Chat */}
          <div className={cn(
            "overflow-hidden flex-col transition-all duration-300 w-full",
            isGithub ? "lg:w-[30%]" : "lg:w-[45%]",
            // Mobile visibility: show only when active, desktop always show
            mobileTab === "chat" ? "flex" : "hidden lg:flex"
          )}>
            <Chat contentId={contentId} />
          </div>
        </div>

        {/* Quiz Dialog */}
        <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[88vh] overflow-y-auto bg-background border-border text-foreground rounded-2xl shadow-2xl">
            <DialogHeader className="pb-4 border-b border-border">
              <DialogTitle className="flex items-center gap-3 text-foreground text-lg">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                Knowledge Quiz
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Test your understanding of <span className="text-blue-600 dark:text-blue-400">{title}</span>
              </DialogDescription>
            </DialogHeader>

            {isLoadingQuiz ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
              </div>
            ) : hasQuiz ? (
              <div className="space-y-5 pt-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Question {currentQuestionIndex + 1} of {quizData!.questions.length}</span>
                    {showResults && <span className="text-blue-600 dark:text-blue-400 font-semibold">Score: {calculateScore()}/{quizData!.questions.length}</span>}
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                      style={{ width: `${((currentQuestionIndex + 1) / quizData!.questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {!showResults ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/20 border border-border rounded-2xl">
                      <p className="font-medium text-sm mb-4 text-foreground leading-relaxed">
                        {quizData!.questions[currentQuestionIndex].question}
                      </p>
                      <RadioGroup
                        key={`question-${currentQuestionIndex}`}
                        value={selectedAnswers[currentQuestionIndex]?.toString()}
                        onValueChange={(value) => handleAnswerSelect(currentQuestionIndex, parseInt(value))}
                        className="space-y-2"
                      >
                        {quizData!.questions[currentQuestionIndex].options.map((option, optIndex) => (
                          <label
                            key={optIndex}
                            htmlFor={`q${currentQuestionIndex}-opt${optIndex}`}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                              selectedAnswers[currentQuestionIndex] === optIndex
                                ? "border-blue-500/60 bg-blue-500/10 text-foreground"
                                : "border-border bg-muted/20 text-muted-foreground hover:border-blue-500/30 hover:bg-muted/30"
                            )}
                          >
                            <RadioGroupItem 
                              value={optIndex.toString()} 
                              id={`q${currentQuestionIndex}-opt${optIndex}`} 
                              className="border-blue-500 text-blue-600 dark:text-blue-400 flex-shrink-0" 
                            />
                            <span className="text-sm leading-snug">{option}</span>
                          </label>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="flex justify-between items-center">
                      <Button
                        variant="ghost"
                        onClick={() => setCurrentQuestionIndex(i => i - 1)}
                        disabled={currentQuestionIndex === 0}
                        className="gap-1.5"
                      >
                        <ChevronLeft className="w-4 h-4" /> Prev
                      </Button>
                      {currentQuestionIndex === quizData!.questions.length - 1 ? (
                        <Button
                          onClick={() => setShowResults(true)}
                          disabled={!allQuestionsAnswered}
                          className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Zap className="w-4 h-4" /> Submit
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setCurrentQuestionIndex(i => i + 1)}
                          disabled={selectedAnswers[currentQuestionIndex] === undefined}
                          className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Next <ChevronRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 text-center">
                      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />
                      <Award className="h-10 w-10 mx-auto text-blue-600 dark:text-blue-400 mb-3 relative" />
                      <h3 className="text-3xl font-bold text-foreground mb-1 relative">
                        {calculateScore()}<span className="text-muted-foreground text-xl">/{quizData!.questions.length}</span>
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 text-sm relative">
                        {calculateScore() === quizData!.questions.length
                          ? "🎉 Perfect Score!"
                          : calculateScore() >= quizData!.questions.length / 2
                          ? "Well done! Keep it up."
                          : "Keep practicing!"}
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {quizData!.questions.map((q, qIndex) => {
                        const isCorrect = isAnswerCorrect(q, qIndex);
                        const correctIdx = typeof q.correctAnswer === "string"
                          ? q.options.indexOf(q.correctAnswer) : q.correctAnswer;
                        return (
                          <div key={qIndex} className={cn(
                            "p-4 rounded-xl border",
                            isCorrect ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"
                          )}>
                            <p className="text-sm font-medium text-foreground mb-2">{qIndex + 1}. {q.question}</p>
                            <p className="text-xs text-muted-foreground">
                              Your answer: <span className={isCorrect ? "text-green-500" : "text-red-500"}>
                                {selectedAnswers[qIndex] !== undefined ? q.options[selectedAnswers[qIndex]] : "—"}
                              </span>
                            </p>
                            {!isCorrect && <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Correct: {q.options[correctIdx]}</p>}
                            <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">{q.explanation}</p>
                          </div>
                        );
                      })}
                    </div>

                    <Button
                      onClick={() => { setSelectedAnswers({}); setShowResults(false); setCurrentQuestionIndex(0); }}
                      className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <RotateCcw className="w-4 h-4" /> Retake Quiz
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground text-sm mb-4">No quiz available yet.</p>
                <Button onClick={handleGenerateQuiz} disabled={isGeneratingQuiz} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Generate Quiz
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Upload / Input screens
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs px-3 py-1.5 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" /> Powered by AI
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
            {isYoutube
              ? "Paste a YouTube link to generate a smart summary and start an AI tutoring session."
              : isGithub
              ? "Enter a GitHub repository URL to analyze code structure and generate documentation."
              : "Upload your PDF and let AI create a comprehensive learning experience."}
          </p>
        </div>

        <div className="bg-muted/20 border border-border rounded-2xl p-6 space-y-4 backdrop-blur-sm">
          {isYoutube ? (
            <form onSubmit={handleURLSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">YouTube URL</label>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  required
                  className="w-full bg-background border border-border text-foreground placeholder:text-muted-foreground/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <Button type="submit" disabled={isProcessingYoutube} className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                {isProcessingYoutube ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Zap className="w-4 h-4" /> Process Video</>}
              </Button>
            </form>
          ) : isGithub ? (
            <form onSubmit={handleGithubSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">GitHub Repository URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/username/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  required
                  className="w-full bg-background border border-border text-foreground placeholder:text-muted-foreground/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 transition-all"
                />
              </div>
              <Button type="submit" disabled={isProcessingGithub} className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                {isProcessingGithub ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing Repo...</> : <><Code className="w-4 h-4" /> Analyze Repository</>}
              </Button>
            </form>
          ) : (
            <>
              <div className="border-2 border-dashed border-border rounded-xl p-5 hover:border-blue-500/30 transition-colors">
                <FileUpload onChange={handleFileUpload} />
              </div>
              <Button 
                onClick={handleUpload} 
                disabled={disabled || files.length === 0 || isUploading}
                variant="outline"
                className="w-full gap-2"
              >
                {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : "Upload PDF"}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center"><span className="px-3 bg-background text-muted-foreground text-xs">then</span></div>
              </div>
              <Button onClick={handleGenerate} disabled={isGeneratingSummary} className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                {isGeneratingSummary ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Summary</>}
              </Button>
            </>
          )}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2.5">
          {[
            { icon: BookOpen, label: "Smart Summary" },
            { icon: Brain, label: "AI Quiz" },
            { icon: isGithub ? Code : GraduationCap, label: isGithub ? "Code Analysis" : "Tutor Chat" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/20 border border-border">
              <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Theme toggle */}
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Content;