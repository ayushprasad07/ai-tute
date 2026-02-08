// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Progress } from '@/components/ui/progress';
// import { Badge } from '@/components/ui/badge';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from 'recharts';
// import {
//   Upload,
//   FileText,
//   Link as LinkIcon,
//   File,
//   RefreshCw,
//   Trash2,
//   Eye,
//   Brain,
//   MoreVertical,
//   Plus,
//   Download,
//   CheckCircle,
//   AlertCircle,
//   Clock,
//   Youtube,
//   ExternalLink,
//   MessageSquare,
// } from 'lucide-react';
// import { toast } from 'sonner';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { Textarea } from '@/components/ui/textarea';

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

// interface Analytics {
//   totalContents: number;
//   pdfs: number;
//   urls: number;
// }

// const Dashboard = () => {
//   const { data: session } = useSession();
//   const router = useRouter();
//   const [analytics, setAnalytics] = useState<Analytics>({
//     totalContents: 0,
//     pdfs: 0,
//     urls: 0,
//   });
//   const [recentContents, setRecentContents] = useState<Content[]>([]);
//   const [activityData, setActivityData] = useState<any[]>([]);
//   const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [uploadTitle, setUploadTitle] = useState('');
//   const [uploadType, setUploadType] = useState<'pdf' | 'youtube'>('pdf');
//   const [uploadFile, setUploadFile] = useState<File | null>(null);
//   const [youtubeUrl, setYoutubeUrl] = useState('');
//   const [processingContents, setProcessingContents] = useState<Set<string>>(new Set());

//   // Fetch all contents
//   const fetchContents = async () => {
//     try {
//       const response = await fetch('/api/content/fetch-all', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         if (data.success) {
//           const contents = data.contents;
//           setRecentContents(contents);
          
//           // Calculate analytics based on your schema
//           const pdfs = contents.filter((c: Content) => c.type === 'pdf').length;
//           const urls = contents.filter((c: Content) => c.type === 'youtube').length;
          
//           setAnalytics({
//             totalContents: contents.length,
//             pdfs,
//             urls,
//           });
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching contents:', error);
//       toast.error('Failed to fetch contents');
//     }
//   };

//   // Handle content upload
//   const handleContentUpload = async () => {
//     if (!uploadTitle.trim()) {
//       toast.error('Please provide a title');
//       return;
//     }

//     if (uploadType === 'pdf' && !uploadFile) {
//       toast.error('Please select a PDF file');
//       return;
//     }

//     if (uploadType === 'youtube' && !youtubeUrl.trim()) {
//       toast.error('Please provide a YouTube URL');
//       return;
//     }

//     setUploading(true);

//     try {
//       let response;
      
//       if (uploadType === 'pdf') {
//         // Upload PDF
//         const formData = new FormData();
//         formData.append('pdf', uploadFile!);
//         formData.append('title', uploadTitle);

//         response = await fetch('/api/content/pdf-upload', {
//           method: 'POST',
//           body: formData,
//         });

//         const data = await response.json();
        
//         if (data.success) {
//           toast.success('PDF uploaded successfully! Processing will begin shortly.');
//           // Start processing
//           await processContent(data.content._id, 'pdf');
//         } else {
//           toast.error(data.message || 'Upload failed');
//         }
//       } else {
//         // Create YouTube content
//         response = await fetch('/api/content/create-youtube', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             title: uploadTitle,
//             sourceUrl: youtubeUrl,
//             type: 'youtube'
//           }),
//         });

//         const data = await response.json();
        
//         if (data.success) {
//           toast.success('YouTube content added successfully! Processing will begin shortly.');
//           // Start processing
//           await processContent(data.content._id, 'youtube');
//         } else {
//           toast.error(data.message || 'Failed to add YouTube content');
//         }
//       }

//       // Reset form
//       setUploadTitle('');
//       setUploadFile(null);
//       setYoutubeUrl('');
//       setIsUploadDialogOpen(false);
      
//       // Refresh contents
//       setTimeout(() => fetchContents(), 2000);
      
//     } catch (error) {
//       console.error('Upload error:', error);
//       toast.error('Upload failed');
//     } finally {
//       setUploading(false);
//     }
//   };

//   // Process content (PDF or YouTube)
//   const processContent = async (contentId: string, type: string) => {
//     try {
//       setProcessingContents(prev => new Set([...prev, contentId]));
      
//       const endpoint = type === 'pdf' 
//         ? '/api/content/process-pdf'
//         : '/api/content/process-youtube';
      
