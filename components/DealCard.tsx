import Link from "next/link";
import { Deal } from "@/lib/deals";

type DealCardProps = {
  deal: Deal;
  showOriginal?: boolean;
  showDistance?: boolean;
  clickable?: boolean;
};

export default function DealCard({
  deal,
  showOriginal = false,
  showDistance = false,
  clickable = false,
}: DealCardProps) {
  const content = (
    <article className="rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold">{deal.item}</h3>
          <p className="text-sm text-gray-600">{deal.store}</p>
        </div>
        <span className="rounded-full bg-red-50 px-2 py-1 text-sm font-semibold text-red-600">
          -{Math.round(deal.discount * 100)}%
        </span>
      </div>

      <div className="flex items-end gap-2">
        <p className="text-lg font-bold text-gray-900">
          ${deal.price.toFixed(2)}
          <span className="ml-1 text-sm font-normal text-gray-500">/{deal.unit}</span>
        </p>
        {showOriginal && (
          <p className="pb-0.5 text-sm text-gray-500 line-through">
            ${deal.original_price.toFixed(2)}
          </p>
        )}
      </div>

      {showDistance && (
        <p className="mt-2 text-sm text-gray-600">{deal.distance.toFixed(1)} km away</p>
      )}
    </article>
  );

  if (clickable) {
    return <Link href={`/product/${deal.id}`}>{content}</Link>;
  }
  return content;
}
