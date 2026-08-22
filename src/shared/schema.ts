import { z } from "zod";

// ─── Auth & Identity ─────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string | null;
  isPremium: boolean;
  isGuest: boolean;
  avatarUrl: string | null;
  discordId: string | null;
  walletAddress: string | null;
  createdAt: number;
  lastLoginAt: number | null;
}

export interface Account {
  id: string;
  userId: string;
  displayName: string;
  gold: number;
  premiumCurrency: number;
  gbuxBalance: number;
  accountXp: number;
  accountLevel: number;
  totalPlaytimeMinutes: number;
  faction: "order" | "chaos" | "neutral" | null;
  factionReputation: number;
  createdAt: number;
  lastPlayedAt: number | null;
}

export interface Character {
  id: string;
  accountId: string;
  name: string;
  level: number;
  experience: number;
  healthCurrent: number;
  healthMax: number;
  manaCurrent: number;
  manaMax: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  spriteData: Record<string, unknown> | null;
  createdAt: number;
  lastPlayedAt: number | null;
}

export interface LinkedAccount {
  id: string;
  userId: string;
  provider: "discord" | "github" | "wallet";
  providerId: string;
  providerEmail: string | null;
  providerUsername: string;
  providerAvatar: string | null;
  linkedAt: number;
  lastUsedAt: number | null;
}

/** Stored in localStorage after successful auth */
export interface AuthSession {
  token: string;
  userId: string;
  username: string;
  displayName: string;
  isPremium: boolean;
  isGuest: boolean;
  expiresAt: number;
}

/** Shape returned by Identity API login/register/guest endpoints */
export interface AuthResponse {
  success: boolean;
  token: string;
  userId: string;
  username: string;
  displayName: string;
  isPremium: boolean;
  isGuest?: boolean;
  expiresAt: number;
}

// ─── Zod Validation Schemas ──────────────────────────────────

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be under 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const createOrderSchema = z.object({
  customerEmail: z.string().email("Invalid email"),
  customerName: z.string().optional(),
  productId: z.number().int().positive(),
  amount: z.number().int().positive(),
  paymentMethod: z.enum(["card", "paypal", "crypto"]),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// ─── Scraping ────────────────────────────────────────────────

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

// ─── Store & Commerce ────────────────────────────────────────

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
