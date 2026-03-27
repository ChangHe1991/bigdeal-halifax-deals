import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import CommentsSection from "@/components/CommentsSection";
import { deals } from "@/lib/deals";

type ProductDetailPageProps = {
  params: { id: string };
};

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const dealId = Number(params.id);
  const deal = deals.find((item) => item.id === dealId);

  if (!deal) {
    notFound();
  }

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    deal.maps_query
  )}`;

  return (
    <main className="container-page">
      <Header />

      <Link href="/search" className="mb-4 inline-block text-sm text-gray-600 hover:text-gray-900">
        ← Back to search
      </Link>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <p className="mb-1 text-sm text-gray-500">{deal.store}</p>
        <h1 className="mb-4 text-2xl font-bold">{deal.item}</h1>

        <div className="mb-4 flex items-center gap-3">
          <p className="text-2xl font-bold">${deal.price.toFixed(2)}</p>
          <p className="text-sm text-gray-500 line-through">${deal.original_price.toFixed(2)}</p>
          <span className="rounded-full bg-red-50 px-2 py-1 text-sm font-semibold text-red-600">
            -{Math.round(deal.discount * 100)}%
          </span>
        </div>

        <dl className="mb-6 grid gap-2 text-sm text-gray-700">
          <div className="flex justify-between border-b border-gray-100 py-2">
            <dt>Unit</dt>
            <dd>{deal.unit}</dd>
          </div>
          <div className="flex justify-between border-b border-gray-100 py-2">
            <dt>Distance</dt>
            <dd>{deal.distance.toFixed(1)} km</dd>
          </div>
          <div className="flex justify-between border-b border-gray-100 py-2">
            <dt>Valid until</dt>
            <dd>{deal.valid_until}</dd>
          </div>
        </dl>

        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            href={deal.flyer_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-medium text-white"
          >
            View Flyer
          </a>
          <a
            href={mapsHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-800"
          >
            Open in Maps
          </a>
        </div>
      </section>

      <CommentsSection productId={deal.id} itemName={deal.item} />
    </main>
  );
}
