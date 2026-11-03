import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_USER, isDemo } from "@/lib/demo";

const AccountContext = createContext<{ user: User | null; ready: boolean; demo: boolean }>({ user: null, ready: false, demo: false });
export const useAccount = () => useContext(AccountContext);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [demo, setDemo] = useState(false);
  const router = useRouter();
  const qc = useQueryClient();
  useEffect(() => {
    const sync = () => { setDemo(isDemo()); void router.invalidate(); };
    sync();
    window.addEventListener("swell-demo", sync);
    return () => window.removeEventListener("swell-demo", sync);
  }, [router]);
  useEffect(() => {
    let active = true;
    let transition = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) return;
      transition = true;
      setUser(session?.user ?? null); setReady(true);
      void router.invalidate();
      if (event !== "SIGNED_OUT") void qc.invalidateQueries();
    });
    void supabase.auth.getUser().then(({ data }) => {
      if (active && !transition) { setUser(data.user); setReady(true); }
    }).catch(() => { if (active) setReady(true); });
    return () => { active = false; subscription.unsubscribe(); };
  }, [router, qc]);
  const current = user ?? (demo ? DEMO_USER : null);
  return <AccountContext.Provider value={{ user: current, ready: ready || demo, demo: demo && !user }}>{children}</AccountContext.Provider>;
}
