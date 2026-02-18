"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { redirect } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ToggleTheme";

export function NavbarDemo() {
  const navItems = [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "Dashboard",
      link: "/dashboard",
    }
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleRedirect = () => {
    redirect("/sign-in");
  };

  const handleSignup = () => {
    redirect("/sign-up");
  };

  return (
    <div className="fixed w-full top-10 z-50">
      {/* <ThemeToggle /> */}
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NavbarButton variant="secondary" onClick={handleRedirect}>Login</NavbarButton>
            <NavbarButton variant="primary" onClick={handleSignup}>Sign-up</NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              <ThemeToggle/>
              <NavbarButton
                onClick={() => {setIsMobileMenuOpen(false); handleRedirect(); }}
                variant="primary"
                className="w-full"
              >
                Login
              </NavbarButton>

              <NavbarButton
                onClick={() => {  setIsMobileMenuOpen(false); handleSignup(); }}
                variant="primary"
                className="w-full"
              >
                Sign-up
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Navbar */}
    </div>
  );
}

