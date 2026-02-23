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
import { useState, useEffect } from "react";
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
  FileText,
  ExternalLink,
  Loader2,
  MessageSquare,
  BookOpen,
  GraduationCap,
  Brain,
  Award,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { extractTranscript } from "@/lib/youtube/extractTranscript";

// Types for quiz
interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: string | number; // Can be either string or number
  explanation: string;
}

interface QuizData {
  _id: string;
  contentId: string;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

const Content = () => {
  const params = useParams();
  const contentId = params.contentId as string;

  const [files, setFiles] = useState<File[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [summary, setSummary] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Loading states
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isProcessingYoutube, setIsProcessingYoutube] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  
  // Quiz states
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch quiz data using the correct route
  const { data: quizData, isLoading: isLoadingQuiz } = useQuery<QuizData>({
    queryKey: ["quiz", contentId],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/quiz/get-quiz/${contentId}`);
        if (response.data.success) {
          return response.data.data;
        }
        return null;
      } catch (error) {
        return null;
      }
    },
    enabled: !!contentId,
    retry: false,
  });

  const handleFileUpload = (files: File[]) => {
    setFiles(files);
  };

  const handleUpload = async () => {
    if (!files.length) return toast.error("Upload a file first");

    setIsUploading(true);
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
      setIsUploading(false);
      setDisabled(false);
    }
  };

  const handleGenerate = async () => {
    setIsGeneratingSummary(true);
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
        
        toast.success("Summary generated successfully!");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? "Something went wrong"
      );
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSourceUrl(e.target.value);
  };

  const handleURLSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessingYoutube(true);
    try {
      const transcript = await extractTranscript(sourceUrl);
      await axios.post("/api/content/process-youtube", {
        contentId: params.contentId,
        sourceUrl: sourceUrl,
        transcript : transcript
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
        
        toast.success("Video processed successfully!");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? "Something went wrong"
      );
    } finally {
      setIsProcessingYoutube(false);
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

  // Quiz handlers
  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    try {
      const response = await axios.post("/api/quiz", { contentId });
      
      if (response.data.success) {
        toast.success("Quiz generated successfully!");
        
        queryClient.invalidateQueries({
          queryKey: ["quiz", contentId],
        });
        
        // Reset quiz state
        setSelectedAnswers({});
        setShowResults(false);
        setCurrentQuestionIndex(0);
        
        // Open quiz dialog
        setQuizDialogOpen(true);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? "Failed to generate quiz"
      );
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const isAnswerCorrect = (question: QuizQuestion, questionIndex: number): boolean => {
    const selectedAnswer = selectedAnswers[questionIndex];
    if (selectedAnswer === undefined) return false;
    
    // Handle both string and number correctAnswer types
    const correctAnswerIndex = typeof question.correctAnswer === 'string' 
      ? question.options.indexOf(question.correctAnswer)
      : question.correctAnswer;
    
    return selectedAnswer === correctAnswerIndex;
  };

  const calculateScore = () => {
    if (!quizData?.questions) return 0;
    let correct = 0;
    quizData.questions.forEach((q, index) => {
      if (isAnswerCorrect(q, index)) {
        correct++;
      }
    });
    return correct;
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setCurrentQuestionIndex(0);
  };

  const handleNextQuestion = () => {
    if (quizData && currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
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
  const title = content?.title || "Content Studio";
  const hasQuiz = quizData?.questions && quizData.questions.length > 0;

  // Check if all questions are answered
  const allQuestionsAnswered = quizData?.questions 
    ? Object.keys(selectedAnswers).length === quizData.questions.length
    : false;

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
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">Loading content...</p>
        </div>
      </div>
    );
  }

  return hasSummary ? (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-50 to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Hero Title Section */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          
          <div className="flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-400">
            <GraduationCap className="h-4 w-4" />
            <span className="text-sm">Interactive Learning Experience</span>
            <BookOpen className="h-4 w-4 ml-2" />
            <span className="text-sm">AI-Generated Summary</span>
          </div>
          
          <div className="mt-4 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-transparent rounded-full"></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopySummary}
            className="gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadSummary}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="gap-2"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            onClick={handleGenerateQuiz}
            disabled={isGeneratingQuiz}
            className="gap-2 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white"
          >
            {isGeneratingQuiz ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Brain className="h-4 w-4" />
            )}
            {isGeneratingQuiz ? "Generating Quiz..." : "Generate Quiz"}
          </Button>
        </div>

        {/* Quiz Dialog */}
        <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-600">
                <Brain className="h-5 w-5 text-blue-600" />
                Quiz: {title}
              </DialogTitle>
              <DialogDescription>
                Test your knowledge with these AI-generated questions
              </DialogDescription>
            </DialogHeader>

            {isLoadingQuiz ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : hasQuiz ? (
              <div className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Question {currentQuestionIndex + 1} of {quizData.questions.length}</span>
                    {showResults && (
                      <span className="font-semibold text-blue-600">
                        Score: {calculateScore()}/{quizData.questions.length}
                      </span>
                    )}
                  </div>
                  <Progress 
                    value={((currentQuestionIndex + 1) / quizData.questions.length) * 100} 
                    className="h-2 [&>div]:bg-blue-600"
                  />
                </div>

                {/* Current Question */}
                {!showResults ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900">
                      <p className="font-medium text-lg mb-4 text-blue-900 dark:text-blue-100">
                        {quizData.questions[currentQuestionIndex].question}
                      </p>
                      
                      <RadioGroup
                        key={`question-${currentQuestionIndex}`}
                        value={selectedAnswers[currentQuestionIndex]?.toString()}
                        onValueChange={(value) => 
                          handleAnswerSelect(currentQuestionIndex, parseInt(value))
                        }
                        className="space-y-3"
                      >
                        {quizData.questions[currentQuestionIndex].options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value={optIndex.toString()} 
                              id={`q${currentQuestionIndex}-opt${optIndex}`}
                              className="border-blue-400 text-blue-600 focus:ring-blue-400"
                            />
                            <Label 
                              htmlFor={`q${currentQuestionIndex}-opt${optIndex}`}
                              className="text-gray-700 dark:text-gray-300"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={handlePrevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950"
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <div className="space-x-2">
                        {currentQuestionIndex === quizData.questions.length - 1 ? (
                          <Button 
                            onClick={handleSubmitQuiz}
                            disabled={!allQuestionsAnswered}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Submit Quiz
                          </Button>
                        ) : (
                          <Button 
                            onClick={handleNextQuestion}
                            disabled={selectedAnswers[currentQuestionIndex] === undefined}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Results View */
                  <div className="space-y-6">
                    <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <Award className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                      <h3 className="text-2xl font-bold mb-2 text-blue-800 dark:text-blue-200">
                        Your Score: {calculateScore()}/{quizData.questions.length}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400">
                        {calculateScore() === quizData.questions.length 
                          ? "Perfect! Excellent work!" 
                          : calculateScore() >= quizData.questions.length / 2 
                          ? "Good job! Keep learning!" 
                          : "Keep practicing! You'll do better next time."}
                      </p>
                    </div>

                    {/* Question Review */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200">Review Questions:</h4>
                      {quizData.questions.map((q, qIndex) => {
                        const isCorrect = isAnswerCorrect(q, qIndex);
                        const selectedAnswerIndex = selectedAnswers[qIndex];
                        const correctAnswerIndex = typeof q.correctAnswer === 'string'
                          ? q.options.indexOf(q.correctAnswer)
                          : q.correctAnswer;
                        
                        return (
                          <Card key={qIndex} className={`border-l-4 ${
                            isCorrect ? "border-l-green-500" : "border-l-red-500"
                          }`}>
                            <CardContent className="p-4">
                              <p className="font-medium mb-2 text-blue-900 dark:text-blue-100">{qIndex + 1}. {q.question}</p>
                              <p className="text-sm mb-1">
                                Your answer: {selectedAnswerIndex !== undefined ? q.options[selectedAnswerIndex] : "Not answered"}
                                {isCorrect ? " ✅" : " ❌"}
                              </p>
                              {!isCorrect && (
                                <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                                  Correct answer: {q.options[correctAnswerIndex]}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground mt-2 border-t border-blue-100 dark:border-blue-800 pt-2">
                                {q.explanation}
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    <Button 
                      onClick={handleResetQuiz} 
                      className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Retake Quiz
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No quiz available for this content.</p>
                <Button 
                  onClick={handleGenerateQuiz} 
                  disabled={isGeneratingQuiz}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isGeneratingQuiz ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Generate Quiz
                    </>
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

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
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          
          <p className="text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto">
            Transform your YouTube video into an interactive learning experience with AI-powered summaries
          </p>
          
          <div className="mt-4 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-red-600 via-red-400 to-transparent rounded-full"></div>
          </div>
        </div>

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
              <Button 
                type="submit" 
                className="w-full"
                disabled={isProcessingYoutube}
              >
                {isProcessingYoutube ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Video...
                  </>
                ) : (
                  "Process Video"
                )}
              </Button>
            </form>
            {isGeneratingSummary && (
              <div className="mt-6 text-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Generating summary...</p>
              </div>
            )}
            {summary && !isGeneratingSummary && (
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
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          
          <p className="text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto">
            Upload your PDF and let AI create comprehensive summaries for enhanced learning
          </p>
          
          <div className="mt-4 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-transparent rounded-full"></div>
          </div>
        </div>

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
              disabled={disabled || files.length === 0 || isUploading}
              onClick={handleUpload}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading PDF...
                </>
              ) : (
                "Upload PDF"
              )}
            </Button>

            <Separator />

            <div className="space-y-4">
              <Button
                onClick={handleGenerate}
                className="w-full"
                variant="secondary"
                disabled={isGeneratingSummary}
              >
                {isGeneratingSummary ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  "Generate Summary"
                )}
              </Button>
              
              {isGeneratingSummary && (
                <div className="text-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Processing your PDF and generating summary...</p>
                </div>
              )}
              
              {summary && !isGeneratingSummary && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Generated Summary</h3>
                  <ScrollArea className="h-[300px] rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
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