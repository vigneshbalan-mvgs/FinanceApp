/*
  # Finance Management App Database Schema

  1. New Tables
    - `users` - User profiles extending Supabase auth
    - `categories` - Transaction categories with icons and colors
    - `transactions` - Income and expense transactions
    - `budgets` - Budget planning and tracking
    - `goals` - Financial goals and targets

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Ensure data isolation between users

  3. Features
    - Default categories for new users
    - Recurring transaction support
    - Budget period tracking
    - Goal progress monitoring
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  type text CHECK (type IN ('income', 'expense', 'both')) NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES public.categories(id) NOT NULL,
  type text CHECK (type IN ('income', 'expense')) NOT NULL,
  date date NOT NULL,
  is_recurring boolean DEFAULT false,
  recurring_frequency text CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES public.categories(id) NOT NULL,
  amount decimal(10,2) NOT NULL,
  period text CHECK (period IN ('weekly', 'monthly', 'yearly')) NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  spent decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  target_amount decimal(10,2) NOT NULL,
  current_amount decimal(10,2) DEFAULT 0,
  target_date date NOT NULL,
  status text CHECK (status IN ('active', 'completed', 'paused')) DEFAULT 'active',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Categories policies
CREATE POLICY "Users can read own categories"
  ON public.categories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON public.categories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON public.categories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON public.categories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can read own transactions"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Budgets policies
CREATE POLICY "Users can read own budgets"
  ON public.budgets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON public.budgets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON public.budgets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON public.budgets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can read own goals"
  ON public.goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON public.goals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON public.goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON public.goals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
  -- Create default categories for new user
  INSERT INTO public.categories (user_id, name, icon, color, type, is_default) VALUES
    (new.id, 'Food & Dining', '🍽️', '#EF4444', 'expense', true),
    (new.id, 'Transportation', '🚗', '#3B82F6', 'expense', true),
    (new.id, 'Shopping', '🛍️', '#8B5CF6', 'expense', true),
    (new.id, 'Entertainment', '🎮', '#F59E0B', 'expense', true),
    (new.id, 'Bills & Utilities', '⚡', '#EF4444', 'expense', true),
    (new.id, 'Healthcare', '❤️', '#EC4899', 'expense', true),
    (new.id, 'Education', '📚', '#06B6D4', 'expense', true),
    (new.id, 'Groceries', '🛒', '#10B981', 'expense', true),
    (new.id, 'Salary', '💼', '#10B981', 'income', true),
    (new.id, 'Freelance', '💻', '#06B6D4', 'income', true),
    (new.id, 'Investment', '📈', '#8B5CF6', 'income', true),
    (new.id, 'Business', '🏢', '#F59E0B', 'income', true);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update budget spent amount
CREATE OR REPLACE FUNCTION public.update_budget_spent()
RETURNS trigger AS $$
BEGIN
  -- Update budget spent amount when transaction is added/updated/deleted
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.budgets 
    SET spent = (
      SELECT COALESCE(SUM(amount), 0)
      FROM public.transactions 
      WHERE category_id = NEW.category_id 
        AND user_id = NEW.user_id
        AND type = 'expense'
        AND date >= (SELECT start_date FROM public.budgets WHERE category_id = NEW.category_id AND user_id = NEW.user_id)
        AND date <= (SELECT end_date FROM public.budgets WHERE category_id = NEW.category_id AND user_id = NEW.user_id)
    )
    WHERE category_id = NEW.category_id AND user_id = NEW.user_id;
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    UPDATE public.budgets 
    SET spent = (
      SELECT COALESCE(SUM(amount), 0)
      FROM public.transactions 
      WHERE category_id = OLD.category_id 
        AND user_id = OLD.user_id
        AND type = 'expense'
        AND date >= (SELECT start_date FROM public.budgets WHERE category_id = OLD.category_id AND user_id = OLD.user_id)
        AND date <= (SELECT end_date FROM public.budgets WHERE category_id = OLD.category_id AND user_id = OLD.user_id)
    )
    WHERE category_id = OLD.category_id AND user_id = OLD.user_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update budget spent amount
DROP TRIGGER IF EXISTS on_transaction_change ON public.transactions;
CREATE TRIGGER on_transaction_change
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE PROCEDURE public.update_budget_spent();
