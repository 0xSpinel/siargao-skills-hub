// Integration-compatible client-only gate: sessions are stored in the browser.
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      sessionStorage.setItem("swell-do-return", location.pathname === "/offer" ? "/offer" : "/post");
      throw redirect({ to: "/auth" });
    }
  },
  component: Outlet,
});