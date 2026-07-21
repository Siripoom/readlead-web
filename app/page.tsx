import { HomeLanding } from "@/components/home/landing/HomeLanding";
import { getHomeCmsCatalog, getHomeLatestCatalog, getHomeRankingCatalog } from "@/lib/home-catalog";
import { getHomeHeroCatalog } from "@/lib/home-hero-catalog";

type Props = {
  searchParams: Promise<{ genre?: string | string[] }>;
};

export default async function HomePage({ searchParams }: Props) {
  const [{ genre }, hero, cms, latest, ranking] = await Promise.all([
    searchParams,
    getHomeHeroCatalog(),
    getHomeCmsCatalog(),
    getHomeLatestCatalog(),
    getHomeRankingCatalog(),
  ]);
  const activeGenre =
    typeof genre === "string" ? genre : Array.isArray(genre) ? genre[0] : null;
  return <HomeLanding activeGenre={activeGenre} hero={hero} cms={cms} latest={latest} ranking={ranking} />;
}
