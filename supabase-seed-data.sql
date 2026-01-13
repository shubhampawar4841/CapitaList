-- Seed data for testing (optional - remove in production)
-- This file contains sample data that you can use for testing

-- Note: Replace 'YOUR_USER_ID' with actual user UUID from auth.users table
-- You can get your user ID by running: SELECT id FROM auth.users LIMIT 1;

-- Example: Insert default categories (run after creating a user)
/*
INSERT INTO public.categories (user_id, name, icon, color, type) VALUES
  ('YOUR_USER_ID', 'Food & Dining', '🍔', '#8B5CF6', 'expense'),
  ('YOUR_USER_ID', 'Shopping', '🛍️', '#A855F7', 'expense'),
  ('YOUR_USER_ID', 'Transportation', '🚗', '#C084FC', 'expense'),
  ('YOUR_USER_ID', 'Entertainment', '🎬', '#D8B4FE', 'expense'),
  ('YOUR_USER_ID', 'Bills & Utilities', '💡', '#E9D5FF', 'expense'),
  ('YOUR_USER_ID', 'Health & Fitness', '💊', '#F3E8FF', 'expense'),
  ('YOUR_USER_ID', 'Salary', '💰', '#10B981', 'income'),
  ('YOUR_USER_ID', 'Freelance', '💼', '#10B981', 'income');

-- Example: Insert default tags
INSERT INTO public.tags (user_id, name, color) VALUES
  ('YOUR_USER_ID', 'food', '#8B5CF6'),
  ('YOUR_USER_ID', 'dining', '#A855F7'),
  ('YOUR_USER_ID', 'shopping', '#C084FC'),
  ('YOUR_USER_ID', 'transport', '#D8B4FE'),
  ('YOUR_USER_ID', 'entertainment', '#E9D5FF'),
  ('YOUR_USER_ID', 'bills', '#F3E8FF'),
  ('YOUR_USER_ID', 'health', '#10B981'),
  ('YOUR_USER_ID', 'salary', '#10B981'),
  ('YOUR_USER_ID', 'income', '#10B981');
*/




