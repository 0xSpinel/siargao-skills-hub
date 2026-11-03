import type { User } from "@supabase/supabase-js";

// Local-only demo session: lets anyone explore the app offline.
// It never talks to the server, so it cannot publish real tasks or offers.
const KEY = "swell-do-demo";
export const DEMO_EMAIL = "demo@swelldo.ph";
export const DEMO_PASSWORD = "demo1234";

export const DEMO_USER = {
  id: "00000000-0000-4000-8000-000000000000",
  email: DEMO_EMAIL,
  aud: "demo",
  app_metadata: {},
  user_metadata: { display_name: "Demo Islander" },
  created_at: "2026-01-01T00:00:00Z",
} as User;

export const isDemo = () => typeof window !== "undefined" && localStorage.getItem(KEY) === "1";
export const startDemo = () => { localStorage.setItem(KEY, "1"); window.dispatchEvent(new Event("swell-demo")); };
export const endDemo = () => { localStorage.removeItem(KEY); window.dispatchEvent(new Event("swell-demo")); };
export const DEMO_BLOCKED = "You're in demo mode. Create a real account to publish — demo posts are never saved.";
