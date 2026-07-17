import { HomeLanding } from "@/components/home/landing/HomeLanding";

type Props = {
  searchParams: Promise<{ genre?: string | string[] }>;
};

export default async function HomePage({ searchParams }: Props) {
  const { genre } = await searchParams;
  const activeGenre =
    typeof genre === "string" ? genre : Array.isArray(genre) ? genre[0] : null;
  return <HomeLanding activeGenre={activeGenre} />;
}
