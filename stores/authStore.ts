import { router } from "expo-router";
import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { AuthState, User } from "../types";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({
        user: data.user as User,
        session: data.session,
      });
    } catch (error) {
      throw error;
    }
  },

  signUp: async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
        });

        // Create default categories
        const defaultCategories = [
          {
            name: "Food & Dining",
            icon: "utensils",
            color: "#EF4444",
            type: "expense" as const,
          },
          {
            name: "Transportation",
            icon: "car",
            color: "#3B82F6",
            type: "expense" as const,
          },
          {
            name: "Shopping",
            icon: "shopping-bag",
            color: "#8B5CF6",
            type: "expense" as const,
          },
          {
            name: "Entertainment",
            icon: "gamepad-2",
            color: "#F59E0B",
            type: "expense" as const,
          },
          {
            name: "Bills & Utilities",
            icon: "zap",
            color: "#EF4444",
            type: "expense" as const,
          },
          {
            name: "Healthcare",
            icon: "heart",
            color: "#EC4899",
            type: "expense" as const,
          },
          {
            name: "Salary",
            icon: "briefcase",
            color: "#10B981",
            type: "income" as const,
          },
          {
            name: "Freelance",
            icon: "laptop",
            color: "#06B6D4",
            type: "income" as const,
          },
          {
            name: "Investment",
            icon: "trending-up",
            color: "#8B5CF6",
            type: "income" as const,
          },
        ];

        await supabase.from("categories").insert(
          defaultCategories.map((cat) => ({
            ...cat,
            user_id: data.user!.id,
            is_default: true,
          })),
        );
      }

      set({
        user: data.user as User,
        session: data.session,
      });
    } catch (error) {
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({ user: null, session: null, loading: false });
      router.replace("/(auth)/login");
    } catch (error) {
      set({ user: null, session: null, loading: false });
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  },

  initialize: async () => {
    set({ loading: true });
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      set({ user: null, session: null, loading: false });
      return;
    }
    set({
      user: (data.session?.user as User) || null,
      session: data.session || null,
      loading: false,
    });
  },
}));

supabase.auth.onAuthStateChange((event, session) => {
  useAuthStore.setState({
    user: (session?.user as User) || null,
    session,
    loading: false,
  });
});
