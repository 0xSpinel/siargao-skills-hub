import { useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { MapPin, Phone, Hammer } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { formatPay } from "@/lib/jobs";
import { JobMap } from "./JobMap";

export function JobDetail({ job, onClose }: { job: Tables<"job_posts"> | null; onClose: () => void }) {
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    setPhoto(null);
    if (!job?.photo_url) return;
    supabase.storage.from("job-photos").createSignedUrl(job.photo_url, 3600)
      .then(({ data }) => setPhoto(data?.signedUrl ?? null));
  }, [job?.photo_url]);

  const pos = job?.latitude != null && job?.longitude != null ? { lat: job.latitude, lng: job.longitude } : null;

  return (
    <Dialog open={!!job} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        {job && (
          <>
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
              <Hammer className="h-3 w-3" /> {job.trade}
            </span>
            <DialogTitle className="font-display text-2xl">{job.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> Brgy. {job.barangay}, {job.municipality}
            </DialogDescription>
            <ClientOnly fallback={<div className="h-64 rounded-lg bg-muted" />}>
              <JobMap key={job.id} position={pos} className="h-64 w-full overflow-hidden rounded-lg border" />
            </ClientOnly>
            {!pos && <p className="text-xs text-muted-foreground">The hirer didn't pin an exact spot — ask them for directions.</p>}
            {job.photo_url && (photo
              ? <img src={photo} alt={`Photo for ${job.title}`} className="max-h-96 w-full rounded-lg object-cover" />
              : <div className="h-48 animate-pulse rounded-lg bg-muted" />)}
            <p className="whitespace-pre-line text-sm">{job.description}</p>
            <div className="flex items-end justify-between gap-3 border-t pt-4">
              <div className="rounded-xl bg-secondary px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Pay for this task</div>
                <div className="font-display text-2xl font-extrabold text-primary">{formatPay(job.pay_amount)}</div>
                <div className="text-xs text-muted-foreground">Posted by {job.poster_name}</div>
              </div>
              <span className="flex items-center gap-1 text-sm font-medium"><Phone className="h-4 w-4" />{job.contact}</span>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
