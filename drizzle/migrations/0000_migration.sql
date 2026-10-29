CREATE TABLE public.job_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
  trade text NOT NULL CHECK (char_length(trade) BETWEEN 2 AND 40),
  barangay text NOT NULL CHECK (char_length(barangay) BETWEEN 2 AND 80),
  municipality text NOT NULL CHECK (char_length(municipality) BETWEEN 2 AND 60),
  pay_amount numeric NOT NULL CHECK (pay_amount >= 0 AND pay_amount <= 10000000),
  pay_unit text NOT NULL CHECK (pay_unit IN ('per day','per hour','per job','per week')),
  description text NOT NULL CHECK (char_length(description) BETWEEN 10 AND 2000),
  poster_name text NOT NULL CHECK (char_length(poster_name) BETWEEN 2 AND 80),
  contact text NOT NULL CHECK (char_length(contact) BETWEEN 5 AND 120),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.job_posts TO anon, authenticated;
GRANT ALL ON public.job_posts TO service_role;
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view jobs" ON public.job_posts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can post jobs" ON public.job_posts FOR INSERT TO anon, authenticated WITH CHECK (true);
INSERT INTO public.job_posts (title,trade,barangay,municipality,pay_amount,pay_unit,description,poster_name,contact) VALUES
('Fix leaking nipa roof before rainy season','Carpenter','Catangnan','General Luna',900,'per day','Need an experienced carpenter to replace damaged nipa and bamboo supports on a small cottage roof. Around 3 days of work. Materials provided.','Maria S.','0917 555 0142'),
('Repaint sari-sari store exterior','Painter','Poblacion 5','General Luna',4500,'per job','Repaint front and side walls of our store (approx. 40 sqm). Paint is ready, just need labor and brushes/rollers.','Jun R.','0928 555 0199'),
('Habal-habal motorbike won''t start','Mechanic','Union','Dapa',600,'per job','Honda XRM 125 cranks but won''t start. Need someone who can come to Union and check fuel/ignition.','Rolando T.','0905 555 0177'),
('Rewire small surf hostel rooms','Electrician','Malinao','General Luna',1100,'per day','Replace old wiring and outlets in 4 rooms. Must be licensed or with solid experience. Est. 4–5 days.','Kai Hostel','kaihostel@example.com'),
('Build wooden shelves for café','Carpenter','Santa Fe','Pilar',3500,'per job','Looking for someone to build 3 floating shelves and a small counter from coco lumber.','Ana L.','0919 555 0123');