//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ contentId }),
//       });

//       const data = await response.json();
      
//       if (!data.success) {
//         toast.error(`Processing failed: ${data.message}`);
//       }
      
//       // Poll for status update
//       await waitForContentReady(contentId);
      
//     } catch (error) {
//       console.error('Processing error:', error);
//       toast.error('Processing failed');
//     } finally {
//       setProcessingContents(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(contentId);
//         return newSet;
//       });
//     }
//   };

//   // Wait for content to be ready and redirect
//   const waitForContentReady = async (contentId: string) => {
//     let attempts = 0;
//     const maxAttempts = 60; // 60 seconds max wait
    
//     const checkStatus = async () => {
//       const response = await fetch('/api/content/fetch-all', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         const content = data.contents.find((c: Content) => c._id === contentId);
        
//         if (content && content.status === 'ready') {
//           return content;
//         }
//       }
//       return null;
//     };
    
//     while (attempts < maxAttempts) {
//       const content = await checkStatus();
//       if (content) {
//         // Redirect to content page
//         router.push(`/content/${contentId}`);
//         toast.success('Content processed successfully! Redirecting...');
//         return;
//       }
      
//       attempts++;
//       await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
//     }
    
//     toast.warning('Content processing is taking longer than expected');
//   };

//   // Delete content
//   const handleDeleteContent = async (contentId: string) => {
//     if (!confirm('Are you sure you want to delete this content?')) return;
    
//     try {
//       const response = await fetch('/api/content/delete', {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ contentId }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         if (data.success) {
//           toast.success('Content deleted successfully');
//           fetchContents();
//         }
//       }
//     } catch (error) {
//       console.error('Delete error:', error);
//       toast.error('Failed to delete content');
//     }
//   };

//   // Navigate to content page
//   const handleViewContent = (contentId: string) => {
//     router.push(`/content/${contentId}`);
//   };

//   // Navigate to chat
//   const handleChatWithContent = (contentId: string) => {
//     router.push(`/content/${contentId}?tab=chat`);
//   };

//   // Initialize data
//   useEffect(() => {
//     fetchContents();
    
//     // Mock activity data
//     const mockActivityData = [
//       { day: 'Mon', uploads: 4 },
//       { day: 'Tue', uploads: 3 },
//       { day: 'Wed', uploads: 5 },
//       { day: 'Thu', uploads: 7 },
//       { day: 'Fri', uploads: 6 },
//       { day: 'Sat', uploads: 4 },
//       { day: 'Sun', uploads: 8 },
//     ];
//     setActivityData(mockActivityData);
//   }, []);

//   // Status badge component
//   const StatusBadge = ({ status }: { status: string }) => {
//     switch (status) {
//       case 'ready':
//         return (
//           <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
//             <CheckCircle className="w-3 h-3 mr-1" />
//             Ready
//           </Badge>
//         );
//       case 'processing':
//         return (
//           <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
//             <Clock className="w-3 h-3 mr-1" />
//             Processing
//           </Badge>
//         );
//       case 'failed':
//         return (
//           <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
//             <AlertCircle className="w-3 h-3 mr-1" />
//             Failed
//           </Badge>
//         );
//       default:
//         return <Badge variant="outline">{status}</Badge>;
//     }
//   };

//   // Type badge component
//   const TypeBadge = ({ type }: { type: string }) => {
//     switch (type) {
//       case 'pdf':
//         return (
//           <Badge variant="secondary" className="bg-blue-50 text-blue-700">
//             <FileText className="w-3 h-3 mr-1" />
//             PDF
//           </Badge>
//         );
//       case 'youtube':
//         return (
//           <Badge variant="secondary" className="bg-red-50 text-red-700">
//             <Youtube className="w-3 h-3 mr-1" />
//             YouTube
//           </Badge>
//         );
//       default:
//         return (
//           <Badge variant="secondary">
//             <File className="w-3 h-3 mr-1" />
//             {type}
//           </Badge>
//         );
//     }
//   };

