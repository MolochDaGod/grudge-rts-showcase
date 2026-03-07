export interface ScrapingJob {
  id: number;
  url: string;
  status: "pending" | "running" | "completed" | "failed";
  maxPages: number;
  crawlDepth: number;
  outputFormat: string;
  pagesScraped: number;
  totalPages: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  pages?: ScrapedPage[];
}

export interface ScrapedPage {
  id: number;
  jobId: number;
  url: string;
  title: string;
  content: string;
  html: string;
  scrapedAt: string;
}

export interface StoreProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string | null;
  category: string;
  features: string[];
  active: boolean;
  createdAt: string;
}

export interface Order {
  id: number;
  customerEmail: string;
  productId: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}
