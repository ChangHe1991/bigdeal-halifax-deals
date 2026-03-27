import DealCard from "@/components/DealCard";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import { Deal, deals, stores } from "@/lib/deals";

type SearchPageProps = {
  searchParams?: {
    q?: string;
    sort?: "price" | "discount";
    store?: Deal["store"] | "All";
    category?: Deal["category"];
  };
};

export default function SearchPage({ searchParams }: SearchPageProps) {
  const q = searchParams?.q?.trim() ?? "";
  const sort = searchParams?.sort === "price" ? "price" : "discount";
  const storeFilter = searchParams?.store ?? "All";
  const categoryFilter = searchParams?.category ?? "";

  const byQuery = deals.filter((deal) => {
    if (!q) {
      return true;
    }
    const text = `${deal.item} ${deal.category}`.toLowerCase();
    return text.includes(q.toLowerCase());
  });

  const byStore = byQuery.filter((deal) =>
    storeFilter === "All" ? true : deal.store === storeFilter
  );

  const byCategory = byStore.filter((deal) =>
    categoryFilter ? deal.category === categoryFilter : true
  );

  const results = [...byCategory].sort((a, b) => {
    if (sort === "price") {
      return a.price - b.price;
    }
    return b.discount - a.discount;
  });

  return (
    <main className="container-page">
      <Header />
      <SearchBar defaultValue={q} />

      <section className="mb-4 rounded-xl bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <form action="/search" className="space-y-1">
            <input type="hidden" name="q" value={q} />
            {categoryFilter && <input type="hidden" name="category" value={categoryFilter} />}
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Sort by
            </label>
            <select
              name="sort"
              defaultValue={sort}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="discount">Highest discount</option>
              <option value="price">Lowest price</option>
            </select>
            <button className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white">
              Apply
            </button>
          </form>

          <form action="/search" className="space-y-1">
            <input type="hidden" name="q" value={q} />
            <input type="hidden" name="sort" value={sort} />
            {categoryFilter && <input type="hidden" name="category" value={categoryFilter} />}
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Filter store
            </label>
            <select
              name="store"
              defaultValue={storeFilter}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="All">All stores</option>
              {stores.map((store) => (
                <option key={store} value={store}>
                  {store}
                </option>
              ))}
            </select>
            <button className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white">
              Apply
            </button>
          </form>

          <form action="/search" className="space-y-1">
            <input type="hidden" name="q" value={q} />
            <input type="hidden" name="sort" value={sort} />
            <input type="hidden" name="store" value={storeFilter} />
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Category
            </label>
            <select
              name="category"
              defaultValue={categoryFilter}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All categories</option>
              <option value="Meat">Meat</option>
              <option value="Dairy">Dairy</option>
              <option value="Produce">Produce</option>
              <option value="Snacks">Snacks</option>
            </select>
            <button className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white">
              Apply
            </button>
          </form>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold">
          Results {q ? `for "${q}"` : ""} ({results.length})
        </h2>
        <div className="grid gap-3">
          {results.map((deal) => (
            <DealCard key={deal.id} deal={deal} showDistance clickable />
          ))}
          {results.length === 0 && (
            <p className="rounded-xl bg-white p-4 text-sm text-gray-600 shadow-sm">
              No deals found. Try another search term or remove filters.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
