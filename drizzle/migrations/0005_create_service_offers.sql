CREATE TABLE public.service_offers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 title text NOT NULL CHECK (char_length(trim(title)) BETWEEN 3 AND 120),
 category text NOT NULL CHECK (category IN ('Carpenter','Painter','Mechanic','Electrician','Plumber','Mason','Welder','Boat Builder','Gardener','Cleaner','Cook','Driver','Gymnastics Coach','Fitness Coach','Tutor','Other')),
 municipality text NOT NULL CHECK (municipality IN ('General Luna','Dapa','Del Carmen','Pilar','San Isidro','Santa Monica','Burgos','San Benito','Socorro')),
 barangay text NOT NULL CHECK (char_length(trim(barangay)) BETWEEN 2 AND 80),
 description text NOT NULL CHECK (char_length(trim(description)) BETWEEN 10 AND 2000),
 provider_name text NOT NULL CHECK (public.readable_display_name(provider_name)),
 contact text NOT NULL CHECK (char_length(trim(contact)) BETWEEN 5 AND 120),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_offers TO anon;
GRANT SELECT, INSERT, DELETE ON public.service_offers TO authenticated;
GRANT ALL ON public.service_offers TO service_role;
ALTER TABLE public.service_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can browse service offers" ON public.service_offers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Validated owners can offer services" ON public.service_offers FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.display_name = provider_name AND p.display_name IS NOT NULL));
CREATE POLICY "Owners can remove their services" ON public.service_offers FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX service_offers_created_at_idx ON public.service_offers(created_at DESC);