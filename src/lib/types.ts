// src/lib/types.ts
import type { Timestamp } from "firebase/firestore";
import type { ROLES } from "./constants";

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: (typeof ROLES)[number];
  defaultCountry: string;
  language: string;
  createdAt: Timestamp;
  onboardingComplete: boolean;
};

export type Chat = {
  id: string;
  uid: string;
  country: string;
  title: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Citation = {
  title: string;
  publisher: string;
  publicationDate?: string; // ✅ optional string (no null)
  url: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date | Timestamp;
  citations?: Citation[];
};

export type Passage = {
  id?: string;
  country: string;
  sourceName: string;
  publisher: string;
  title: string;
  url: string;
  snippet: string;
  publicationDate?: string; // ✅ optional string (no null)
  createdAt?: Timestamp;
};

export type Source = {
  id: string;
  country: string;
  name: string;
  baseUrl: string;
  rssUrl?: string; // ✅ optional string (no null)
  category: string;
  language: string;
  tier: string;
  enabled: boolean;
};
