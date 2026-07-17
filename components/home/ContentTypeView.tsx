import { HeroSlider } from "@/components/home/HeroSlider";
import { HomePromotionCards } from "@/components/home/HomePromotionCards";
import { DiscountNovelCarousel } from "@/components/home/DiscountNovelCarousel";
import { AllTimeRankingCarousel } from "@/components/home/AllTimeRankingCarousel";
import { RankingNovelList } from "@/components/home/RankingNovelList";
import { BookCategorySection } from "@/components/BookCategorySection";
import { LatestNovelUpdatesSection } from "@/components/LatestNovelUpdatesSection";
import { PopularByCategorySection } from "@/components/PopularByCategorySection";
import { DailyMangaSection } from "@/components/DailyMangaSection";
import { RecommendedByWebsiteSection } from "@/components/home/RecommendedByWebsiteSection";
import { LatestUpdatedNovelsSection } from "@/components/home/LatestUpdatedNovelsSection";
import { ActiveGenreChip } from "@/components/home/ActiveGenreChip";
import {
  MOCK_HOME_PROMOTION_SLIDES,
  MOCK_DISCOUNT_NOVELS,
  MOCK_WORKS,
  MOCK_BOOKS,
  BOOK_CATEGORIES,
  MOCK_LATEST_NOVELS,
  MOCK_POPULAR_STORIES,
  POPULAR_STORY_CATEGORIES,
  MOCK_DAILY_MANGA,
  DAILY_MANGA_DAYS,
} from "@/lib/mock-data";
import type { ContentType, Genre } from "@/lib/types";

type Props = {
  activeType: ContentType;
  activeGenre: string | null;
};

export function ContentTypeView({ activeType, activeGenre }: Props) {
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

        {activeGenre && (
          <ActiveGenreChip genre={activeGenre} clearHref={`/${activeType}`} />
        )}
        {activeGenre && filteredWorks.length === 0 && (
          <p className="text-muted-foreground">ไม่พบเรื่องในหมวดนี้</p>
        )}

        {activeType !== "manga" && activeType !== "novel" && (
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
        {activeType === "novel" && <RecommendedByWebsiteSection />}
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
              <BookCategorySection
                books={MOCK_BOOKS}
                categories={BOOK_CATEGORIES}
              />
            </section>
            <LatestUpdatedNovelsSection />
          </>
        )}
      </main>
    </>
  );
}
