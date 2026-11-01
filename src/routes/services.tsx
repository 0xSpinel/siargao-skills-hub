import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowUpRight, MapPin, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { CommunityNav } from "@/components/CommunityNav";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAccount } from "@/components/AccountProvider";
import { MUNICIPALITIES } from "@/lib/jobs";
import { SERVICE_CATEGORIES, servicesQuery } from "@/lib/services";
import { supabase } from "@/integrations/supabase/client";
import servicesPhoto from "@/assets/local-services.jpg";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [
    { title: "Local services — swell do" },
    { name: "description", content: "Find Siargao electricians, gymnastics coaches, tutors and other local talents, or offer your own services." },
    { property: "og:title", content: "Local services — swell do" },
    { property: "og:description", content: "Connect with people offering skills and services across Siargao." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  component: Services,
});

function Services() {
  const { data } = useSuspenseQuery(servicesQuery);
  const { user } = useAccount();
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [town, setTown] = useState("All");
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const active = data.find((offer) => offer.id === selected);
  const filtered = useMemo(() => data.filter((offer) => (category === "All" || offer.category === category) && (town === "All" || offer.municipality === town) && `${offer.title} ${offer.description} ${offer.provider_name} ${offer.barangay}`.toLowerCase().includes(query.toLowerCase())), [data, category, town, query]);
  const field = "w-full rounded-lg border bg-background px-3 py-3 text-sm";
  async function remove() {
    if (!active || active.user_id !== user?.id) return;
    setBusy(true); setError("");
    const result = await supabase.from("service_offers").delete().eq("id", active.id).select("id");
    setBusy(false);
    if (result.error || !result.data?.length) { setError("Couldn't remove your offer. Please try again."); return; }
    setSelected(null);
    await qc.invalidateQueries({ queryKey: ["services"] });
  }
  return <div className="min-h-screen">
    <header className="border-b bg-card px-6 py-6"><div className="mx-auto max-w-5xl"><CommunityNav /></div></header>
    <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
      <img src={servicesPhoto} width={1536} height={768} alt="A local electrician working on an electrical panel" className="absolute inset-0 -z-10 h-full w-full object-cover object-right" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-foreground/50 sm:hidden" />
      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
        <p className="text-sm font-bold">SIARGAO · LOCAL TALENT</p>
        <h1 className="mt-4 max-w-sm font-display text-4xl font-extrabold sm:text-5xl">Skills worth sharing.</h1>
        <p className="mt-4 max-w-xs text-lg">From electrical fixes to a gymnastics lesson, find your island people.</p>
        <Button asChild className="mt-7 bg-accent text-accent-foreground hover:bg-accent/90"><Link to="/offer"><Plus /> Offer your services</Link></Button>
      </div>
    </section>
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold text-primary">THE ISLAND DIRECTORY</p><h2 className="mt-2 font-display text-3xl font-bold">People who can help</h2></div><span className="text-sm text-muted-foreground">{filtered.length} service offer{filtered.length !== 1 && "s"}</span></div>
      <div className="mt-6 grid gap-3 border-y py-5 md:grid-cols-[1fr_auto_auto]">
        <div className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><input aria-label="Search services" placeholder="Search services, names or barangay…" value={query} onChange={(event) => setQuery(event.target.value)} className={`${field} pl-9`} /></div>
        <select aria-label="Service category" value={category} onChange={(event) => setCategory(event.target.value)} className={field}><option value="All">All services</option>{SERVICE_CATEGORIES.map((value) => <option key={value}>{value}</option>)}</select>
        <select aria-label="Service municipality" value={town} onChange={(event) => setTown(event.target.value)} className={field}><option value="All">All municipalities</option>{MUNICIPALITIES.map((value) => <option key={value}>{value}</option>)}</select>
      </div>
      <div className="mt-7 grid gap-5 md:grid-cols-2">{filtered.map((offer) => <article key={offer.id} className="flex flex-col rounded-lg border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary font-display text-xl font-bold text-primary">{offer.provider_name.slice(0, 1).toUpperCase()}</span><div><p className="font-bold">{offer.provider_name}</p><p className="text-xs text-primary">{offer.category}</p></div></div>
        <h3 className="mt-5 font-display text-xl font-bold">{offer.title}</h3><p className="mt-2 flex items-start gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4 shrink-0" />{offer.barangay}, {offer.municipality}</p>
        <p className="mt-4 line-clamp-3 flex-1 whitespace-pre-line text-sm">{offer.description}</p>
        <Button variant="outline" className="mt-6 justify-between" onClick={() => { setSelected(offer.id); setError(""); }}>View service <ArrowUpRight /></Button>
      </article>)}</div>
      {!filtered.length && <div className="py-16 text-center"><Sparkles className="mx-auto h-8 w-8 text-primary" /><h3 className="mt-4 font-display text-2xl font-bold">{data.length ? "No matching services" : "Be the first to share your skills"}</h3><p className="mt-2 text-sm text-muted-foreground">{data.length ? "Try another category, town or search." : "Electrician, gymnastics coach, tutor — your talent belongs here."}</p><Button asChild className="mt-5"><Link to="/offer"><Plus /> Offer your services</Link></Button></div>}
    </main>
    <footer className="border-t px-6 py-8"><div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-4"><Link to="/" className="font-display text-xl font-bold text-primary">swell do</Link><Link to="/post" className="text-sm font-bold text-primary">Need help instead? Post a task →</Link></div></footer>
    <Dialog open={!!active} onOpenChange={(open) => { if (!open) setSelected(null); }}><DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">{active && <><DialogHeader><DialogTitle className="font-display text-2xl">{active.title}</DialogTitle><DialogDescription>{active.provider_name} · {active.category}</DialogDescription></DialogHeader><p className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{active.barangay}, {active.municipality}</p><p className="whitespace-pre-line break-words text-sm">{active.description}</p><div className="border-t pt-4"><p className="text-xs font-bold text-muted-foreground">CONTACT {active.provider_name.toUpperCase()}</p><p className="mt-2 select-all break-words font-semibold">{active.contact}</p></div>{user?.id === active.user_id && <Button variant="outline" disabled={busy} onClick={remove}><Trash2 />{busy ? "Removing…" : "Remove my offer"}</Button>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}</>}</DialogContent></Dialog>
  </div>;
}