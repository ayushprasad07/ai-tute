// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
//   CardFooter,
// } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Textarea } from '@/components/ui/textarea';
// import { Input } from '@/components/ui/input';
// import { ScrollArea } from '@/components/ui/scroll-area';
// // import { Separator } from '@/components/ui/separator';
// import { Skeleton } from '@/components/ui/skeleton';
// import { toast } from 'sonner';
// import {
//   FileText,
//   Youtube,
//   ArrowLeft,
//   MessageSquare,
//   BookOpen,
//   RefreshCw,
//   Copy,
//   Check,
//   Send,
//   Bot,
//   User,
//   Clock,
//   Calendar,
//   AlertCircle,
//   ExternalLink,
//   Brain,
//   CheckCircle,
// } from 'lucide-react';
// import { formatDistanceToNow } from 'date-fns';

// interface Content {
//   _id: string;
//   title: string;
//   type: 'pdf' | 'youtube';
//   sourceUrl?: string;
//   content?: string;
//   status: 'processing' | 'ready' | 'failed';
//   createdAt: string;
//   updatedAt: string;
// }

// interface ChatMessage {
//   id: string;
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: Date;
// }

// const ContentDetailPage = () => {
//   const params = useParams();
//   const router = useRouter();
//   const { data: session } = useSession();
//   const [content, setContent] = useState<Content | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
//     {
//       id: '1',
//       role: 'assistant',
//       content: 'Hello! I can help you analyze and discuss this content. Ask me anything about it!',
//       timestamp: new Date(),
//     },
//   ]);
//   const [userInput, setUserInput] = useState('');
//   const [isChatLoading, setIsChatLoading] = useState(false);
//   const [copied, setCopied] = useState(false);
//   const [activeTab, setActiveTab] = useState('summary');

//   const contentId = params.contentId as string;

//   // Fetch content details
//   const fetchContent = async () => {
//     try {
//       const response = await fetch('/api/content/fetch-single', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ contentId }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         if (data.success) {
//           setContent(data.content);
//         } else {
//           toast.error(data.message || 'Failed to fetch content');
//           router.push('/dashboard');
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching content:', error);
//       toast.error('Failed to load content');
//       router.push('/dashboard');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Generate summary if not exists
//   const generateSummary = async () => {
//     if (!content || content.content) return;

//     try {
//       const response = await fetch('/api/content/generate-summary', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ contentId }),
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         toast.success('Summary generated successfully');
//         fetchContent(); // Refresh content
//       } else {
//         toast.error(data.message || 'Failed to generate summary');
//       }
//     } catch (error) {
//       console.error('Summary generation error:', error);
//       toast.error('Failed to generate summary');
//     }
//   };

//   // Handle chat message submission
//   const handleSendMessage = async () => {
//     if (!userInput.trim() || !content) return;

//     const userMessage: ChatMessage = {
//       id: Date.now().toString(),
//       role: 'user',
//       content: userInput,
//       timestamp: new Date(),
//     };

//     setChatMessages(prev => [...prev, userMessage]);
//     setUserInput('');
//     setIsChatLoading(true);

