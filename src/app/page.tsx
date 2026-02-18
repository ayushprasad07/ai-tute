"use client";
import { NavbarDemo } from "@/components/Navbar";
import { BackgroundLines } from "@/components/ui/background-lines";
import Image from "next/image";
import {  useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Globe3D } from "@/components/ui/3d-globe";
import { Button } from "@/components/ui/button"
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
  TrendingUpDownIcon,
  Search,
  Settings,
  ChevronDown,
  type LucideProps
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow, format } from "date-fns"
import { motion } from "framer-motion"


// Sample data for dashboard preview
const sampleContentOverview = {
  totalContents: 24,
  totalPDF: 15,
  totalYouTube: 9,
  processing: 3,
  ready: 19,
  failed: 2
};

const sampleAllContent = [
  {
    _id: "1",
    title: "Introduction to Machine Learning",
    type: "pdf" as const,
    status: "ready" as const,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "2",
    title: "Advanced React Patterns",
    type: "youtube" as const,
    status: "ready" as const,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "3",
    title: "Python Data Science Handbook",
    type: "pdf" as const,
    status: "processing" as const,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "4",
    title: "System Design Interview Guide",
    type: "youtube" as const,
    status: "ready" as const,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

type ContentStatus = "ready" | "processing" | "failed" | "default";
type ContentType = "pdf" | "youtube";

const STATUS_CONFIG: Record<ContentStatus, { 
  icon: any; 
  color: string; 
  bg: string; 
  border: string; 
  label: string; 
  spin: boolean;
}> = {
  ready: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Ready', spin: false },
  processing: { icon: Loader2, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Processing', spin: true },
  failed: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Failed', spin: false },
  default: { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', label: 'Pending', spin: false }
};

const TYPE_CONFIG: Record<ContentType, { 
  icon: any; 
  color: string; 
  bg: string; 
  label: string;
}> = {
  pdf: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'PDF' },
  youtube: { icon: Youtube, color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'YouTube' }
};

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

// Status Bar Chart Component
const StatusBarChart = ({ data }: { data: { ready: number; processing: number; failed: number } }) => {
  const chartData = [
    { name: 'Ready', value: data.ready, color: '#10b981' },
    { name: 'Processing', value: data.processing, color: '#f59e0b' },
    { name: 'Failed', value: data.failed, color: '#ef4444' }
  ];

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            {chartData.map((item, index) => (
              <linearGradient key={index} id={`statusBarGradient-${item.name}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={item.color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={item.color} stopOpacity={0.3} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" opacity={0.3} vertical={false} />
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
          <Bar 
            dataKey="value" 
            radius={[4, 4, 0, 0]}
            barSize={40}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#statusBarGradient-${entry.name})`}
                stroke={entry.color}
                strokeWidth={1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Type Badge Component
const TypeBadge = ({ type }: { type: ContentType }) => {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;
  
  return (
    <Badge variant="outline" className={`${config.bg} ${config.color} border-0`}>
      <Icon className="h-3 w-3 mr-1" />
      <span className="text-xs">{config.label}</span>
    </Badge>
  );
};

// Status Badge Component
const StatusBadge = ({ status }: { status: ContentStatus }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.default;
  const Icon = config.icon;
  
  return (
    <Badge className={`${config.bg} ${config.color} ${config.border} border px-2 py-0.5`}>
      <Icon className={`h-3 w-3 mr-1 ${config.spin ? 'animate-spin' : ''}`} />
      <span className="text-xs">{config.label}</span>
    </Badge>
  );
};

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  const router = useRouter();

  const handleStartClick = () => {
    router.push("/sign-up")
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white transition-colors duration-300 overflow-x-hidden">
      <NavbarDemo/>

      {/* Hero Section */}
      <div className="relative mx-auto flex min-h-[40rem] w-full items-center overflow-hidden rounded-xl bg-white dark:bg-neutral-950">
  
        {/* Text Section */}
        <div className="relative z-10 p-6 md:p-12 flex flex-col justify-center max-w-2xl">
          <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-neutral-900 md:text-5xl lg:text-6xl dark:text-white">
            Turn Any PDF or Video into Smart Study Notes.
          </h2>

          <p className="mt-2 text-neutral-600 md:mt-6 md:text-lg dark:text-neutral-400">
            Upload, summarize, ask doubts, and generate quizzes — all powered by AI.
          </p>

          <div className="mt-6 flex gap-4 md:mt-8">
            <button onClick={handleStartClick} className="flex cursor-pointer items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 font-medium text-white shadow-[0px_0px_10px_0px_rgba(255,255,255,0.2)_inset] ring ring-white/20 ring-offset-2 ring-offset-neutral-900 transition-all duration-200 ring-inset hover:shadow-[0px_0px_20px_0px_rgba(255,255,255,0.4)_inset] hover:ring-white/40 active:scale-95">
              Get Started
            </button>
          </div>
        </div>

        {/* Globe container */}
        <div className="absolute -right-80 -bottom-96 z-10 size-160 md:-bottom-80 md:size-180">
          <Globe3D
            className="h-full w-full"
            config={{
              atmosphereColor: "#4da6ff",
              atmosphereIntensity: 20,
              bumpScale: 5,
              autoRotateSpeed: 0.3,
            }}
          />
        </div>

      </div>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 animate-fade-up text-gray-900 dark:text-white">
            AI-Powered Learning Tools
          </h2>
          <p className="text-center text-xl mb-12 max-w-2xl mx-auto animate-fade-up animate-delay-100 text-gray-600 dark:text-gray-400">
            Everything you need to transform any content into an interactive learning experience
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group rounded-2xl p-6 transition-all duration-500 hover:scale-105 cursor-pointer animate-fade-up bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-black border border-gray-200 dark:border-gray-800 shadow-lg dark:shadow-none hover:shadow-xl hover:shadow-blue-100 dark:hover:shadow-2xl dark:hover:shadow-blue-500/10 hover:border-blue-400 dark:hover:border-blue-500/50"
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#03045e] to-[#0096c7] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:bg-gradient-to-b dark:from-black dark:to-gray-900/20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 animate-fade-up text-gray-900 dark:text-white">
            Simple 3-Step Process
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.title} className="relative">
                <div 
                  className="relative rounded-2xl p-8 h-full group transition-all duration-500 animate-fade-up bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-black border border-gray-200 dark:border-gray-800 shadow-lg dark:shadow-none hover:shadow-xl dark:hover:border-blue-400/50"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-r from-[#03045e] to-[#0096c7] flex items-center justify-center text-lg font-bold text-white">
                    {index + 1}
                  </div>
                  <div className="mb-6 text-blue-600 dark:text-blue-300">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 text-3xl animate-pulse text-blue-500 dark:text-blue-400">
                    <ArrowRightSVG className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Preview - macOS-style Window */}
      <section id="demo" className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="animate-fade-up">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                Interactive <span className="bg-gradient-to-r from-[#03045e] to-[#0096c7] bg-clip-text text-transparent">Learning Dashboard</span>
              </h2>
              <p className="text-lg mb-8 text-gray-600 dark:text-gray-400">
                Experience the future of learning with our AI-powered interface that adapts to your content and learning style.
              </p>
              <ul className="space-y-4">
                {dashboardFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3 animate-fade-up"
                    style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckSVG className="w-3 h-3 text-green-500 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* macOS-style Window */}
            <div className="relative animate-fade-up animate-delay-200">
              {/* Background glow effect */}
              <div className="absolute inset-0 blur-3xl rounded-3xl bg-gradient-to-r from-blue-400/10 to-cyan-400/10 dark:from-blue-500/20 dark:to-cyan-500/20"></div>
              
              {/* Window Container */}
              <div className="relative rounded-2xl overflow-hidden bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-2xl">
                
                {/* macOS Window Controls */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-100/80 dark:bg-neutral-800/80 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer group relative">
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-[10px] bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Close</span>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-pointer group relative">
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-[10px] bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Minimize</span>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors cursor-pointer group relative">
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-[10px] bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Maximize</span>
                    </div>
                  </div>
                  
                  {/* Window Title */}
                  <div className="flex-1 text-center">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">AITute Dashboard</span>
                  </div>
                  
                  {/* Window Menu Icons */}
                  <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                    <Search className="w-3.5 h-3.5 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" />
                    <Settings className="w-3.5 h-3.5 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" />
                  </div>
                </div>
                
                {/* Scrollable Content Area - Fixed Height */}
                <div className="h-[500px] overflow-hidden custom-scrollbar p-4">
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-pointer"
                    >
                      <p className="text-xs text-muted-foreground">Total Uploads</p>
                      <p className="text-xl font-bold text-blue-500">{sampleContentOverview.totalContents}</p>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                    >
                      <p className="text-xs text-muted-foreground">Summaries</p>
                      <p className="text-xl font-bold text-emerald-500">{sampleContentOverview.ready}</p>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors cursor-pointer"
                    >
                      <p className="text-xs text-muted-foreground">Messages</p>
                      <p className="text-xl font-bold text-purple-500">156</p>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer"
                    >
                      <p className="text-xs text-muted-foreground">Active</p>
                      <p className="text-xl font-bold text-amber-500">12</p>
                    </motion.div>
                  </div>

                  {/* Charts Section */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">Content Status</h3>
                      <Badge variant="outline" className="px-2 py-0">
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          Live Updates
                        </div>
                      </Badge>
                    </div>
                    <div className="h-[150px]">
                      <StatusBarChart data={{
                        ready: sampleContentOverview.ready,
                        processing: sampleContentOverview.processing,
                        failed: sampleContentOverview.failed
                      }} />
                    </div>
                  </motion.div>

                  {/* Content Types */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="grid grid-cols-2 gap-3 mb-4"
                  >
                    <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-medium">PDF Documents</span>
                      </div>
                      <p className="text-lg font-bold text-blue-500">{sampleContentOverview.totalPDF}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">62% of total</p>
                    </div>
                    <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20 hover:bg-rose-500/10 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <Youtube className="h-4 w-4 text-rose-500" />
                        <span className="text-xs font-medium">Videos</span>
                      </div>
                      <p className="text-lg font-bold text-rose-500">{sampleContentOverview.totalYouTube}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">38% of total</p>
                    </div>
                  </motion.div>

                  {/* Recent Uploads Preview */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">Recent Uploads</h3>
                      <div className="flex items-center gap-1 text-xs text-blue-500 cursor-pointer hover:text-blue-600 transition-colors">
                        <span>View all</span>
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {sampleAllContent.map((content, index) => (
                        <motion.div 
                          key={content._id} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.45 + index * 0.05 }}
                          className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer group"
                        >
                          <div className={`p-1.5 rounded-lg ${TYPE_CONFIG[content.type].bg} group-hover:scale-110 transition-transform`}>
                            {content.type === 'pdf' ? (
                              <FileText className={`h-3 w-3 ${TYPE_CONFIG[content.type].color}`} />
                            ) : (
                              <Youtube className={`h-3 w-3 ${TYPE_CONFIG[content.type].color}`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate group-hover:text-blue-500 transition-colors">{content.title}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(content.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <StatusBadge status={content.status} />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Upload Progress Bar */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium">Storage Used</span>
                      <span className="text-xs text-muted-foreground">2.4 GB / 10 GB</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "24%" }}
                        transition={{ delay: 0.6, duration: 1 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      />
                    </div>
                  </motion.div>

                  {/* Upload Button */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="mt-4"
                  >
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 text-sm group relative overflow-hidden">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <FileUp className="mr-2 h-4 w-4 group-hover:-translate-y-1 transition-transform" />
                      Upload New Content
                      <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                    </Button>
                  </motion.div>

                  {/* Scroll Indicator - Shows when more content is available */}
                  <div className="sticky bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/80 dark:from-neutral-900/80 to-transparent pointer-events-none flex items-end justify-center pb-1">
                    <motion.div
                      animate={{ y: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground"
                    >
                      <span>Scroll for more</span>
                      <ChevronDown className="h-3 w-3" />
                    </motion.div>
                  </div>
                </div>

                {/* Window Footer - Status Bar */}
                <div className="px-4 py-2 bg-gray-100/80 dark:bg-neutral-800/80 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <span>Connected</span>
                    </div>
                    <span>v2.1.4</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>Last sync: 2 min ago</span>
                    <RefreshCw className="h-3 w-3 animate-spin-slow" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why AITute */}
      <section id="benefits" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:bg-gradient-to-b dark:from-gray-900/20 dark:to-black">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 animate-fade-up text-gray-900 dark:text-white">
            Why Choose AITute?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={benefit.title} className="text-center animate-fade-up"
                style={{ animationDelay: `${index * 150}ms` }}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#03045e] to-[#0096c7] flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-500 text-white">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-200 dark:border-gray-900 bg-white dark:bg-black">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <Image 
                src="/AI-Tute.png" 
                alt="logo" 
                width={60} 
                height={60} 
                className="h-12 w-auto"
              />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">AITute</span>
            </div>
            <div className="text-start md:text-right text-gray-600 dark:text-gray-400">
              <p>© 2024 AITute. All rights reserved.</p>
              <p className="text-sm mt-2">The future of personalized learning</p>
            </div>
            <div>
              <p className="text-sm mt-2">Created by <span className="font-semibold">Ayush Prasad</span></p>
              <p className="text-sm mt-2">Contact :  <span className="font-semibold">ayushprasad2110@gmail.com</span></p>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom CSS for scrollbar and animations */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 20px;
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

// SVG Icon Components
function AIBrainSVG({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="8.5" cy="10" r="1" fill="currentColor"/>
      <circle cx="15.5" cy="10" r="1" fill="currentColor"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 15c.5 1.5 1.5 2 4 2s3.5-.5 4-2"/>
    </svg>
  );
}

function SummarySVG({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 10h6M7 14h8M7 18h4"/>
    </svg>
  );
}

function ChatSVG({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"/>
    </svg>
  );
}

function QuizSVG({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/>
    </svg>
  );
}

function DashboardSVG({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>
    </svg>
  );
}

function UploadSVG({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
    </svg>
  );
}

function ProcessSVG({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>
  );
}

function LearnSVG({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"/>
    </svg>
  );
}

function TimeSVG({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  );
}

function FocusSVG({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      <circle cx="12" cy="12" r="3" strokeWidth="2"/>
      <circle cx="12" cy="12" r="7" strokeWidth="1" strokeDasharray="2 3" opacity="0.5"/>
    </svg>
  );
}

function InteractiveSVG({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59"/>
    </svg>
  );
}

function ArrowRightSVG({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
    </svg>
  );
}

function CheckSVG({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
    </svg>
  );
}

// Data arrays with SVG components
const features = [
  {
    icon: <SummarySVG className="w-6 h-6" />,
    title: "AI Summaries",
    description: "Get structured summaries from long videos or documents in seconds"
  },
  {
    icon: <ChatSVG className="w-6 h-6" />,
    title: "Context-Aware Chat",
    description: "AI answers questions based only on your uploaded content"
  },
  {
    icon: <QuizSVG className="w-6 h-6" />,
    title: "Quiz Generator",
    description: "Auto-generated quizzes for revision and knowledge testing"
  },
  {
    icon: <DashboardSVG className="w-6 h-6" />,
    title: "Learning Dashboard",
    description: "Track progress and revisit content with intelligent organization"
  }
];

const steps = [
  {
    icon: <UploadSVG className="w-12 h-12" />,
    title: "Upload Content",
    description: "Upload PDFs, documents, or paste YouTube links. Our AI processes any format instantly."
  },
  {
    icon: <ProcessSVG className="w-12 h-12" />,
    title: "AI Processing",
    description: "Our AI analyzes content, creates summaries, identifies key concepts, and prepares learning materials."
  },
  {
    icon: <LearnSVG className="w-12 h-12" />,
    title: "Learn Faster",
    description: "Engage with interactive summaries, ask questions in chat, and test yourself with AI-generated quizzes."
  }
];

const dashboardFeatures = [
  "Real-time AI chat with context awareness",
  "Smart content organization by topic",
  "Progress tracking and insights",
  "Customizable quiz difficulty",
  "Multi-format content support",
  "Collaborative learning spaces"
];

const benefits = [
  {
    icon: <TimeSVG className="w-8 h-8" />,
    title: "Saves Time",
    description: "Cut study time by 70% with instant AI summaries and structured learning paths"
  },
  {
    icon: <FocusSVG className="w-8 h-8" />,
    title: "Reduces Overload",
    description: "Transform information overload into focused, digestible learning sessions"
  },
  {
    icon: <InteractiveSVG className="w-8 h-8" />,
    title: "Interactive Learning",
    description: "Active engagement through quizzes and AI conversations improves retention"
  }
];