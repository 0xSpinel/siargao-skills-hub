ALTER TABLE public.job_posts ADD COLUMN latitude double precision, ADD COLUMN longitude double precision, ADD COLUMN photo_url text;
CREATE POLICY "Anyone can upload job photos" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'job-photos');
CREATE POLICY "Anyone can view job photos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'job-photos');