import DashboardSidebar from "@/components/Sidebar";
import SideBar from "@/components/Sidebar";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
        <DashboardSidebar> {children}</DashboardSidebar>
    </div>
      
  );
}
