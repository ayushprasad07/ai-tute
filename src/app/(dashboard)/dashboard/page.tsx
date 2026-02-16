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
  LineChart,
  Line,
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
  ChevronRight,
  Sparkles,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  TrendingUp as TrendingUpIcon,
  Layers,
  Upload,
  Award,
  Target,
  Users,
  BookOpen,
  Video,
  FileCheck,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  RefreshCw,
  Download,
  Share2,
  Star,
  Clock3,
  CheckCircle2,
  XCircle as XCircleIcon,
  PlayCircle,
  FileText as FileTextIcon,
  BarChart2,
  TrendingUpDownIcon
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow, format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
 DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Separator } from "@/components/ui/separator"

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

const COLORS = {
  primary: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
  success: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
  warning: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'],
  error: ['#ef4444', '#f87171', '#fca5a5', '#fecaca'],
  blue: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af']
}

const STATUS_CONFIG = {
  ready: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Ready', spin: false },
  processing: { icon: Loader2, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Processing', spin: true },
  failed: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Failed', spin: false },
  default: { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', label: 'Pending', spin: false }
}

const TYPE_CONFIG = {
  pdf: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'PDF' },
  youtube: { icon: Youtube, color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'YouTube' }
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl"
      >
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-neutral-600 dark:text-neutral-400">{entry.name}:</span>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </motion.div>
    );
  }
  return null;
};

