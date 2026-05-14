-- Create video_testimonials table
CREATE TABLE IF NOT EXISTS public.video_testimonials (
  id BIGSERIAL PRIMARY KEY,
  youtube_id TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.video_testimonials ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to video testimonials"
  ON public.video_testimonials
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated users with admin role to insert
CREATE POLICY "Allow admin insert to video testimonials"
  ON public.video_testimonials
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create policy to allow authenticated users with admin role to delete
CREATE POLICY "Allow admin delete from video testimonials"
  ON public.video_testimonials
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_video_testimonials_created_at 
  ON public.video_testimonials (created_at DESC);

-- Insert default testimonials (optional - estos son los videos que tenías antes)
INSERT INTO public.video_testimonials (youtube_id, title) VALUES
  ('RIBca2Do-gs', 'Testimonio 1'),
  ('3UUojxQvl1I', 'Testimonio 2'),
  ('wKH41RBxnCU', 'Testimonio 3'),
  ('pxujtXL4SZE', 'Testimonio 4'),
  ('dvkBRocbpzU', 'Testimonio 5'),
  ('dk7j_zmZ1CA', 'Testimonio 6'),
  ('MxlJoew71XM', 'Testimonio 7');
