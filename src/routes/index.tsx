import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { MapPin, Phone, Hammer, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MUNICIPALITIES, TRADES, formatPay, timeAgo } from "@/lib/jobs";

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
      { title: "Siargao Hanap-Trabaho — Local jobs for island talent" },
      { name: "description", content: "Find or post work for carpenters, painters, mechanics and electricians across Siargao's barangays." },
      { property: "og:title", content: "Siargao Hanap-Trabaho" },
      { property: "og:description", content: "A community job board connecting Siargao hirers with local tradespeople." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(jobsQuery),
  component: Index,
});

function Index() {
  const { data: jobs } = useSuspenseQuery(jobsQuery);
  const [trade, setTrade] = useState("All");
  const [town, setTown] = useState("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => jobs.filter((j) =>
    (trade === "All" || j.trade === trade) &&
    (town === "All" || j.municipality === town) &&
    (!q || `${j.title} ${j.description} ${j.barangay}`.toLowerCase().includes(q.toLowerCase()))
  ), [jobs, trade, town, q]);

  return (
    <div className="min-h-screen">
      <header className="px-6 pb-16 pt-10 text-primary-foreground" style={{ background: "var(--gradient-sea)" }}>
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between">
            <span className="font-display text-xl font-extrabold">Hanap-Trabaho · Siargao</span>
            <Link to="/post" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground hover:opacity-90">
              <Plus className="h-4 w-4" /> Post a job
            </Link>
          </div>
          <h1 className="mt-12 max-w-2xl font-display text-4xl font-extrabold leading-tight md:text-6xl">
            Island work, done by island hands.
          </h1>
          <p className="mt-4 max-w-xl text-lg opacity-90">
            Hire local carpenters, painters, mechanics and electricians — right in your barangay.
          </p>
        </div>
      </header>

      <main className="mx-auto -mt-8 max-w-5xl px-6 pb-20">
        <div className="grid gap-3 rounded-2xl border bg-card p-4 shadow-sm md:grid-cols-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jobs or barangay…"
            className="rounded-lg border bg-background px-3 py-2 text-sm" />
          <select value={trade} onChange={(e) => setTrade(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm">
            <option>All</option>{TRADES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={town} onChange={(e) => setTown(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm">
            <option>All</option>{MUNICIPALITIES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">{filtered.length} open job{filtered.length !== 1 && "s"}</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {filtered.map((j) => (
            <article key={j.id} className="flex flex-col rounded-2xl border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                  <Hammer className="h-3 w-3" /> {j.trade}
                </span>
                <span className="text-xs text-muted-foreground">{timeAgo(j.created_at)}</span>
              </div>
              <h2 className="mt-3 font-display text-xl font-semibold">{j.title}</h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> Brgy. {j.barangay}, {j.municipality}
              </p>
              <p className="mt-3 flex-1 whitespace-pre-line text-sm">{j.description}</p>
              <div className="mt-4 flex items-end justify-between border-t pt-4">
                <div>
                  <div className="font-display text-2xl font-extrabold text-primary">{formatPay(j.pay_amount, j.pay_unit)}</div>
                  <div className="text-xs text-muted-foreground">Posted by {j.poster_name}</div>
                </div>
                <span className="flex items-center gap-1 text-sm font-medium"><Phone className="h-4 w-4" />{j.contact}</span>
              </div>
            </article>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="mt-10 text-center text-muted-foreground">No jobs match yet. <Link to="/post" className="text-primary underline">Post one</Link>.</p>
        )}
      </main>
    </div>
  );
}