//   return (
//     <div className="flex-1 space-y-6 p-4 md:p-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Content Dashboard</h1>
//           <p className="text-muted-foreground mt-1">
//             Upload, process, and analyze your content
//           </p>
//         </div>
//         <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
//           <Button 
//             onClick={() => setIsUploadDialogOpen(true)}
//             className="gap-2"
//           >
//             <Plus className="h-4 w-4" />
//             New Content
//           </Button>
//           <DialogContent className="sm:max-w-[500px]">
//             <DialogHeader>
//               <DialogTitle>Upload New Content</DialogTitle>
//               <DialogDescription>
//                 Add PDF files or YouTube videos to process and analyze
//               </DialogDescription>
//             </DialogHeader>
//             <div className="grid gap-6 py-4">
//               {/* Content Type Selection */}
//               <div className="space-y-3">
//                 <Label>Content Type</Label>
//                 <RadioGroup 
//                   value={uploadType} 
//                   onValueChange={(value: string) => setUploadType(value as 'pdf' | 'youtube')}
//                   className="flex flex-col sm:flex-row gap-3"
//                 >
//                   <div className="flex items-center space-x-2">
//                     <RadioGroupItem value="pdf" id="pdf" />
//                     <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer">
//                       <FileText className="h-4 w-4" />
//                       PDF Document
//                     </Label>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <RadioGroupItem value="youtube" id="youtube" />
//                     <Label htmlFor="youtube" className="flex items-center gap-2 cursor-pointer">
//                       <Youtube className="h-4 w-4" />
//                       YouTube Video
//                     </Label>
//                   </div>
//                 </RadioGroup>
//               </div>

//               {/* Title Input */}
//               <div className="space-y-2">
//                 <Label htmlFor="title">Content Title *</Label>
//                 <Input
//                   id="title"
//                   placeholder="Enter a descriptive title"
//                   value={uploadTitle}
//                   onChange={(e) => setUploadTitle(e.target.value)}
//                   disabled={uploading}
//                 />
//               </div>

