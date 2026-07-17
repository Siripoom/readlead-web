import Link from "next/link";
import { X } from "lucide-react";
import { GENRE_LABELS } from "@/lib/mock-data";

type Props = {
  genre: string;
  /** Optional display label for route-specific genre keys. */
  label?: string;
  /** Where "clear" returns to (the current page without ?genre=). */
  clearHref: string;
};

/** Small banner shown when a category/genre filter is active on a page. */
export function ActiveGenreChip({ genre, label, clearHref }: Props) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">หมวดหมู่:</span>
      <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
        {label ?? GENRE_LABELS[genre] ?? genre}
        <Link
          href={clearHref}
          aria-label="ล้างตัวกรอง"
          className="inline-flex items-center gap-1 text-xs text-primary/70 transition-colors hover:text-primary"
        >
          <X className="h-3.5 w-3.5" />
          ล้างตัวกรอง
        </Link>
      </span>
    </div>
  );
}
