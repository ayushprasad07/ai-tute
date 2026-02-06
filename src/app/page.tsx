"use client";
import { NavbarDemo } from "@/components/Navbar";
import { BackgroundLines } from "@/components/ui/background-lines";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

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
      <BackgroundLines className="flex justify-center items-center min-h-screen w-full">
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-up animate-once animate-duration-700">
            Turn Any Content Into{" "}
            <span className="bg-gradient-to-r from-[#03045e] to-[#0096c7] bg-clip-text text-transparent">
              Smart Learning
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto animate-fade-up animate-once animate-duration-700 animate-delay-100">
            Upload PDFs or YouTube videos → get AI summaries, chat help, and quizzes. 
            Your personal AI tutor transforms passive content into active learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up animate-once animate-duration-700 animate-delay-200">
            <button 
              onClick={() => redirect("/dashboard")} 
              className="px-8 py-4 bg-gradient-to-r from-[#03045e] to-[#0096c7] rounded-xl text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-400/50 dark:hover:shadow-blue-500/30"
            >
              Start Learning Free
            </button>
            <button className="px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105 border border-blue-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-white/5 text-blue-700 dark:text-white">
              See How It Works →
            </button>
          </div>
        </div>
      </BackgroundLines>

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

      {/* Demo Preview */}
      <section id="demo" className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
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
            
            <div className="relative animate-fade-up animate-delay-200">
              <div className="absolute inset-0 blur-3xl rounded-3xl bg-gradient-to-r from-blue-400/10 to-cyan-400/10 dark:from-blue-500/20 dark:to-cyan-500/20"></div>
              <div className="relative rounded-2xl p-6 backdrop-blur-sm bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-black border border-gray-200 dark:border-gray-800 shadow-xl"
              >
                <div className="flex space-x-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-xl p-4 bg-gray-100 dark:bg-gray-800/50 animate-pulse">
                    <div className="h-4 rounded w-3/4 mb-2 bg-gray-300 dark:bg-gray-700"></div>
                    <div className="h-4 rounded w-1/2 bg-gray-300 dark:bg-gray-700"></div>
                  </div>
                  <div className="bg-blue-500/10 rounded-xl p-4 ml-8">
                    <div className="h-4 bg-blue-400/30 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-blue-400/30 rounded w-1/2"></div>
                  </div>
                  <div className="rounded-xl p-4 bg-gray-100 dark:bg-gray-800/50">
                    <div className="flex justify-between items-center mb-2">
                      <div className="h-4 rounded w-1/4 bg-gray-300 dark:bg-gray-700"></div>
                      <div className="h-4 rounded w-1/6 bg-gray-300 dark:bg-gray-700"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-8 rounded bg-gray-300 dark:bg-gray-800"></div>
                      ))}
                    </div>
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
            <div className="text-center md:text-right text-gray-600 dark:text-gray-400">
              <p>© 2024 AITute. All rights reserved.</p>
              <p className="text-sm mt-2">The future of personalized learning</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// SVG Icon Components - Updated to use currentColor for theme
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
    icon: <SummarySVG className="w-6 h-6 text-gray-800 dark:text-gray-200" />,
    title: "AI Summaries",
    description: "Get structured summaries from long videos or documents in seconds"
  },
  {
    icon: <ChatSVG className="w-6 h-6 text-gray-800 dark:text-gray-200" />,
    title: "Context-Aware Chat",
    description: "AI answers questions based only on your uploaded content"
  },
  {
    icon: <QuizSVG className="w-6 h-6 text-gray-800 dark:text-gray-200" />,
    title: "Quiz Generator",
    description: "Auto-generated quizzes for revision and knowledge testing"
  },
  {
    icon: <DashboardSVG className="w-6 h-6 text-gray-800 dark:text-gray-200" />,
    title: "Learning Dashboard",
    description: "Track progress and revisit content with intelligent organization"
  }
];

const steps = [
  {
    icon: <UploadSVG className="w-12 h-12 text-gray-800 dark:text-gray-200" />,
    title: "Upload Content",
    description: "Upload PDFs, documents, or paste YouTube links. Our AI processes any format instantly."
  },
  {
    icon: <ProcessSVG className="w-12 h-12 text-gray-800 dark:text-gray-200" />,
    title: "AI Processing",
    description: "Our AI analyzes content, creates summaries, identifies key concepts, and prepares learning materials."
  },
  {
    icon: <LearnSVG className="w-12 h-12 text-gray-800 dark:text-gray-200" />,
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
    icon: <TimeSVG className="w-8 h-8 text-gray-800 dark:text-gray-200" />,
    title: "Saves Time",
    description: "Cut study time by 70% with instant AI summaries and structured learning paths"
  },
  {
    icon: <FocusSVG className="w-8 h-8 text-gray-800 dark:text-gray-200" />,
    title: "Reduces Overload",
    description: "Transform information overload into focused, digestible learning sessions"
  },
  {
    icon: <InteractiveSVG className="w-8 h-8 text-gray-800 dark:text-gray-200" />,
    title: "Interactive Learning",
    description: "Active engagement through quizzes and AI conversations improves retention"
  }
];