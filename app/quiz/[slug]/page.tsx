import { notFound } from "next/navigation";
import { BOOK_TITLES, FILMS, parseSlug, select, shuffle, strip } from "@/lib/bank";
import Runner from "@/components/Runner";

export const dynamic = "force-dynamic";

const RUN_LENGTH = 10;

export default function RunPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { d?: string; n?: string };
}) {
  const filter = parseSlug(params.slug);
  if (!filter) notFound();

  const difficulty = searchParams.d ? Number(searchParams.d) : null;
  const wanted = Number(searchParams.n) || RUN_LENGTH;

  const pool = select(filter, difficulty && difficulty >= 1 && difficulty <= 5 ? difficulty : null);
  if (!pool.length) notFound();

  const picked = shuffle(pool, `${params.slug}-${difficulty ?? "any"}-${Date.now()}`).slice(0, wanted);

  const title =
    filter.kind === "all"
      ? "Chapter & Verse"
      : filter.kind === "book"
      ? BOOK_TITLES[filter.book].en
      : FILMS.find((f) => f.n === filter.film)?.en ?? "";

  return (
    <div className="px-4 sm:px-9 py-7 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <Runner questions={picked.map(strip)} title={title} slug={params.slug} />
      </div>
    </div>
  );
}
