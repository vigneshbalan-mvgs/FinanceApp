export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category_id: string;
  type: 'income' | 'expense';
  date: string;
  is_recurring: boolean;
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  spent: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export interface FinanceState {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'spent'>) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_amount'>) => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchBudgets: () => Promise<void>;
  fetchGoals: () => Promise<void>;
}

export interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
};

export type TabParamList = {
  dashboard: undefined;
  transactions: undefined;
  budgets: undefined;
  profile: undefined;
};