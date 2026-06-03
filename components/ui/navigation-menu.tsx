"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import { NotificationDropdown } from "@/components/ui/NotificationDropdown";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { useRole } from "@/contexts/RoleContext";
import { CATEGORY_MENU_ITEMS, getCategoryHref } from "@/lib/categories";
import { ROLE_LABELS, TOP_NAV_ITEMS_BY_ROLE } from "@/lib/roles";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

export function Navbar() {
  const { role, setRole, isLoggedIn } = useRole();
  const pathname = usePathname();
  const navItems = TOP_NAV_ITEMS_BY_ROLE[role];
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const showBrowseMenus = role === "guest" || role === "user";

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!categoryMenuRef.current) return;
      if (categoryMenuRef.current.contains(event.target as Node)) return;
      setIsCategoryOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsCategoryOpen(false);
    }
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/95 px-6 backdrop-blur-sm">
      {/* Logo */}
      <Link
        href="/"
        onClick={() => setIsCategoryOpen(false)}
        className="flex items-center gap-2 font-bold text-primary text-lg tracking-wide"
      >
        <BookOpen className="h-5 w-5" />
        <span className="font-serif">ReadLead</span>
        <span className="rounded bg-primary px-1.5 py-0.5 text-xs font-normal text-white">
          阅
        </span>
      </Link>

      {/* Primary nav */}
      <nav className="hidden md:flex items-center gap-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const hrefPath = item.href.split("?")[0];
          const isActive = pathname === hrefPath;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsCategoryOpen(false)}
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon size={15} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {showBrowseMenus && (
          <span className="h-4 w-px bg-border" aria-hidden="true" />
        )}

        {showBrowseMenus && (
          <>
            {/* Category dropdown */}
            <div className="relative" ref={categoryMenuRef}>
              <button
                type="button"
                onClick={() => setIsCategoryOpen((open) => !open)}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  isCategoryOpen
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
                aria-haspopup="menu"
                aria-expanded={isCategoryOpen}
                aria-controls="category-dropdown-menu"
              >
                หมวดหมู่
                <ChevronDown
                  size={15}
                  className={cn(
                    "transition-transform",
                    isCategoryOpen && "rotate-180",
                  )}
                />
              </button>

              {isCategoryOpen && (
                <div
                  id="category-dropdown-menu"
                  className="absolute left-0 top-full mt-3 z-50 w-[820px] max-w-[calc(100vw-3rem)] rounded-2xl border border-border bg-card p-4 shadow-xl"
                  role="menu"
                  aria-label="เมนูหมวดหมู่"
                >
                  <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
                    {CATEGORY_MENU_ITEMS.map((category) => (
                      <Link
                        key={category}
                        href={getCategoryHref(category)}
                        onClick={() => setIsCategoryOpen(false)}
                        role="menuitem"
                        className={cn(
                          "rounded-xl border border-transparent px-3 py-2 text-sm font-semibold leading-none transition-colors",
                          category === "ทุกหมวดหมู่"
                            ? "bg-primary/10 text-primary hover:border-primary/30"
                            : "text-muted-foreground hover:border-primary/30 hover:bg-primary/10 hover:text-primary",
                        )}
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Content-type quick links */}
            <Link
              href="/?type=novel#content"
              onClick={() => setIsCategoryOpen(false)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              นิยาย
            </Link>
            <Link
              href="/?type=manga#content"
              onClick={() => setIsCategoryOpen(false)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              มังงะ
            </Link>
            <Link
              href="/?type=audiobook#content"
              onClick={() => setIsCategoryOpen(false)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              หนังสือเสียง
            </Link>
          </>
        )}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <Avatar size="sm">
              <AvatarFallback>{ROLE_LABELS[role][0]}</AvatarFallback>
            </Avatar>
            <span className="hidden md:block text-sm font-medium text-foreground">
              {ROLE_LABELS[role]}
            </span>
          </div>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              สมัครสมาชิก
            </Link>
          </>
        )}

        {/* Dev role switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1 text-xs",
            )}
          >
            {ROLE_LABELS[role]} <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                สลับบทบาท (Dev)
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["guest", "user", "creator", "admin"] as Role[]).map((r) => (
                <DropdownMenuItem
                  key={r}
                  onClick={() => setRole(r)}
                  className={role === r ? "font-semibold text-primary" : ""}
                >
                  {ROLE_LABELS[r]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
