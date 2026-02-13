"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconLayoutDashboard,
  IconLogout,
  IconSun,
  IconFileText,
} from "@tabler/icons-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ToggleTheme";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { Loader } from "lucide-react";


type ContentType = {
  _id: string;
  title: string;
};

export default function SideBar({ children }: { children: React.ReactNode }) {
  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <IconLayoutDashboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];

  const [open, setOpen] = useState(false);
  const [contents, setContents] = useState<ContentType[]>([]);
  const [loadingContents, setLoadingContents] = useState(true);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const res = await axios.post("/api/content/fetch-all");

        if (res.data.success) {
          setContents(res.data.contents);
        }
      } catch (error) {
        console.log("Error fetching contents:", error);
      } finally {
        setLoadingContents(false);
      }
    };

    fetchContents();
  }, []);

  const handleLogout = () => {
    signOut({ callbackUrl: "/sign-in" });
  };

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col overflow-hidden border bg-gray-100 md:flex-row dark:bg-neutral-800",
        "h-[100vh]"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto gap-y-5">
            <Logo small={!open} />

            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>

            <div className="mt-6 overflow-y-scroll">
              {open && (
                <p className="px-3 text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
                  Contents
                </p>
              )}

              <div className="mt-2 flex flex-col gap-1">
                {loadingContents && open && (
                  <span className="px-3 text-xs text-neutral-400">
                    <Loader className="mr-2 h-4 w-4 animate-spin"></Loader>Loading...
                  </span>
                )}

                {contents.map((content) => (
                  <Link
                    key={content._id}
                    href={`/content/${content._id}`}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2 text-sm transition-all",
                      "hover:bg-neutral-200 dark:hover:bg-neutral-700",
                      open ? "gap-3 justify-start" : "justify-center"
                    )}
                  >
                    <IconFileText className="h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-300" />

                    {open && (
                      <span className="truncate text-neutral-700 dark:text-neutral-200">
                        {content.title}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-neutral-700 px-3 py-4">
            {/* Theme Toggle */}
            <div className="mb-4">
              {open ? (
                <div className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 dark:bg-neutral-800">
                      <IconSun className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Theme
                    </span>
                  </div>
                  <ThemeToggle />
                </div>
              ) : (
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center w-full rounded-lg px-3 py-2.5 text-sm cursor-pointer font-medium transition-all",
                "text-red-600 hover:bg-red-50 hover:text-red-700",
                "dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300",
                open ? "justify-start gap-3" : "justify-center"
              )}
            >
              <IconLogout className="h-5 w-5 shrink-0" />
              {open && <span>Sign Out</span>}
            </button>
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-neutral-50 via-neutral-50 to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        {children}
      </div>
    </div>
  );
}

export const Logo = ({ small }: { small?: boolean }) => {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "relative z-20 flex items-center py-2 text-sm font-normal text-black dark:text-white transition-all duration-300",
        small ? "justify-center px-0" : "justify-start px-3 space-x-2"
      )}
    >
      <div className="flex items-center justify-center shrink-0">
        <Image
          src="/AI-Tute.png"
          alt="logo"
          width={80}
          height={80}
          className="object-contain"
        />
      </div>
      {!small && (
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-lg bg-gradient-to-r from-[#03045e] to-[#0096c7] bg-clip-text text-transparent">
            AITute
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Control Panel
          </span>
        </div>
      )}
    </Link>
  );
};