//               {/* PDF Upload Section */}
//               {uploadType === 'pdf' && (
//                 <div className="space-y-2">
//                   <Label htmlFor="pdf">PDF File *</Label>
//                   <div className="flex items-center gap-2">
//                     <Input
//                       id="pdf"
//                       type="file"
//                       accept="application/pdf"
//                       onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
//                       disabled={uploading}
//                       className="flex-1"
//                     />
//                   </div>
//                   <p className="text-xs text-muted-foreground">
//                     Maximum file size: 10MB. PDF will be processed for text extraction and embedding.
//                   </p>
//                   {uploadFile && (
//                     <div className="flex items-center gap-2 text-sm text-green-600">
//                       <FileText className="h-4 w-4" />
//                       {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* YouTube URL Section */}
//               {uploadType === 'youtube' && (
//                 <div className="space-y-2">
//                   <Label htmlFor="youtubeUrl">YouTube URL *</Label>
//                   <Input
//                     id="youtubeUrl"
//                     type="url"
//                     placeholder="https://www.youtube.com/watch?v=..."
//                     value={youtubeUrl}
//                     onChange={(e) => setYoutubeUrl(e.target.value)}
//                     disabled={uploading}
//                   />
//                   <p className="text-xs text-muted-foreground">
//                     Enter a valid YouTube URL. Transcript will be extracted and processed.
//                   </p>
//                   {youtubeUrl && youtubeUrl.includes('youtube.com') && (
//                     <div className="flex items-center gap-2 text-sm text-blue-600">
//                       <Youtube className="h-4 w-4" />
//                       Valid YouTube URL detected
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//             <DialogFooter>
//               <Button
//                 variant="outline"
//                 onClick={() => setIsUploadDialogOpen(false)}
//                 disabled={uploading}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handleContentUpload}
//                 disabled={
//                   uploading || 
//                   !uploadTitle.trim() || 
//                   (uploadType === 'pdf' && !uploadFile) ||
//                   (uploadType === 'youtube' && !youtubeUrl.trim())
//                 }
//               >
//                 {uploading ? (
//                   <>
//                     <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
//                     Processing...
//                   </>
//                 ) : (
//                   <>
//                     <Upload className="mr-2 h-4 w-4" />
//                     Upload & Process
//                   </>
//                 )}
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Analytics Cards */}
//       <div className="grid gap-4 md:grid-cols-3">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Contents</CardTitle>
//             <File className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{analytics.totalContents}</div>
//             <p className="text-xs text-muted-foreground">
//               All uploaded contents
//             </p>
//           </CardContent>
//         </Card>
        
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">PDF Documents</CardTitle>
//             <FileText className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{analytics.pdfs}</div>
//             <p className="text-xs text-muted-foreground">
//               Processed PDF files
//             </p>
//           </CardContent>
//         </Card>
        
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">YouTube Videos</CardTitle>
//             <Youtube className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{analytics.urls}</div>
//             <p className="text-xs text-muted-foreground">
//               Processed YouTube videos
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Recent Activity & Content Grid */}
//       <div className="grid gap-6 md:grid-cols-2">
//         {/* Activity Chart */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Upload Activity</CardTitle>
//             <CardDescription>
//               Content uploads over the past week
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="h-[250px]">
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart data={activityData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="day" />
//                   <YAxis />
//                   <Tooltip />
//                   <Line 
//                     type="monotone" 
//                     dataKey="uploads" 
//                     stroke="#8884d8" 
//                     strokeWidth={2}
//                     dot={{ r: 4 }}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Status Distribution */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Processing Status</CardTitle>
//             <CardDescription>
//               Current status of all contents
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {['ready', 'processing', 'failed'].map((status) => {
//                 const count = recentContents.filter(c => c.status === status).length;
//                 const percentage = recentContents.length > 0 
//                   ? Math.round((count / recentContents.length) * 100) 
//                   : 0;
                
//                 return (
//                   <div key={status} className="space-y-2">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <StatusBadge status={status} />
//                         <span className="text-sm font-medium capitalize">{status}</span>
//                       </div>
//                       <span className="text-sm text-muted-foreground">
//                         {count} ({percentage}%)
//                       </span>
//                     </div>
//                     <Progress value={percentage} className="h-2" />
//                   </div>
//                 );
//               })}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Recent Content Table */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Recent Content</CardTitle>
//           <CardDescription>
//             Your recently uploaded and processed content
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Title</TableHead>
//                 <TableHead>Type</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead>Uploaded</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {recentContents.slice(0, 6).map((content) => (
//                 <TableRow key={content._id} className="hover:bg-muted/50">
//                   <TableCell className="font-medium">
//                     <div className="flex items-center gap-2">
//                       {content.title}
//                       {processingContents.has(content._id) && (
//                         <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
//                       )}
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <TypeBadge type={content.type} />
//                   </TableCell>
//                   <TableCell>
//                     <StatusBadge status={content.status} />
//                   </TableCell>
//                   <TableCell>
//                     {new Date(content.createdAt).toLocaleDateString()}
//                   </TableCell>
//                   <TableCell className="text-right">
//                     <div className="flex justify-end gap-2">
//                       {content.status === 'ready' && (
//                         <>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => handleViewContent(content._id)}
//                             className="h-8"
//                           >
//                             <Eye className="h-3 w-3 mr-1" />
//                             View
//                           </Button>
//                           <Button
//                             variant="default"
//                             size="sm"
//                             onClick={() => handleChatWithContent(content._id)}
//                             className="h-8"
//                           >
//                             <MessageSquare className="h-3 w-3 mr-1" />
//                             Chat
//                           </Button>
//                         </>
//                       )}
//                       {content.status !== 'ready' && (
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => processContent(content._id, content.type)}
//                           disabled={processingContents.has(content._id)}
//                           className="h-8"
//                         >
//                           <RefreshCw className="h-3 w-3 mr-1" />
//                           Process
//                         </Button>
//                       )}
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => handleDeleteContent(content._id)}
//                         className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
//                       >
//                         <Trash2 className="h-3 w-3" />
//                       </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))}
//               {recentContents.length === 0 && (
//                 <TableRow>
//                   <TableCell colSpan={5} className="text-center py-8">
//                     <div className="flex flex-col items-center gap-3 text-muted-foreground">
//                       <FileText className="h-12 w-12" />
//                       <div>
//                         <p className="font-medium">No content yet</p>
//                         <p className="text-sm">Upload your first PDF or YouTube video</p>
//                       </div>
//                       <Button 
//                         onClick={() => setIsUploadDialogOpen(true)}
//                         className="mt-2"
//                       >
//                         <Plus className="h-4 w-4 mr-2" />
//                         Upload Content
//                       </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default Dashboard;

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { title } from "process"
import { useState } from "react"

const Dashboard = () => {
    const [credentials, setCredentials] = useState({
        title: '',
        type: '',
    })

    
  return (
    <div>
      <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="name-1">Title</Label>
              <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
            </Field>
            <Field>
              <Label>Type</Label>
              <RadioGroup defaultValue="pdf" className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf" className="cursor-pointer font-normal">
                    PDF
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="youtube" id="youtube" />
                  <Label htmlFor="youtube" className="cursor-pointer font-normal">
                    YouTube
                  </Label>
                </div>
              </RadioGroup>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
    </div>
  )
}

export default Dashboard