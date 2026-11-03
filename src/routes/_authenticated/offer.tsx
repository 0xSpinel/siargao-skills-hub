import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isDemo, DEMO_BLOCKED } from "@/lib/demo";
import { useAccount } from "@/components/AccountProvider";
import { CommunityNav } from "@/components/CommunityNav";
import { Button } from "@/components/ui/button";
import { MUNICIPALITIES } from "@/lib/jobs";
import { SERVICE_CATEGORIES, serviceSchema } from "@/lib/services";

export const Route = createFileRoute("/_authenticated/offer")({
  head: () => ({ meta: [
    { title: "Offer your services — swell do" },
    { name: "description", content: "Share your skills with the Siargao community and let neighbors contact you for help." },
    { property: "og:title", content: "Offer your services — swell do" },
    { property: "og:description", content: "Publish your local service offer on swell do." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: OfferService,
});

function OfferService() {
  const { user } = useAccount();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState("");
  const [busy, setBusy] = useState(false);
  const field = "mt-2 w-full rounded-lg border bg-background px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const error = (name: string) => errors[name] && <span role="alert" className="mt-1 block text-xs text-destructive">{errors[name]}</span>;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setFailure("");
    const parsed = serviceSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!parsed.success) { const next: Record<string, string> = {}; parsed.error.issues.forEach((issue) => { next[String(issue.path[0])] ??= issue.message; }); setErrors(next); return; }
    setErrors({});
    if (isDemo()) { setFailure(DEMO_BLOCKED); return; }
    setBusy(true);
    try {
      const { data: verified, error: authError } = await supabase.auth.getUser();
      if (authError || !verified.user) { setFailure("Please log in before offering your services."); return; }
      const profile = await supabase.from("profiles").upsert({ id: verified.user.id, display_name: parsed.data.provider_name });
      if (profile.error) { setFailure("Couldn't save your name. Please try again."); return; }
      const result = await supabase.from("service_offers").insert({ ...parsed.data, user_id: verified.user.id });
      if (result.error) { setFailure("Couldn't publish your service. Please try again."); return; }
      await qc.invalidateQueries({ queryKey: ["services"] });
      await navigate({ to: "/services" });
    } catch { setFailure("Couldn't publish your service. Check your connection and try again."); }
    finally { setBusy(false); }
  }
  return <div className="min-h-screen"><header className="border-b bg-card px-6 py-6"><div className="mx-auto max-w-5xl"><CommunityNav /></div></header><main className="mx-auto max-w-2xl px-6 py-10">
    <Button asChild variant="link" className="px-0"><Link to="/services"><ArrowLeft /> Back to services</Link></Button>
    <h1 className="mt-5 font-display text-4xl font-bold">Offer your services</h1><p className="mt-3 text-muted-foreground">Your skills, your community. Let people know what you can help with.</p>
    <form onSubmit={submit} noValidate className="mt-8 space-y-5 border-t pt-7">
      <label className="block text-sm font-bold">Service title<input name="title" maxLength={120} className={field} placeholder="e.g. Electrical repairs or beginner gymnastics lessons" />{error("title")}</label>
      <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-bold">Service category<select name="category" className={field}>{SERVICE_CATEGORIES.map((value) => <option key={value}>{value}</option>)}</select>{error("category")}</label><label className="block text-sm font-bold">Municipality<select name="municipality" className={field}>{MUNICIPALITIES.map((value) => <option key={value}>{value}</option>)}</select>{error("municipality")}</label></div>
      <label className="block text-sm font-bold">Barangay<input name="barangay" maxLength={80} className={field} placeholder="e.g. Catangnan" />{error("barangay")}</label>
      <label className="block text-sm font-bold">What you offer<textarea name="description" rows={5} maxLength={2000} className={field} placeholder="Describe your skills, the help you provide, and where you're available." />{error("description")}</label>
      <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-bold">Your name<input name="provider_name" maxLength={80} className={field} defaultValue={user?.user_metadata?.['display_name'] || user?.user_metadata?.['full_name'] || ""} />{error("provider_name")}</label><label className="block text-sm font-bold">Phone or email<input name="contact" maxLength={120} className={field} />{error("contact")}</label></div>
      {failure && <p role="alert" className="text-sm text-destructive">{failure}</p>}
      <Button type="submit" disabled={busy} className="h-12 w-full"><Plus />{busy ? "Publishing…" : "Publish service offer"}</Button>
    </form>
  </main></div>;
}