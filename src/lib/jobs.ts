import { z } from "zod";

export const TRADES = [
  "Carpenter", "Painter", "Mechanic", "Electrician", "Plumber", "Mason",
  "Welder", "Boat Builder", "Gardener", "Cleaner", "Cook", "Driver", "Other",
] as const;

export const MUNICIPALITIES = [
  "General Luna", "Dapa", "Del Carmen", "Pilar", "San Isidro",
  "Santa Monica", "Burgos", "San Benito", "Socorro",
] as const;

export const PAY_UNITS = ["per day", "per hour", "per job", "per week"] as const;

export const jobSchema = z.object({
  title: z.string().trim().min(3, "At least 3 characters").max(120),
  trade: z.enum(TRADES),
  municipality: z.enum(MUNICIPALITIES),
  barangay: z.string().trim().min(2, "Enter the barangay").max(80),
  pay_amount: z.coerce.number().min(0, "Must be 0 or more").max(10_000_000),
  pay_unit: z.enum(PAY_UNITS),
  description: z.string().trim().min(10, "Describe the work (10+ characters)").max(2000),
  poster_name: z.string().trim().min(2, "Enter your name").max(80),
  contact: z.string().trim().min(5, "Enter a phone or email").max(120),
});

export type JobInput = z.infer<typeof jobSchema>;

export function formatPay(amount: number, unit: string) {
  return `₱${Number(amount).toLocaleString("en-PH")} ${unit}`;
}

export function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
