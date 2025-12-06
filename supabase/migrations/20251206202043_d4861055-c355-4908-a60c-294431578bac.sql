-- Create storage bucket for candidates
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidates', 'candidates', true);

-- Allow public read access
CREATE POLICY "Public read access for candidates" ON storage.objects
FOR SELECT USING (bucket_id = 'candidates');

-- Allow authenticated uploads (for edge function with service role)
CREATE POLICY "Service role can upload candidates" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'candidates');

CREATE POLICY "Service role can update candidates" ON storage.objects
FOR UPDATE USING (bucket_id = 'candidates');

CREATE POLICY "Service role can delete candidates" ON storage.objects
FOR DELETE USING (bucket_id = 'candidates');