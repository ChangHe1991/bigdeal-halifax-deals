export type Deal = {
  id: number;
  item: string;
  store: "Walmart" | "Superstore" | "Sobeys";
  price: number;
  original_price: number;
  discount: number;
  unit: string;
  distance: number;
  category: "Meat" | "Dairy" | "Produce" | "Snacks";
  valid_until: string;
  maps_query: string;
  flyer_url: string;
};

export const deals: Deal[] = [
  {
    id: 1,
    item: "Beef Rib",
    store: "Walmart",
    price: 8.97,
    original_price: 12.99,
    discount: 0.31,
    unit: "lb",
    distance: 2.1,
    category: "Meat",
    valid_until: "2026-04-05",
    maps_query: "Walmart Bedford NS",
    flyer_url: "https://www.walmart.ca/en/flyer",
  },
  {
    id: 2,
    item: "Chicken Breast",
    store: "Superstore",
    price: 5.49,
    original_price: 7.99,
    discount: 0.31,
    unit: "lb",
    distance: 3.6,
    category: "Meat",
    valid_until: "2026-04-02",
    maps_query: "Real Canadian Superstore Bedford NS",
    flyer_url: "https://www.realcanadiansuperstore.ca/print-flyer",
  },
  {
    id: 3,
    item: "Whole Milk",
    store: "Sobeys",
    price: 4.29,
    original_price: 5.49,
    discount: 0.22,
    unit: "2L",
    distance: 1.8,
    category: "Dairy",
    valid_until: "2026-04-03",
    maps_query: "Sobeys Bedford NS",
    flyer_url: "https://www.sobeys.com/en/flyer/",
  },
  {
    id: 4,
    item: "Cheddar Cheese",
    store: "Sobeys",
    price: 5.99,
    original_price: 8.49,
    discount: 0.29,
    unit: "400g",
    distance: 2.2,
    category: "Dairy",
    valid_until: "2026-04-06",
    maps_query: "Sobeys Bedford NS",
    flyer_url: "https://www.sobeys.com/en/flyer/",
  },
  {
    id: 5,
    item: "Broccoli Crown",
    store: "Walmart",
    price: 1.97,
    original_price: 2.99,
    discount: 0.34,
    unit: "each",
    distance: 2.1,
    category: "Produce",
    valid_until: "2026-04-01",
    maps_query: "Walmart Bedford NS",
    flyer_url: "https://www.walmart.ca/en/flyer",
  },
  {
    id: 6,
    item: "Blueberries",
    store: "Superstore",
    price: 2.88,
    original_price: 4.49,
    discount: 0.36,
    unit: "170g",
    distance: 3.6,
    category: "Produce",
    valid_until: "2026-04-04",
    maps_query: "Real Canadian Superstore Bedford NS",
    flyer_url: "https://www.realcanadiansuperstore.ca/print-flyer",
  },
  {
    id: 7,
    item: "Potato Chips",
    store: "Sobeys",
    price: 2.5,
    original_price: 3.99,
    discount: 0.37,
    unit: "200g",
    distance: 1.8,
    category: "Snacks",
    valid_until: "2026-04-07",
    maps_query: "Sobeys Bedford NS",
    flyer_url: "https://www.sobeys.com/en/flyer/",
  },
  {
    id: 8,
    item: "Granola Bars",
    store: "Superstore",
    price: 2.79,
    original_price: 4.49,
    discount: 0.38,
    unit: "box",
    distance: 3.4,
    category: "Snacks",
    valid_until: "2026-04-08",
    maps_query: "Real Canadian Superstore Bedford NS",
    flyer_url: "https://www.realcanadiansuperstore.ca/print-flyer",
  },
];

export const stores: Deal["store"][] = [
  "Walmart",
  "Superstore",
  "Sobeys",
];

export const categories: Deal["category"][] = [
  "Meat",
  "Dairy",
  "Produce",
  "Snacks",
];
