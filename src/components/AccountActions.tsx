import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/components/AccountProvider";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export function AccountActions() {
  const { user, ready } = useAccount();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function signOut() {
    setBusy(true); setError("");
    await qc.cancelQueries(); qc.clear();
    const { error } = await supabase.auth.signOut();
    setBusy(false);
    if (error) { setError("Couldn't sign out. Please try again."); return; }
    await navigate({ to: "/auth", replace: true });
  }
  return <div className="flex flex-wrap items-center gap-2">
    {ready && user ? <><span className="max-w-32 truncate text-sm">{user.user_metadata['display_name'] || user.user_metadata['full_name'] || "Account"}</span><Button variant="secondary" size="sm" disabled={busy} onClick={signOut}><LogOut /> Sign out</Button></> : <Button asChild variant="secondary" size="sm"><Link to="/auth"><LogIn /> Log in</Link></Button>}
    {error && <span role="alert" className="text-sm">{error}</span>}
  </div>;
}