// Animated counter component
const AnimatedCounter = ({ value, duration = 2000 }: { value: number, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
};

// Stat card component
const StatCard = ({ title, value, icon: Icon, trend, description, color = 'blue', isLoading }: any) => {
  const trendIcon = trend > 0 ? ArrowUpRight : ArrowDownRight;
  const trendColor = trend > 0 ? 'text-emerald-500' : 'text-rose-500';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <Card className="relative overflow-hidden bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-neutral-200/50 dark:border-neutral-800/50 hover:shadow-2xl transition-all duration-300">
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }} />
        </div>

        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-xl bg-${color}-500/10 text-${color}-500 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              <div className="text-3xl font-bold text-foreground">
                <AnimatedCounter value={value} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                {trend !== undefined && (
                  <Badge variant="outline" className={`${trendColor} bg-${trendColor}/10 border-${trendColor}/20`}>
                    <TrendingUpDownIcon className="h-3 w-3 mr-1" />
                    {Math.abs(trend)}%
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Wavy Area Chart Component
const WavyAreaChart = ({ data, color = '#3b82f6' }: { data: any[], color?: string }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="50%" stopColor={color} stopOpacity={0.1} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" opacity={0.3} />
        <XAxis 
          dataKey="date" 
          stroke="#737373" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#737373" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="count"
          stroke={color}
          strokeWidth={3}
          fill={`url(#gradient-${color})`}
          dot={{ fill: color, r: 4, strokeWidth: 2, stroke: 'white' }}
          activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
          filter="url(#glow)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Donut Chart Component
const DonutChart = ({ data, colors }: { data: any[], colors: string[] }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
          labelLine={{ stroke: '#737373', strokeWidth: 1 }}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={colors[index % colors.length]}
              stroke="white"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Status Wavy Chart Component
const StatusWavyChart = ({ data }: { data: { ready: number; processing: number; failed: number } }) => {
  const chartData = [
    { name: 'Ready', value: data.ready, color: '#10b981' },
    { name: 'Processing', value: data.processing, color: '#f59e0b' },
    { name: 'Failed', value: data.failed, color: '#ef4444' }
  ];

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {chartData.map((item, index) => (
              <linearGradient key={index} id={`statusGradient-${item.name}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={item.color} stopOpacity={0.3} />
                <stop offset="50%" stopColor={item.color} stopOpacity={0.1} />
                <stop offset="100%" stopColor={item.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" opacity={0.2} />
          <XAxis 
            dataKey="name" 
            stroke="#737373" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#737373" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {chartData.map((item, index) => (
            <Area
              key={index}
              type="monotone"
              dataKey="value"
              data={[item]}
              stroke={item.color}
              strokeWidth={2}
              fill={`url(#statusGradient-${item.name})`}
              dot={{ fill: item.color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.default;
  const Icon = config.icon;
  
  return (
    <Badge className={`${config.bg} ${config.color} ${config.border} border px-2 py-0.5`}>
      <Icon className={`h-3 w-3 mr-1 ${config.spin ? 'animate-spin' : ''}`} />
      <span className="text-xs">{config.label}</span>
    </Badge>
  );
};

// Type Badge Component
const TypeBadge = ({ type }: { type: string }) => {
  const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.pdf;
  const Icon = config.icon;
  
  return (
    <Badge variant="outline" className={`${config.bg} ${config.color} border-0`}>
      <Icon className="h-3 w-3 mr-1" />
      <span className="text-xs">{config.label}</span>
    </Badge>
  );
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
  const [selectedTimeRange, setSelectedTimeRange] = useState('week')

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-neutral-950 dark:via-blue-950/10 dark:to-neutral-950">
      {/* Animated background */}
      {/* <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
      </div> */}

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back! Here's your content analytics overview.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Time range selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  {selectedTimeRange === 'week' ? 'This Week' : selectedTimeRange === 'month' ? 'This Month' : 'All Time'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectedTimeRange('week')}>This Week</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedTimeRange('month')}>This Month</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedTimeRange('all')}>All Time</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Refresh button */}
            <Button 
              variant="outline" 
              size="icon"
              onClick={fetchDashboardData}
              className="relative overflow-hidden group"
            >
              <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
            </Button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <FileUp className="mr-2 h-4 w-4 group-hover:-translate-y-1 transition-transform" />
                  Upload New Content
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Create New Content</DialogTitle>
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
                        placeholder="Enter a descriptive title"
                        required
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </Field>
                    <Field>
                      <Label>Content Type</Label>
                      <RadioGroup 
                        value={credentials.type}
                        onValueChange={(value) => handleChange("type", value)}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <RadioGroupItem value="pdf" id="pdf" className="peer sr-only" />
                          <Label
                            htmlFor="pdf"
                            className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-white dark:bg-neutral-900 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer transition-all"
                          >
                            <FileText className="mb-2 h-6 w-6 text-blue-500" />
                            <span className="font-medium">PDF Document</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="youtube" id="youtube" className="peer sr-only" />
                          <Label
                            htmlFor="youtube"
                            className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-white dark:bg-neutral-900 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 peer-data-[state=checked]:border-rose-500 [&:has([data-state=checked])]:border-rose-500 cursor-pointer transition-all"
                          >
                            <Youtube className="mb-2 h-6 w-6 text-rose-500" />
                            <span className="font-medium">YouTube Video</span>
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
                        'Create Content'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Uploads"
            value={contentOverview?.totalContents || 0}
            icon={Layers}
            trend={12}
            description="vs last month"
            color="blue"
            isLoading={isLoading}
          />
          <StatCard
            title="Summaries Generated"
            value={aiUsage?.summariesGenerated || 0}
            icon={FileCheck}
            trend={8}
            description="ready to view"
            color="emerald"
            isLoading={isLoading}
          />
          <StatCard
            title="Total Messages"
            value={aiUsage?.totalMessages || 0}
            icon={MessageSquare}
            trend={24}
            description="across all chats"
            color="blue"
            isLoading={isLoading}
          />
          <StatCard
            title="Active Chats"
            value={chatActivity.length}
            icon={Users}
            trend={-5}
            description="this week"
            color="blue"
            isLoading={isLoading}
          />
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/50 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Content Overview
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <TrendingUpIcon className="h-4 w-4 mr-2" />
              Upload Trends
            </TabsTrigger>
            <TabsTrigger value="chats" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Activity className="h-4 w-4 mr-2" />
              Chat Activity
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-neutral-200/50 dark:border-neutral-800/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Content Distribution</CardTitle>
                      <CardDescription>
                        Breakdown of your content by type and status
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="px-3 py-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        Live
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[400px] w-full" />
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Donut Chart for Content Types */}
                      <div className="h-[350px]">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">Content by Type</h3>
                        <DonutChart
                          data={[
                            { name: 'PDF Documents', value: contentOverview?.totalPDF || 0 },
                            { name: 'YouTube Videos', value: contentOverview?.totalYouTube || 0 },
                          ]}
                          colors={[COLORS.blue[0], COLORS.blue[2]]}
                        />
                      </div>

                      {/* Status Distribution with Wavy Chart */}
                      <div className="space-y-6">
                        <h3 className="text-sm font-medium text-muted-foreground">Content Status</h3>
                        
                        {contentOverview && (
                          <StatusWavyChart 
                            data={{
                              ready: contentOverview.ready,
                              processing: contentOverview.processing,
                              failed: contentOverview.failed
                            }}
                          />
                        )}

                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-4 pt-4">
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
                            <span className="text-xs text-muted-foreground block">Ready</span>
                            <p className="text-lg font-bold text-emerald-500">{contentOverview?.ready || 0}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                            <Loader2 className="h-4 w-4 text-amber-500 mx-auto mb-1 animate-spin" />
                            <span className="text-xs text-muted-foreground block">Processing</span>
                            <p className="text-lg font-bold text-amber-500">{contentOverview?.processing || 0}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                            <XCircleIcon className="h-4 w-4 text-rose-500 mx-auto mb-1" />
                            <span className="text-xs text-muted-foreground block">Failed</span>
                            <p className="text-lg font-bold text-rose-500">{contentOverview?.failed || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="trends" className="mt-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-neutral-200/50 dark:border-neutral-800/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Upload Trends</CardTitle>
                      <CardDescription>
                        Track your content uploads over time
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        Uploads
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[400px] w-full" />
                  ) : (
                    <div className="h-[400px]">
                      <WavyAreaChart data={contentTrend} color={COLORS.blue[0]} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="chats" className="mt-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-neutral-200/50 dark:border-neutral-800/50">
                <CardHeader>
                  <CardTitle className="text-2xl">Most Active Chats</CardTitle>
                  <CardDescription>
                    Content with the highest engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[400px] w-full" />
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Bar Chart */}
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={chatActivity.slice(0, 5)}
                            layout="vertical"
                            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" opacity={0.3} horizontal={false} />
                            <XAxis type="number" stroke="#737373" />
                            <YAxis 
                              type="category" 
                              dataKey="title" 
                              stroke="#737373"
                              tick={{ fontSize: 12 }}
                              tickLine={false}
                              axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar 
                              dataKey="messages" 
                              fill={COLORS.blue[0]}
                              radius={[0, 4, 4, 0]}
                              barSize={20}
                            >
                              {chatActivity.slice(0, 5).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS.blue[index % COLORS.blue.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Top Chats List */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Top Performing Content</h3>
                        <div className="space-y-2">
                          {chatActivity.slice(0, 5).map((chat, index) => (
                            <motion.div
                              key={chat.contentId}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer group"
                              onClick={() => router.push(`/content/${chat.contentId}`)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium text-sm group-hover:text-blue-500 transition-colors">
                                    {chat.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {chat.messages} messages
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Recent Uploads Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-neutral-200/50 dark:border-neutral-800/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Recent Uploads</CardTitle>
                    <CardDescription>
                      Your latest content additions
                    </CardDescription>
                  </div>
                </div>
                {allContent.length > 4 && (
                  <Button 
                    variant="ghost" 
                    onClick={() => router.push('/content')}
                    className="gap-2 group text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                  >
                    View All
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </div>
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
                      .map((content, index) => (
                        <motion.div
                          key={content._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -4 }}
                          onClick={() => router.push(`/content/${content._id}`)}
                          className="group relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                        >
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          
                          <div className="relative p-5">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-xl ${TYPE_CONFIG[content.type as keyof typeof TYPE_CONFIG]?.bg || 'bg-blue-500/10'} group-hover:scale-110 transition-transform duration-300`}>
                                {content.type === 'pdf' ? (
                                  <FileText className={`h-5 w-5 ${TYPE_CONFIG[content.type as keyof typeof TYPE_CONFIG]?.color || 'text-blue-500'}`} />
                                ) : (
                                  <Youtube className={`h-5 w-5 ${TYPE_CONFIG[content.type as keyof typeof TYPE_CONFIG]?.color || 'text-rose-500'}`} />
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground truncate group-hover:text-blue-500 transition-colors">
                                  {content.title}
                                </h3>
                                
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(content.createdAt), 'MMM d, yyyy')}
                                  </div>
                                  <span className="text-muted-foreground">•</span>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock3 className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(content.createdAt), { addSuffix: true })}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 mt-2">
                                  <TypeBadge type={content.type} />
                                  <StatusBadge status={content.status} />
                                </div>
                              </div>
                            </div>

                            {/* Quick actions */}
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/content/${content._id}`); }}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-rose-500">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>

                  {/* Summary Footer */}
                  <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-muted-foreground">Total Uploads:</span>
                          <span className="font-medium">{allContent.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-muted-foreground">Ready:</span>
                          <span className="font-medium">{contentOverview?.ready || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          <span className="text-muted-foreground">Processing:</span>
                          <span className="font-medium">{contentOverview?.processing || 0}</span>
                        </div>
                      </div>
                      
                      <Badge variant="outline" className="gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        {Math.round((contentOverview?.ready || 0) / (contentOverview?.totalContents || 1) * 100)}% Success Rate
                      </Badge>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <div className="relative inline-block">
                      <div className="p-6 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 mb-4">
                        <Upload className="h-12 w-12 text-blue-500" />
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-1 -right-1"
                      >
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                      </motion.div>
                    </div>
                  </motion.div>
                  <h3 className="font-semibold text-xl mb-2">No uploads yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Get started by uploading your first content. You can upload PDF documents or YouTube videos.
                  </p>
                  <Button 
                    onClick={() => setDialogOpen(true)} 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all group"
                  >
                    <FileUp className="mr-2 h-4 w-4 group-hover:-translate-y-1 transition-transform" />
                    Upload Your First Content
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Add custom CSS for animations */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default Dashboard