//     try {
//       // Call chat API
//       const response = await fetch('/api/content/chat', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           contentId,
//           message: userInput,
//           chatHistory: chatMessages.slice(-5), // Send last 5 messages for context
//         }),
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         const assistantMessage: ChatMessage = {
//           id: (Date.now() + 1).toString(),
//           role: 'assistant',
//           content: data.response,
//           timestamp: new Date(),
//         };
//         setChatMessages(prev => [...prev, assistantMessage]);
//       } else {
//         throw new Error(data.message || 'Chat failed');
//       }
//     } catch (error) {
//       console.error('Chat error:', error);
//       toast.error('Failed to get response');
      
//       const errorMessage: ChatMessage = {
//         id: (Date.now() + 1).toString(),
//         role: 'assistant',
//         content: 'Sorry, I encountered an error. Please try again.',
//         timestamp: new Date(),
//       };
//       setChatMessages(prev => [...prev, errorMessage]);
//     } finally {
//       setIsChatLoading(false);
//     }
//   };

//   // Copy summary to clipboard
//   const copyToClipboard = async () => {
//     if (!content?.content) return;
    
//     try {
//       await navigator.clipboard.writeText(content.content);
//       setCopied(true);
//       toast.success('Summary copied to clipboard');
//       setTimeout(() => setCopied(false), 2000);
//     } catch (error) {
//       console.error('Copy failed:', error);
//       toast.error('Failed to copy');
//     }
//   };

//   // Reprocess content
//   const handleReprocess = async () => {
//     if (!content) return;

//     try {
//       const endpoint = content.type === 'pdf' 
//         ? '/api/content/process-pdf'
//         : '/api/content/process-youtube';
      
//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ contentId }),
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         toast.success('Content reprocessing started');
//         fetchContent();
//       } else {
//         toast.error(data.message || 'Failed to reprocess');
//       }
//     } catch (error) {
//       console.error('Reprocess error:', error);
//       toast.error('Failed to reprocess');
//     }
//   };

//   // Initialize
//   useEffect(() => {
//     if (contentId) {
//       fetchContent();
//     }
//   }, [contentId]);

//   // Auto-generate summary if content is ready but no summary
//   useEffect(() => {
//     if (content?.status === 'ready' && !content.content) {
//       generateSummary();
//     }
//   }, [content]);

//   if (loading) {
//     return (
//       <div className="container mx-auto p-4 md:p-6">
//         <div className="space-y-4">
//           <Skeleton className="h-12 w-1/3" />
//           <div className="grid gap-6 md:grid-cols-3">
//             <Skeleton className="h-40" />
//             <Skeleton className="h-40 md:col-span-2" />
//           </div>
//           <Skeleton className="h-64" />
//         </div>
//       </div>
//     );
//   }

//   if (!content) {
//     return (
//       <div className="container mx-auto p-4 md:p-6 text-center">
//         <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
//         <h2 className="text-2xl font-bold mt-4">Content not found</h2>
//         <p className="text-muted-foreground mt-2">The content you're looking for doesn't exist.</p>
//         <Button onClick={() => router.push('/dashboard')} className="mt-4">
//           <ArrowLeft className="h-4 w-4 mr-2" />
//           Back to Dashboard
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4 md:p-6 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
//         <div className="space-y-1">
//           <Button
//             variant="ghost"
//             onClick={() => router.push('/dashboard')}
//             className="pl-0 hover:pl-2 transition-all"
//           >
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back to Dashboard
//           </Button>
//           <div className="flex items-center gap-3">
//             <h1 className="text-3xl font-bold tracking-tight">{content.title}</h1>
//             <Badge variant={content.type === 'pdf' ? 'default' : 'destructive'}>
//               {content.type === 'pdf' ? (
//                 <FileText className="h-3 w-3 mr-1" />
//               ) : (
//                 <Youtube className="h-3 w-3 mr-1" />
//               )}
//               {content.type.toUpperCase()}
//             </Badge>
//             <StatusBadge status={content.status} />
//           </div>
//           <div className="flex items-center gap-4 text-sm text-muted-foreground">
//             <div className="flex items-center gap-1">
//               <Calendar className="h-3 w-3" />
//               Created {formatDistanceToNow(new Date(content.createdAt), { addSuffix: true })}
//             </div>
//             <div className="flex items-center gap-1">
//               <Clock className="h-3 w-3" />
//               Updated {formatDistanceToNow(new Date(content.updatedAt), { addSuffix: true })}
//             </div>
//           </div>
//         </div>
        
//         <div className="flex gap-2">
//           {content.status === 'ready' && content.content && (
//             <Button variant="outline" onClick={copyToClipboard}>
//               {copied ? (
//                 <Check className="h-4 w-4 mr-2" />
//               ) : (
//                 <Copy className="h-4 w-4 mr-2" />
//               )}
//               Copy Summary
//             </Button>
//           )}
//           {content.status !== 'processing' && (
//             <Button variant="outline" onClick={handleReprocess}>
//               <RefreshCw className="h-4 w-4 mr-2" />
//               Reprocess
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Source URL */}
//       {content.sourceUrl && (
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 {content.type === 'pdf' ? (
//                   <FileText className="h-5 w-5 text-blue-600" />
//                 ) : (
//                   <Youtube className="h-5 w-5 text-red-600" />
//                 )}
//                 <div>
//                   <p className="font-medium">Source</p>
//                   <p className="text-sm text-muted-foreground truncate">
//                     {content.sourceUrl}
//                   </p>
//                 </div>
//               </div>
//               <Button 
//                 variant="ghost" 
//                 size="sm"
//                 onClick={() => window.open(content.sourceUrl, '_blank')}
//               >
//                 <ExternalLink className="h-4 w-4 mr-2" />
//                 Open
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Tabs */}
//       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
//         <TabsList className="grid w-full md:w-auto grid-cols-2">
//           <TabsTrigger value="summary" className="flex items-center gap-2">
//             <BookOpen className="h-4 w-4" />
//             Summary
//           </TabsTrigger>
//           <TabsTrigger value="chat" className="flex items-center gap-2">
//             <MessageSquare className="h-4 w-4" />
//             Chat with AI
//           </TabsTrigger>
//         </TabsList>

//         {/* Summary Tab */}
//         <TabsContent value="summary" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Content Summary</CardTitle>
//               <CardDescription>
//                 AI-generated summary of the content
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               {content.status === 'processing' ? (
//                 <div className="text-center py-8">
//                   <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
//                   <p className="mt-4 text-muted-foreground">
//                     Content is being processed. This may take a few minutes...
//                   </p>
//                 </div>
//               ) : content.status === 'failed' ? (
//                 <div className="text-center py-8">
//                   <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
//                   <p className="mt-4 text-red-600">
//                     Content processing failed. Please try reprocessing.
//                   </p>
//                 </div>
//               ) : content.content ? (
//                 <div className="prose prose-sm max-w-none dark:prose-invert">
//                   <p className="whitespace-pre-wrap">{content.content}</p>
//                 </div>
//               ) : (
//                 <div className="text-center py-8">
//                   <p className="text-muted-foreground mb-4">
//                     No summary available yet.
//                   </p>
//                   <Button onClick={generateSummary}>
//                     <Brain className="h-4 w-4 mr-2" />
//                     Generate Summary
//                   </Button>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Chat Tab */}
//         <TabsContent value="chat" className="space-y-4">
//           <Card className="h-[600px] flex flex-col">
//             <CardHeader className="border-b">
//               <CardTitle>Chat with AI Assistant</CardTitle>
//               <CardDescription>
//                 Ask questions about this content
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="flex-1 p-0">
//               <ScrollArea className="h-full p-4">
//                 <div className="space-y-4">
//                   {chatMessages.map((message) => (
//                     <div
//                       key={message.id}
//                       className={`flex gap-3 ${
//                         message.role === 'user' ? 'flex-row-reverse' : ''
//                       }`}
//                     >
//                       <div
//                         className={`flex h-8 w-8 items-center justify-center rounded-full ${
//                           message.role === 'user'
//                             ? 'bg-primary text-primary-foreground'
//                             : 'bg-muted'
//                         }`}
//                       >
//                         {message.role === 'user' ? (
//                           <User className="h-4 w-4" />
//                         ) : (
//                           <Bot className="h-4 w-4" />
//                         )}
//                       </div>
//                       <div
//                         className={`max-w-[70%] space-y-1 ${
//                           message.role === 'user' ? 'text-right' : ''
//                         }`}
//                       >
//                         <div
//                           className={`rounded-2xl px-4 py-2 ${
//                             message.role === 'user'
//                               ? 'bg-primary text-primary-foreground'
//                               : 'bg-muted'
//                           }`}
//                         >
//                           <p className="text-sm">{message.content}</p>
//                         </div>
//                         <p className="text-xs text-muted-foreground">
//                           {formatDistanceToNow(message.timestamp, { addSuffix: true })}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                   {isChatLoading && (
//                     <div className="flex gap-3">
//                       <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
//                         <Bot className="h-4 w-4" />
//                       </div>
//                       <div className="space-y-1">
//                         <div className="rounded-2xl px-4 py-2 bg-muted">
//                           <div className="flex gap-1">
//                             <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
//                             <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
//                             <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </ScrollArea>
//             </CardContent>
//             <CardFooter className="border-t p-4">
//               <form
//                 onSubmit={(e) => {
//                   e.preventDefault();
//                   handleSendMessage();
//                 }}
//                 className="flex w-full gap-2"
//               >
//                 <Input
//                   placeholder="Ask a question about this content..."
//                   value={userInput}
//                   onChange={(e) => setUserInput(e.target.value)}
//                   disabled={isChatLoading || content.status !== 'ready'}
//                   className="flex-1"
//                 />
//                 <Button
//                   type="submit"
//                   disabled={
//                     isChatLoading || 
//                     !userInput.trim() || 
//                     content.status !== 'ready'
//                   }
//                 >
//                   <Send className="h-4 w-4" />
//                 </Button>
//               </form>
//             </CardFooter>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// // Helper component for status badge
// const StatusBadge = ({ status }: { status: string }) => {
//   switch (status) {
//     case 'ready':
//       return (
//         <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
//           <CheckCircle className="w-3 h-3 mr-1" />
//           Ready
//         </Badge>
//       );
//     case 'processing':
//       return (
//         <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
//           <Clock className="w-3 h-3 mr-1" />
//           Processing
//         </Badge>
//       );
//     case 'failed':
//       return (
//         <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
//           <AlertCircle className="w-3 h-3 mr-1" />
//           Failed
//         </Badge>
//       );
//     default:
//       return <Badge variant="outline">{status}</Badge>;
//   }
// };

// export default ContentDetailPage;

"use client"

import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { ApiResponse } from '@/types/ApiResponse';
import axios, { AxiosError } from 'axios';
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // for GitHub Flavored Markdown

const Content = () => {
  const params = useParams();
  const [files, setFiles] = useState<File[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (files: File[]) => {
    setFiles(files);
  };

  const handleUpload = async () => {
    setDisabled(true);
    try {
      const formData = new FormData();
      formData.append("pdf", files[0]);
      formData.append("contentId", params.contentId as string);

      const response = await axios.post("/api/content/pdf-upload", formData);
      toast.success(response.data.message);
      
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? "Something went wrong");
    } finally {
      setDisabled(false);
    }
  }

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Process PDF
      const response = await axios.post("/api/content/process-pdf", {
        contentId: params.contentId as string
      });

      if (response.data.success) {
        toast.success(response.data.message);
      }

      // Generate summary
      const summaryResponse = await axios.post("/api/content/generate-summary", {
        contentId: params.contentId as string
      });

      if (summaryResponse.data.success) {
        // Convert HTML to Markdown for react-markdown
        const markdownContent = htmlToMarkdown(summaryResponse.data.content);
        setSummary(markdownContent);
        toast.success(summaryResponse.data.message);
      }

    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Function to convert HTML to Markdown
  const htmlToMarkdown = (html: string): string => {
    let markdown = html
      // Remove HTML tags
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<ul[^>]*>(.*?)<\/ul>/gi, (match, p1) => {
        return p1.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
      })
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    return markdown;
  }

  // Custom components for react-markdown
  const MarkdownComponents = {
    h1: ({ node, ...props }: any) => (
      <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white" {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-800 dark:text-gray-200" {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700 dark:text-gray-300" {...props} />
    ),
    h4: ({ node, ...props }: any) => (
      <h4 className="text-lg font-semibold mt-3 mb-2 text-gray-600 dark:text-gray-400" {...props} />
    ),
    p: ({ node, ...props }: any) => (
      <p className="my-3 leading-relaxed text-gray-600 dark:text-gray-400" {...props} />
    ),
    ul: ({ node, ...props }: any) => (
      <ul className="list-disc pl-6 my-4 space-y-2 text-gray-600 dark:text-gray-400" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol className="list-decimal pl-6 my-4 space-y-2 text-gray-600 dark:text-gray-400" {...props} />
    ),
    li: ({ node, ...props }: any) => (
      <li className="mb-2" {...props} />
    ),
    strong: ({ node, ...props }: any) => (
      <strong className="font-bold text-gray-800 dark:text-gray-300" {...props} />
    ),
    em: ({ node, ...props }: any) => (
      <em className="italic text-gray-700 dark:text-gray-400" {...props} />
    ),
    a: ({ node, ...props }: any) => (
      <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />
    ),
    blockquote: ({ node, ...props }: any) => (
      <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic text-gray-600 dark:text-gray-400" {...props} />
    ),
    code: ({ node, inline, ...props }: any) => 
      inline ? (
        <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-sm font-mono" {...props} />
      ) : (
        <code className="block bg-gray-100 dark:bg-gray-800 rounded p-4 my-4 overflow-x-auto text-sm font-mono" {...props} />
      ),
    hr: ({ node, ...props }: any) => (
      <hr className="my-8 border-t border-gray-300 dark:border-gray-700" {...props} />
    ),
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6">
      <div className="mb-8 p-6 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          PDF Content Analyzer
        </h1>
        
        <div className="mb-6">
          <FileUpload onChange={handleFileUpload} />
          <Button 
            className="mt-4"
            disabled={disabled || files.length === 0}
            onClick={handleUpload}
          >
            {disabled ? 'Uploading...' : 'Upload PDF'}
          </Button>
        </div>

        <div className="mt-6">
          <Button 
            onClick={handleGenerate}
            disabled={loading || files.length === 0}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Summary...
              </span>
            ) : 'Generate Summary'}
          </Button>
        </div>
      </div>

      {summary && (
        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Generated Summary
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(summary)}
              className="text-gray-600 dark:text-gray-400"
            >
              Copy Markdown
            </Button>
          </div>
          
          <div className="p-4 md:p-6 border border-gray-100 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={MarkdownComponents}
              // className="prose prose-lg max-w-none dark:prose-invert prose-headings:scroll-mt-24"
            >
              {summary}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default Content;