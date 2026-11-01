import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { displayNameSchema } from "@/lib/account-validation";
import { MUNICIPALITIES, TRADES } from "@/lib/jobs";

export const SERVICE_CATEGORIES = [...TRADES.filter((trade) => trade !== "Other"), "Gymnastics Coach", "Fitness Coach", "Tutor", "Other"];
export const serviceSchema = z.object({
  title: z.string().trim().min(3, "Enter a service title (3+ characters).").max(120),
  category: z.string().refine((value) => SERVICE_CATEGORIES.includes(value), "Choose a service category."),
  municipality: z.enum(MUNICIPALITIES),
  barangay: z.string().trim().min(2, "Enter your barangay.").max(80),
  description: z.string().trim().min(10, "Describe what you offer (10+ characters).").max(2000),
  provider_name: displayNameSchema,
  contact: z.string().trim().min(5, "Enter your phone number or email.").max(120),
});
export type ServiceInput = z.infer<typeof serviceSchema>;
export const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: async () => {
    const { data, error } = await supabase.from("service_offers").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) throw error;
    return data;
  },
});