# Grocery Deals Finder (MVP)

A clean, minimal web app to find nearby grocery deals in Canada using mock data.

## Tech stack

- Next.js (App Router)
- React
- Tailwind CSS
- TypeScript

## Features implemented

- Home page (`/`)
  - Header with location (`Halifax, NS`)
  - Top 3 deals sorted by highest discount
  - Search bar redirects to `/search?q=keyword`
  - Category quick filters (Meat, Dairy, Produce, Snacks)
- Search page (`/search`)
  - Reads query from URL
  - Sorting:
    - Highest discount (default)
    - Lowest price
  - Filtering:
    - Store (All/Walmart/Costco/Superstore/Sobeys)
    - Category
  - Deal cards with item, store, price, discount, distance
  - Click card to open detail page
- Product detail page (`/product/[id]`)
  - Item, store, price, original price, discount, validity date
  - `View Flyer` placeholder button
  - `Open in Maps` Google Maps link

## Project structure

- `app/page.tsx` - Home page
- `app/search/page.tsx` - Search page
- `app/product/[id]/page.tsx` - Product detail page
- `components/Header.tsx`
- `components/SearchBar.tsx`
- `components/DealCard.tsx`
- `lib/deals.ts` - Mock data

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
