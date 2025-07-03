import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { FinanceState } from '../types';

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  categories: [],
  budgets: [],
  goals: [],
  loading: false,

  addTransaction: async (transactionData) => {
    try {
      set({ loading: true });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transactionData,
          user_id: user.id,
        })
        .select('*, category:categories(*)')
        .single();

      if (error) throw error;

      set(state => ({
        transactions: [data, ...state.transactions],
        loading: false
      }));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  updateTransaction: async (id, updates) => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select('*, category:categories(*)')
        .single();

      if (error) throw error;

      set(state => ({
        transactions: state.transactions.map(t => t.id === id ? data : t),
        loading: false
      }));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        transactions: state.transactions.filter(t => t.id !== id)
      }));
    } catch (error) {
      throw error;
    }
  },

  addCategory: async (categoryData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...categoryData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        categories: [...state.categories, data]
      }));
    } catch (error) {
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        categories: state.categories.filter(c => c.id !== id)
      }));
    } catch (error) {
      throw error;
    }
  },

  addBudget: async (budgetData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('budgets')
        .insert({
          ...budgetData,
          user_id: user.id,
          spent: 0,
        })
        .select('*, category:categories(*)')
        .single();

      if (error) throw error;

      set(state => ({
        budgets: [...state.budgets, data]
      }));
    } catch (error) {
      throw error;
    }
  },

  addGoal: async (goalData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('goals')
        .insert({
          ...goalData,
          user_id: user.id,
          current_amount: 0,
        })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        goals: [...state.goals, data]
      }));
    } catch (error) {
      throw error;
    }
  },

  fetchTransactions: async () => {
    try {
      set({ loading: true });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      set({ transactions: data || [], loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchCategories: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;

      set({ categories: data || [] });
    } catch (error) {
      throw error;
    }
  },

  fetchBudgets: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('budgets')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ budgets: data || [] });
    } catch (error) {
      throw error;
    }
  },

  fetchGoals: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ goals: data || [] });
    } catch (error) {
      throw error;
    }
  },

  get categoriesList() {
    return get().categories;
  },
}));