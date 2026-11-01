import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { MapPin, Phone, Hammer, Plus, Search, Waves, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MUNICIPALITIES, TRADES, formatPay, timeAgo } from "@/lib/jobs";
import { JobDetail } from "@/components/JobDetail";
import { CommunityNav } from "@/components/CommunityNav";
import { Button } from "@/components/ui/button";

const jobsQuery = queryOptions({
  queryKey: ["jobs"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("job_posts").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) throw error;
    return data;
  },
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "swell do — Quick tasks in Siargao" },
      { name: "description", content: "Find or post work for carpenters, painters, mechanics and electricians across Siargao's barangays." },
      { property: "og:title", content: "swell do — Quick tasks in Siargao" },
      { property: "og:description", content: "A community job board connecting Siargao hirers with local tradespeople." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(jobsQuery),
  component: Index,
});

const selectCls = "rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function Index() {
  const { data: jobs } = useSuspenseQuery(jobsQuery);
  const [trade, setTrade] = useState("All");
  const [town, setTown] = useState("All");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => jobs.filter((j) =>
    (trade === "All" || j.trade === trade) &&
    (town === "All" || j.municipality === town) &&
    (!q || `${j.title} ${j.description} ${j.barangay}`.toLowerCase().includes(q.toLowerCase()))
  ), [jobs, trade, town, q]);

  const towns = useMemo(() => new Set(jobs.map((j) => j.municipality)).size, [jobs]);
  const trades = useMemo(() => new Set(jobs.map((j) => j.trade)).size, [jobs]);

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden px-6 pb-28 pt-8 text-primary-foreground" style={{ background: "var(--gradient-sea)" }}>
        <div className="pointer-events-none absolute inset-0" style={{ background: "var(--gradient-sun)" }} />
        <div className="relative mx-auto max-w-5xl">
          <CommunityNav />
          <span className="mt-14 inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-1.5 text-xs font-bold tracking-wide backdrop-blur-sm">
            Community board · One-off tasks · Fair pay
          </span>
          <h1 className="mt-5 max-w-2xl font-display text-4xl font-extrabold leading-tight md:text-6xl">
            Island work, done by island hands.
          </h1>
          <p className="mt-4 max-w-xl text-lg opacity-90">
            Got a quick fix — an hour or a day's work? Post it, name your price, and a local carpenter, painter, mechanic or electrician nearby can take it.
          </p>
          <div className="mt-6 flex flex-wrap gap-3"><Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90"><Link to="/post"><Plus /> Post a task</Link></Button><Button asChild variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"><Link to="/services">Find local services <ArrowRight /></Link></Button></div>
          <div className="mt-8 flex flex-wrap gap-6 text-sm">
            <span><strong className="font-display text-2xl font-extrabold">{jobs.length}</strong> open task{jobs.length !== 1 && "s"}</span>
            <span><strong className="font-display text-2xl font-extrabold">{towns}</strong> municipalities</span>
            <span><strong className="font-display text-2xl font-extrabold">{trades}</strong> trades</span>
          </div>
        </div>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" fill="currentColor" aria-hidden
          className="absolute bottom-0 left-0 h-14 w-full text-background">
          <path d="M0,42 C240,82 480,4 720,32 C960,60 1200,18 1440,46 L1440,80 L0,80 Z" />
        </svg>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20">
        <div className="relative z-10 -mt-16 grid gap-3 rounded-2xl border bg-card p-4 shadow-[var(--shadow-lift)] md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jobs or barangay…"
              className={`${selectCls} w-full pl-9`} />
          </div>
          <select value={trade} onChange={(e) => setTrade(e.target.value)} className={selectCls} aria-label="Filter by trade">
            <option>All</option>{TRADES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={town} onChange={(e) => setTown(e.target.value)} className={selectCls} aria-label="Filter by municipality">
            <option>All</option>{MUNICIPALITIES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <p className="mt-10 text-sm font-semibold text-muted-foreground">{filtered.length} open job{filtered.length !== 1 && "s"}</p>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          {filtered.map((j) => (
            <article key={j.id} role="button" tabIndex={0} onClick={() => setOpenId(j.id)}
              onKeyDown={(e) => e.key === "Enter" && setOpenId(j.id)}
              className="group flex cursor-pointer flex-col rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-lift)]">
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                  <Hammer className="h-3 w-3" /> {j.trade}
                </span>
                <span className="text-xs text-muted-foreground">{timeAgo(j.created_at)}</span>
              </div>
              <h2 className="mt-3 font-display text-xl font-semibold group-hover:text-primary">{j.title}</h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> Brgy. {j.barangay}, {j.municipality}
              </p>
              <p className="mt-3 flex-1 whitespace-pre-line text-sm">{j.description}</p>
              <div className="mt-4 flex items-end justify-between gap-3 border-t pt-4">
                <div className="rounded-xl bg-secondary px-3 py-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Pay for this task</div>
                  <div className="font-display text-xl font-extrabold text-primary">{formatPay(j.pay_amount)}</div>
                  <div className="text-xs text-muted-foreground">Posted by {j.poster_name}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="flex items-center gap-1 text-sm font-medium"><Phone className="h-4 w-4" />{j.contact}</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-primary opacity-0 transition group-hover:opacity-100">
                    View map & details <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="mt-12 rounded-2xl border border-dashed bg-card px-6 py-14 text-center">
            <Waves className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">No jobs match yet. <Link to="/post" className="font-bold text-primary underline">Post one</Link> and help a neighbor.</p>
          </div>
        )}
      </main>

      <footer className="border-t bg-card px-6 py-12 text-center">
        <p className="flex items-center justify-center gap-2 font-display text-lg font-extrabold"><Waves className="h-5 w-5 text-primary" /> swell do</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          A community board for quick fixes and fair pay — connecting Siargao hirers with local tradespeople, one task at a time.
        </p>
      </footer>
      <JobDetail job={jobs.find((j) => j.id === openId) ?? null} onClose={() => setOpenId(null)} />
    </div>
  );
}
