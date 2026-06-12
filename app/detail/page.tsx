import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ContentHeader from "@/components/detail/ContentHeader";
import NovelAuthorIntroSection from "@/components/detail/NovelAuthorIntroSection";
import EpisodeList from "@/components/detail/EpisodeList";
import NovelSupportStats from "@/components/detail/NovelSupportStats";
import ReaderReviewsSection from "@/components/detail/ReaderReviewsSection";
import RelatedWorks from "@/components/detail/RelatedWorks";
import OrnamentalDivider from "@/components/shared/OrnamentalDivider";
import {
  MOCK_WORKS,
  MOCK_EPISODES,
  MOCK_EPISODE_STATS,
  MOCK_CREATORS,
  GENRE_LABELS,
} from "@/lib/mock-data";
import type {
  AuthorInfo,
  NovelIntroInfo,
} from "@/components/detail/NovelAuthorIntroSection";

interface Props {
  searchParams: Promise<{ bookId?: string }>;
}

export default async function DetailPage({ searchParams }: Props) {
  const { bookId } = await searchParams;
  const work = MOCK_WORKS.find((w) => w.id === bookId);
  if (!work) notFound();

  const episodes = MOCK_EPISODES[work.id] ?? [];
  const relatedWorks = MOCK_WORKS.filter(
    (w) => w.id !== work.id && w.genres.some((g) => work.genres.includes(g)),
  ).slice(0, 6);

  const creator = MOCK_CREATORS.find((c) => c.id === work.authorId);
  const updatedDateLabel = new Date(work.updatedAt).toLocaleDateString(
    "th-TH",
    { day: "numeric", month: "short", year: "numeric" },
  );
  const totalWords = episodes.reduce((sum, ep) => sum + ep.wordCount, 0);

  function fmtNum(n: number) {
    if (n >= 1000000) return (n / 1000000).toFixed(2) + " ล้าน";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return String(n);
  }

  const authorInfo: AuthorInfo = {
    id: work.authorId,
    name: work.authorName,
    avatarUrl:
      creator?.avatarUrl ?? `https://picsum.photos/seed/${work.authorId}/80/80`,
    badgeLabel:
      (creator?.followerCount ?? 0) >= 40000
        ? "นักเขียนระดับทอง"
        : "นักเขียน 5 ดาว",
    worksCount: String(creator?.workIds.length ?? 1),
    followers: fmtNum(creator?.followerCount ?? 0),
    updatedDays: updatedDateLabel,
    signature: creator?.bio,
    buttonLabel: "ติดตาม",
  };

  const introInfo: NovelIntroInfo = {
    title: "บทนำสู่งาน",
    category: work.genres.map((g) => GENRE_LABELS[g]).join(" / "),
    totalEpisodes: `${work.episodeCount} ตอน`,
    totalWords: totalWords > 0 ? `${fmtNum(totalWords)} คำ` : undefined,
    views: fmtNum(work.viewCount),
    content:
      work.synopsis.split("  ").flatMap((s) => (s.trim() ? [s.trim()] : []))
        .length > 1
        ? work.synopsis
            .split("  ")
            .map((s) => s.trim())
            .filter(Boolean)
        : [work.synopsis],
  };

  const dailyTicket = {
    title: "ตั๋วรายวัน",
    secondaryTitle: "推荐票",
    label: "โหวตสะสมวันนี้",
    value: String(work.weeklyVoteCount).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
    description: `อีก ${Math.max(1, Math.floor(work.weeklyVoteCount * 0.03))} โหวตขึ้นอันดับ`,
    notification: `${work.authorName.slice(0, 6)}... โหวต 1 ตั๋วรายวัน`,
    buttonLabel: "ใช้ตั๋วรายวัน",
  };

  const monthlyTicket = {
    title: "ตั๋วรายเดือน",
    secondaryTitle: "月票",
    label: "โหวตสะสมเดือนนี้",
    value: String(work.weeklyVoteCount * 4).replace(
      /\B(?=(\d{3})+(?!\d))/g,
      ",",
    ),
    description: `อันดับที่ ${work.rankingScore > 0 ? Math.ceil(work.rankingScore / 100) : 14} · อีก ${Math.floor(work.weeklyVoteCount * 0.05)} โหวตขึ้นอันดับ`,
    notification: `${work.authorName.slice(0, 6)}... โหวต 1 ตั๋วรายเดือน`,
    buttonLabel: "ใช้ตั๋วรายเดือน",
  };

  return (
    <main className="min-h-screen">
      <div className="bg-muted/40 border-b">
        <div className="container mx-auto px-8 md:px-16 py-2 text-sm text-muted-foreground flex items-center gap-1">
          <Link href="/" className="hover:text-primary">
            หน้าแรก
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/discover" className="hover:text-primary">
            ค้นหา
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground truncate">{work.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-8 md:px-16 py-8 space-y-8">
        <section className="rounded-2xl border border-border/60 bg-white p-6 md:p-8">
          <ContentHeader work={work} />
        </section>

        <section className="rounded-2xl border border-border/60 bg-white p-6 md:p-8">
          <NovelAuthorIntroSection author={authorInfo} intro={introInfo} />
        </section>

        <section className="rounded-2xl border border-border/60 bg-white p-6 md:p-8">
          <NovelSupportStats
            daily={dailyTicket}
            monthly={monthlyTicket}
            authorName={work.authorName}
          />
        </section>

        <section className="rounded-2xl border border-border/60 bg-white p-6 md:p-8">
          <ReaderReviewsSection />
        </section>

        <section className="rounded-2xl border border-border/60 bg-white p-6 md:p-8">
          <EpisodeList
            episodes={episodes}
            workId={work.id}
            workTitle={work.title}
            episodeStats={MOCK_EPISODE_STATS}
          />
        </section>

        <section className="rounded-2xl border border-border/60 bg-white p-6 md:p-8">
          <RelatedWorks works={relatedWorks} />
        </section>
      </div>
    </main>
  );
}
