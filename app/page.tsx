import { HomeLanding } from "@/components/home/landing/HomeLanding";
import { getHomeHeroCatalog } from "@/lib/home-hero-catalog";

type Props = {
  searchParams: Promise<{ genre?: string | string[] }>;
};

export default async function HomePage({ searchParams }: Props) {
  const [{ genre }, hero] = await Promise.all([searchParams, getHomeHeroCatalog()]);
  const activeGenre =
    typeof genre === "string" ? genre : Array.isArray(genre) ? genre[0] : null;
  return <HomeLanding activeGenre={activeGenre} hero={hero} />;
}
