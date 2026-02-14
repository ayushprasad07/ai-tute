"use client"
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
import { ApiResponse } from "@/types/ApiResponse"
import axios, { AxiosError } from "axios"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import { 
  FileText, 
  Youtube, 
  Loader2, 
  Clock, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  TrendingUp,
  Calendar,
  FileUp,
  Eye,
  ChevronRight
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface ContentOverview {
  totalContents: number
  totalPDF: number
  totalYouTube: number
  processing: number
  ready: number
  failed: number
}

interface AIUsage {
  summariesGenerated: number
  totalMessages: number
  userMessages: number
  assistantMessages: number
}

interface ChatActivity {
  contentId: string
  title: string
  messages: number
}

interface ContentTrend {
  date: string
  count: number
}

interface Content {
  _id: string
  title: string
  type: string
  status: string
  createdAt: string
  fileUrl?: string
  youtubeUrl?: string
  summary?: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-neutral-900 p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{label}</p>
        <p className="text-sm text-blue-600 dark:text-blue-400">
          {payload[0].name}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [credentials, setCredentials] = useState({
    title: '',
    type: 'pdf',
  })
  const [contentOverview, setContentOverview] = useState<ContentOverview | null>(null)
  const [aiUsage, setAiUsage] = useState<AIUsage | null>(null)
  const [chatActivity, setChatActivity] = useState<ChatActivity[]>([])
  const [contentTrend, setContentTrend] = useState<ContentTrend[]>([])
  const [allContent, setAllContent] = useState<Content[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // Fetch all analytics data in parallel
      const [
        contentOverviewRes,
        aiUsageRes,
        chatActivityRes,
        contentTrendRes,
        allContentRes
      ] = await Promise.all([
        axios.post("/api/analytics/content-overview"),
        axios.get("/api/analytics/ai-usage"),
        axios.get("/api/analytics/chat-activity"),
        axios.get("/api/analytics/content-trend"),
        axios.post("/api/content/fetch-all")
      ])

      if (contentOverviewRes.data.success) {
        setContentOverview(contentOverviewRes.data)
      }
      if (aiUsageRes.data.success) {
        setAiUsage(aiUsageRes.data.aiUsage)
      }
      if (chatActivityRes.data.success) {
        setChatActivity(chatActivityRes.data.activity)
      }
      if (contentTrendRes.data.success) {
        setContentTrend(contentTrendRes.data.trend)
      }
      if (allContentRes.data.success) {
        setAllContent(allContentRes.data.contents)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (name: string, value: string) => {
    setCredentials({...credentials, [name]: value})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      const response = await axios.post("/api/content", credentials)

      if(response.data.success){
        toast.success(response.data.message)
        setDialogOpen(false)
        setCredentials({ title: '', type: 'pdf' })
        // Refresh data after successful upload
        fetchDashboardData()
        router.push(`/content/${response.data.content._id}`)
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message ?? "Something went wrong")
    } finally {
      setIsCreating(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'processing':
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300 border-gray-200 dark:border-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'pdf' ? 
      <FileText className="h-4 w-4" /> : 
      <Youtube className="h-4 w-4" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-50 to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back! Here's an overview of your content and analytics.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary cursor-pointer text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all">
                <FileUp className="mr-2 h-4 w-4" />
                Upload New Content
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Content</DialogTitle>
                <DialogDescription>
                  Add a new PDF or YouTube video to start generating summaries and chatting.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      name="title" 
                      value={credentials.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="Enter title"
                      required
                    />
                  </Field>
                  <Field>
                    <Label>Type</Label>
                    <RadioGroup 
                      value={credentials.type}
                      onValueChange={(value) => handleChange("type", value)}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pdf" id="pdf" />
                        <Label htmlFor="pdf" className="cursor-pointer font-normal flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          PDF Document
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="youtube" id="youtube" />
                        <Label htmlFor="youtube" className="cursor-pointer font-normal flex items-center gap-2">
                          <Youtube className="h-4 w-4" />
                          YouTube Video
                        </Label>
                      </div>
                    </RadioGroup>
                  </Field>
                </FieldGroup>
                <DialogFooter className="flex flex-col sm:flex-row gap-2 my-4">
                  <DialogClose asChild className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto" type="button">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Uploads
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{contentOverview?.totalContents || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-600">{contentOverview?.ready || 0}</span> ready,{' '}
                    <span className="text-yellow-600">{contentOverview?.processing || 0}</span> processing
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Summaries Generated
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{aiUsage?.summariesGenerated || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total ready summaries
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Messages
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{aiUsage?.totalMessages || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across all chats
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Chat Activity
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {chatActivity.reduce((acc, curr) => acc + curr.messages, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total messages
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
            <TabsTrigger value="overview">Content Overview</TabsTrigger>
            <TabsTrigger value="trends">Upload Trends</TabsTrigger>
            <TabsTrigger value="chats">Chat Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            <Card className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border-neutral-200 dark:border-neutral-800">
              <CardHeader>
                <CardTitle>Content Distribution</CardTitle>
                <CardDescription>
                  Breakdown of your content by type and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pie Chart for Content Types */}
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'PDF', value: contentOverview?.totalPDF || 0 },
                              { name: 'YouTube', value: contentOverview?.totalYouTube || 0 },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {COLORS.map((color, index) => (
                              <Cell key={`cell-${index}`} fill={color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Bar Chart for Status */}
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Ready', value: contentOverview?.ready || 0 },
                            { name: 'Processing', value: contentOverview?.processing || 0 },
                            { name: 'Failed', value: contentOverview?.failed || 0 },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                          <XAxis dataKey="name" stroke="#737373" />
                          <YAxis stroke="#737373" />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="mt-4">
            <Card className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border-neutral-200 dark:border-neutral-800">
              <CardHeader>
                <CardTitle>Upload Trends Over Time</CardTitle>
                <CardDescription>
                  Number of uploads per day
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={contentTrend}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                        <XAxis dataKey="date" stroke="#737373" />
                        <YAxis stroke="#737373" />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          fill="url(#colorCount)"
                          dot={{ fill: '#3b82f6', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chats" className="mt-4">
            <Card className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border-neutral-200 dark:border-neutral-800">
              <CardHeader>
                <CardTitle>Most Active Chats</CardTitle>
                <CardDescription>
                  Content with the highest message count
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chatActivity.slice(0, 5)}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                        <XAxis type="number" stroke="#737373" />
                        <YAxis 
                          type="category" 
                          dataKey="title" 
                          width={150}
                          tick={{ fontSize: 12 }}
                          stroke="#737373"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="messages" fill="#10b981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Uploads Section - Grid Layout */}
        <Card className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Uploads
            </CardTitle>
            <CardDescription>
              Your latest 4 uploads
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : allContent.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allContent
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 4)
                    .map((content) => (
                      <div
                        key={content._id}
                        onClick={() => router.push(`/content/${content._id}`)}
                        className="group relative flex flex-col p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-lg transition-all cursor-pointer hover:border-blue-500 dark:hover:border-blue-500"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            {getTypeIcon(content.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                              {content.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(content.createdAt), { addSuffix: true })}
                              </p>
                              <Badge className={`${getStatusColor(content.status)} border`}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(content.status)}
                                  <span className="capitalize text-xs">{content.status}</span>
                                </span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
                
                {/* View All Link */}
                {allContent.length > 4 && (
                  <div className="mt-6 text-center">
                    <Button 
                      variant="ghost" 
                      onClick={() => router.push('/content')}
                      className="text-primary hover:text-primary/80 hover:bg-primary/5"
                    >
                      View all {allContent.length} contents
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No uploads yet</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by uploading your first content
                </p>
                <Button onClick={() => setDialogOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Upload Content
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Uploads Summary */}
        {!isLoading && allContent.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            You have uploaded {allContent.length} {allContent.length === 1 ? 'item' : 'items'} in total
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard