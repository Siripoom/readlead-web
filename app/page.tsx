import { HeroSlider } from "@/components/home/HeroSlider";
import { HomePromotionCards } from "@/components/home/HomePromotionCards";
import { DiscountNovelCarousel } from "@/components/home/DiscountNovelCarousel";
import { AllTimeRankingCarousel } from "@/components/home/AllTimeRankingCarousel";
import { RankingNovelList } from "@/components/home/RankingNovelList";
import { BookCategorySection } from "@/components/BookCategorySection";
import { LatestNovelUpdatesSection } from "@/components/LatestNovelUpdatesSection";
import { PopularByCategorySection } from "@/components/PopularByCategorySection";
import { DailyMangaSection } from "@/components/DailyMangaSection";
import { NovelRankingShowcase } from "@/components/home/NovelRankingShowcase";
import { HomeContentTypeSelector } from "@/components/home/HomeContentTypeSelector";
import { BookCarousel } from "@/components/home/BookCarousel";
import { RankingList } from "@/components/home/RankingList";
import { MangaRankingSection } from "@/components/home/MangaRankingSection";
import OrnamentalDivider from "@/components/shared/OrnamentalDivider";
import {
  MOCK_HOME_PROMOTION_SLIDES,
  MOCK_DISCOUNT_NOVELS,
  MOCK_WORKS,
  MOCK_RANKING_SHOWCASE,
  RANKING_SHOWCASE_CATEGORIES,
  MOCK_BOOKS,
  BOOK_CATEGORIES,
  MOCK_LATEST_NOVELS,
  MOCK_POPULAR_STORIES,
  POPULAR_STORY_CATEGORIES,
  MOCK_DAILY_MANGA,
  DAILY_MANGA_DAYS,
} from "@/lib/mock-data";
import { CONTENT_TYPE_LABELS, parseHomeContentType } from "@/lib/content-types";
import type { ContentType, Genre, Work } from "@/lib/types";

type Props = {
  searchParams: Promise<{
    type?: string | string[];
    genre?: string | string[];
  }>;
};

function getTopWorks(works: Work[], selector: (work: Work) => number) {
  return [...works]
    .sort((left, right) => selector(right) - selector(left))
    .slice(0, 6);
}

function renderStandardRankingBlocks(works: Work[], typeLabel: string) {
  return (
    <div className="space-y-7">
      <RankingList
        title={`${typeLabel}ยอดดู`}
        chineseTitle="观看榜"
        works={getTopWorks(works, (work) => work.viewCount)}
        statLabel="ยอดดู"
        statVariant="views"
        actionHref="/discover"
      />
      <RankingList
        title={`${typeLabel}นิยมสูงสุด`}
        chineseTitle="人气榜"
        works={getTopWorks(works, (work) => work.rankingScore)}
        statLabel="นิยม"
        statVariant="popularity"
        actionHref="/discover"
      />
      <RankingList
        title={`${typeLabel}ยอดเติม VIP`}
        chineseTitle="贵宾充值榜"
        works={getTopWorks(works, (work) => work.vipTopUpTotal)}
        statLabel="VIP"
        statVariant="vip"
        actionHref="/discover"
      />
    </div>
  );
}

function renderContentSections(activeType: ContentType, works: Work[]) {
  const typeLabel = CONTENT_TYPE_LABELS[activeType];
  const topByReads = getTopWorks(works, (work) => work.readCount);

  return (
    <>
      <section className="space-y-6">
        <HomeContentTypeSelector activeType={activeType} />

        <BookCarousel
          title={`${typeLabel}น่าอ่านตอนนี้`}
          chineseTitle="本周推荐"
          statLabel="ยอดอ่าน"
          statVariant="reads"
          works={topByReads}
          actionHref="/discover"
        />
      </section>

      <section className="space-y-7">
        {activeType === "manga" ? (
          <>
            <RankingList
              title="มังงะยอดดู"
              chineseTitle="观看榜"
              works={getTopWorks(works, (work) => work.viewCount)}
              statLabel="ยอดดู"
              statVariant="views"
              actionHref="/discover"
            />
            <MangaRankingSection works={works} />
            <RankingList
              title="มังงะยอดเติม VIP"
              chineseTitle="贵宾充值榜"
              works={getTopWorks(works, (work) => work.vipTopUpTotal)}
              statLabel="VIP"
              statVariant="vip"
              actionHref="/discover"
            />
          </>
        ) : (
          renderStandardRankingBlocks(works, typeLabel)
        )}
      </section>
    </>
  );
}

export default async function HomePage({ searchParams }: Props) {
  const { type, genre } = await searchParams;
  const activeType = parseHomeContentType(type);
  const activeGenre =
    typeof genre === "string" ? genre : Array.isArray(genre) ? genre[0] : null;
  const filteredWorks = MOCK_WORKS.filter(
    (w) =>
      w.type === activeType &&
      (!activeGenre || w.genres.includes(activeGenre as Genre)),
  );
  const allTimeRanking = [...filteredWorks]
    .sort((a, b) => b.rankingScore - a.rankingScore)
    .slice(0, 10);
  const popularRanking = [...filteredWorks]
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, 10);
  const originalNovels = [...filteredWorks]
    .filter((w) => w.origin === "original")
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 10);
  const translatedNovels = [...filteredWorks]
    .filter((w) => w.origin === "translated")
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 10);
  const completedNovels = [...filteredWorks]
    .filter((w) => w.status === "completed")
    .sort((a, b) => b.rankingScore - a.rankingScore)
    .slice(0, 10);
  const heroSlides = MOCK_HOME_PROMOTION_SLIDES.map((slide) => ({
    ...slide,
    banners: slide.banners.slice(0, 1),
  })).filter((slide) => slide.banners.length > 0);
  return (
    <>
      <div className="pt-6">
        <HeroSlider slides={heroSlides} />
      </div>
      <main className="mx-auto max-w-7xl space-y-10 px-4 py-6 md:space-y-12">
        <HomePromotionCards slides={MOCK_HOME_PROMOTION_SLIDES} />

        {activeType !== "manga" && (
          <DiscountNovelCarousel
            title="โปรโมชั่นลดราคา"
            items={MOCK_DISCOUNT_NOVELS}
          />
        )}
        <AllTimeRankingCarousel
          title="จัดอันดับตลอดการ"
          works={allTimeRanking}
          viewMoreHref="/ranking"
        />
        {activeType === "manga" && (
          <PopularByCategorySection
            categories={POPULAR_STORY_CATEGORIES}
            stories={MOCK_POPULAR_STORIES}
          />
        )}
        {activeType === "manga" && (
          <DailyMangaSection
            days={DAILY_MANGA_DAYS}
            mangas={MOCK_DAILY_MANGA}
          />
        )}
        {activeType !== "manga" && (
          <RankingNovelList
            title="อันดับนิยายยอดนิยม"
            works={filteredWorks}
            viewMoreHref="/ranking"
          />
        )}
        {activeType !== "manga" && (
          <AllTimeRankingCarousel
            title="ยอดนิยม"
            works={popularRanking}
            viewMoreHref="/ranking"
          />
        )}
        {activeType === "novel" && (
          <>
            <AllTimeRankingCarousel
              title="เปิดตัวนิยายแต่งเอง"
              works={originalNovels}
            />
            <AllTimeRankingCarousel
              title="เปิดตัวนิยายแปลใหม่"
              works={translatedNovels}
            />
            <AllTimeRankingCarousel
              title="นิยายจบแล้ว"
              works={completedNovels}
            />
            <LatestNovelUpdatesSection novels={MOCK_LATEST_NOVELS} />
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                หมวดหมู่หนังสือ
              </h2>
              <BookCategorySection
                books={MOCK_BOOKS}
                categories={BOOK_CATEGORIES}
              />
            </section>
          </>
        )}

        {activeType === "novel" && (
          <NovelRankingShowcase
            title="จัดอันดับมังงะยอดนิยม"
            categories={RANKING_SHOWCASE_CATEGORIES}
            items={MOCK_RANKING_SHOWCASE}
          />
        )}
      </main>
    </>
  );
}
