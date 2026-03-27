import Link from "next/link";
import DealCard from "@/components/DealCard";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import { categories, deals } from "@/lib/deals";

export default function HomePage() {
  const topDeals = [...deals]
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 3);

  return (
    <main className="container-page">
      <Header />
      <p className="mb-4 text-sm text-gray-600">
        Local flyer deals near Bedford from Walmart, Superstore, and Sobeys.
      </p>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">🔥 Top Deals</h2>
        <div className="grid gap-3">
          {topDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} showOriginal clickable />
          ))}
        </div>
      </section>

      <SearchBar />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">
          Categories
        </h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/search?q=${encodeURIComponent(category)}&category=${encodeURIComponent(
                category
              )}`}
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm transition hover:border-gray-500"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
