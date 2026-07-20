"use client";
import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/ui/navigation-menu";
import {
  CONTENT_TYPE_LABELS,
  HOME_CONTENT_TYPES,
  parseHomeContentType,
} from "@/lib/content-types";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <>
      <Navbar />
      {/* <div className="border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4">
          <Suspense fallback={<HeaderContentTypeNavSkeleton />}>
            <HeaderContentTypeNav />
          </Suspense>
        </div>
      </div> */}
    </>
  );
}

function HeaderContentTypeNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHome = pathname === "/";
  const activeType = isHome
    ? parseHomeContentType(searchParams.get("type"))
    : null;

  return (
    <nav className="flex gap-2 overflow-x-auto pb-3 pt-2">
      {HOME_CONTENT_TYPES.map((type) => {
        const isActive = activeType === type;
        return (
          <Link
            key={type}
            href={`/${type}`}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "border-primary bg-primary text-white"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary",
            )}
          >
            {CONTENT_TYPE_LABELS[type]}
          </Link>
        );
      })}
    </nav>
  );
}

function HeaderContentTypeNavSkeleton() {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-3 pt-2">
      {HOME_CONTENT_TYPES.map((type) => (
        <Link
          key={type}
          href={`/?type=${type}`}
          className="rounded-full border border-border px-4 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {CONTENT_TYPE_LABELS[type]}
        </Link>
      ))}
    </nav>
  );
}
