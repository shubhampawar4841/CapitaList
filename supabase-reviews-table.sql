-- AI Reviews Table
CREATE TABLE IF NOT EXISTS public.ai_reviews (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  transaction_id uuid,
  review_type text NOT NULL CHECK (review_type = ANY (ARRAY['transaction'::text, 'category'::text, 'monthly'::text, 'general'::text])),
  context text NOT NULL,
  analysis text NOT NULL,
  insights text[],
  recommendations text[],
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT ai_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT ai_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT ai_reviews_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS ai_reviews_user_id_idx ON public.ai_reviews(user_id);
CREATE INDEX IF NOT EXISTS ai_reviews_transaction_id_idx ON public.ai_reviews(transaction_id);
CREATE INDEX IF NOT EXISTS ai_reviews_review_type_idx ON public.ai_reviews(review_type);
CREATE INDEX IF NOT EXISTS ai_reviews_created_at_idx ON public.ai_reviews(created_at DESC);

-- RLS Policies
ALTER TABLE public.ai_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own reviews
CREATE POLICY "Users can view their own reviews"
  ON public.ai_reviews
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own reviews
CREATE POLICY "Users can insert their own reviews"
  ON public.ai_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
  ON public.ai_reviews
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
  ON public.ai_reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_ai_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_reviews_updated_at
  BEFORE UPDATE ON public.ai_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_reviews_updated_at();



