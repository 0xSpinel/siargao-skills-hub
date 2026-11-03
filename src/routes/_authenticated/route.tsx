// Integration-compatible client-only gate: sessions are stored in the browser.
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { isDemo } from "@/lib/demo";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    if (isDemo()) return; // local demo can view forms; publishing still requires a real account
    const { data, error } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: true }));
    if (error || !data.user) {
      sessionStorage.setItem("swell-do-return", location.pathname === "/offer" ? "/offer" : "/post");
      throw redirect({ to: "/auth" });
    }
  },
  component: Outlet,
});
