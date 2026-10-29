import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { jobSchema, type JobInput, MUNICIPALITIES, TRADES } from "@/lib/jobs";

export const Route = createFileRoute("/post")({
  head: () => ({
    meta: [
      { title: "Post a job — Siargao Hanap-Trabaho" },
      { name: "description", content: "Post a quick task for local Siargao tradespeople with barangay, pay and details." },
      { property: "og:title", content: "Post a job — Siargao Hanap-Trabaho" },
      { property: "og:description", content: "Reach local carpenters, painters, mechanics and electricians in Siargao." },
    ],
  }),
  component: PostJob,
});

const field = "w-full rounded-lg border bg-background px-3 py-2 text-sm";

function Field({ label, error, children }: { label: string; error?: string | undefined; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

function PostJob() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [errors, setErrors] = useState<Partial<Record<keyof JobInput, string>>>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = jobSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      const errs: Partial<Record<keyof JobInput, string>> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as keyof JobInput] ??= i.message; });
      setErrors(errs);
      return;
    }
    setErrors({}); setBusy(true); setFailure("");
    const { error } = await supabase.from("job_posts").insert({ ...parsed.data, pay_unit: "per job" });
    setBusy(false);
    if (error) { setFailure("Couldn't post the job. Please try again."); return; }
    await qc.invalidateQueries({ queryKey: ["jobs"] });
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="text-sm text-primary">← Back to jobs</Link>
        <h1 className="mt-4 font-display text-4xl font-extrabold">Post a quick task</h1>
        <p className="mt-2 text-muted-foreground">One problem, one fix — something that takes an hour or a day. Say where it is and what you'll pay.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-2xl border bg-card p-6">
          <Field label="Job title" error={errors.title}><input name="title" className={field} placeholder="e.g. Repair bamboo fence" /></Field>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Trade needed" error={errors.trade}>
              <select name="trade" className={field}>{TRADES.map((t) => <option key={t}>{t}</option>)}</select>
            </Field>
            <Field label="Municipality" error={errors.municipality}>
              <select name="municipality" className={field}>{MUNICIPALITIES.map((t) => <option key={t}>{t}</option>)}</select>
            </Field>
          </div>
          <Field label="Barangay" error={errors.barangay}><input name="barangay" className={field} placeholder="e.g. Catangnan" /></Field>
          <Field label="What you'll pay for the whole task (₱)" error={errors.pay_amount}><input name="pay_amount" type="number" min="0" className={field} placeholder="500" /></Field>
          <Field label="Job description" error={errors.description}>
            <textarea name="description" rows={5} className={field} placeholder="What's broken or needs doing? Materials provided?" />
          </Field>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Your name" error={errors.poster_name}><input name="poster_name" className={field} /></Field>
            <Field label="Phone or email" error={errors.contact}><input name="contact" className={field} /></Field>
          </div>
          {failure && <p className="text-sm text-destructive">{failure}</p>}
          <button disabled={busy} className="w-full rounded-full bg-primary py-3 font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60">
            {busy ? "Posting…" : "Post job"}
          </button>
        </form>
      </div>
    </div>
  );
}
