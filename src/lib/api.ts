import { apiRequest } from "./queryClient";
import { config } from "./config";
import type {
  ScrapingJob,
  ScrapedPage,
  StoreProduct,
  Order,
  AuthResponse,
  User,
  Account,
} from "@/shared/schema";

// ─── Auth API (direct to auth-gateway) ─────────────────────

export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const res = await fetch(`${config.AUTH_GATEWAY_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  register: async (username: string, password: string, email?: string): Promise<AuthResponse> => {
    const res = await fetch(`${config.AUTH_GATEWAY_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, email }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  guest: async (deviceId: string): Promise<AuthResponse> => {
    const res = await fetch(`${config.AUTH_GATEWAY_URL}/api/guest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  /** Get the authenticated user's profile */
  getMe: async (): Promise<User> => {
    const response = await apiRequest("GET", "/api/me");
    return response.json();
  },

  /** Get the authenticated user's game account */
  getAccount: async (): Promise<Account> => {
    const response = await apiRequest("GET", "/api/account");
    return response.json();
  },
};

export const scrapingApi = {
  startJob: async (data: {
    url: string;
    maxPages: number;
    crawlDepth: number;
    outputFormat: string;
  }): Promise<ScrapingJob> => {
    const response = await apiRequest("POST", "/api/scraping/start", data);
    return response.json();
  },

  getJobs: async (): Promise<ScrapingJob[]> => {
    const response = await apiRequest("GET", "/api/scraping/jobs");
    return response.json();
  },

  getJob: async (id: number): Promise<ScrapingJob> => {
    const response = await apiRequest("GET", `/api/scraping/jobs/${id}`);
    return response.json();
  },

  downloadJob: async (id: number, format: string): Promise<Blob> => {
    const response = await apiRequest("GET", `/api/scraping/jobs/${id}/download?format=${format}`);
    return response.blob();
  },
};

export const storeApi = {
  getProducts: async (): Promise<StoreProduct[]> => {
    const response = await apiRequest("GET", "/api/store/products");
    return response.json();
  },

  getProduct: async (id: number): Promise<StoreProduct> => {
    const response = await apiRequest("GET", `/api/store/products/${id}`);
    return response.json();
  },

  createOrder: async (data: {
    customerEmail: string;
    productId: number;
    amount: number;
    paymentMethod: string;
    paymentStatus: string;
  }): Promise<Order> => {
    const response = await apiRequest("POST", "/api/store/orders", data);
    return response.json();
  },

  getOrders: async (): Promise<Order[]> => {
    const response = await apiRequest("GET", "/api/store/orders");
    return response.json();
  },
};
