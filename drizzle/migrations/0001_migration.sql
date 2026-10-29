ALTER TABLE public.job_posts ALTER COLUMN pay_unit SET DEFAULT 'per job';
UPDATE public.job_posts SET pay_unit = 'per job';
DELETE FROM public.job_posts WHERE poster_name = 'Tester';