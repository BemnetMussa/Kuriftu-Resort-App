// src/utils/AuthProvider.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";
import { Session } from "@supabase/supabase-js";
import { Alert } from "react-native";

interface User {
  name: string;
  email: string;
  avatar: string | { uri: string }; // Support both URL and local asset
}

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (updatedUser: { name?: string; email?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Fetch initial session and user
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const {
          data: { user: authUser },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        setSession(session);
        setUser(
          authUser
            ? {
                name:
                  authUser.user_metadata?.full_name ||
                  authUser.email?.split("@")[0] ||
                  "",
                email: authUser.email || "",
                avatar:
                  authUser.user_metadata?.avatar_url ||
                  require("../assets/profile.png"),
              }
            : null
        );
      } catch (error) {
        console.error("Error initializing auth:", error);
        Alert.alert("Error", "Failed to initialize session. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (!data.session) throw new Error("No session returned");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to sign in");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (!email || !password || !name) {
      throw new Error("All fields are required");
    }
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }, // Store name in user_metadata
        },
      });
      if (error) throw error;
      if (!data.user) throw new Error("User creation failed");
      // if (data.user) {
      //   const { error: profileError } = await supabase
      //     .from("profiles")
      //     .insert([{ id: data.user.id, name }]);
      //   if (profileError) {
      //     setLoading(false);
      //     Alert.alert("Error", profileError.message);
      //     throw error;
      //   }
      // }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to sign up");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to sign out");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!email) {
      throw new Error("Email is required");
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:3000/reset-password", // Replace with your app's deep link
      });
      if (error) throw error;
      Alert.alert("Success", "Password reset email sent");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send reset email");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updatedUser: { name?: string; email?: string }) => {
    const updates: any = {};
    if (updatedUser.name) updates.data = { full_name: updatedUser.name };
    if (updatedUser.email) updates.email = updatedUser.email;

    const { error } = await supabase.auth.updateUser(updates);
    if (error) throw error;

    const {
      data: { user: updated },
    } = await supabase.auth.getUser();
    setUser({
      name: updated?.user_metadata?.full_name || updated?.email?.split("@")[0],
      email: updated?.email || "",
      avatar:
        updated?.user_metadata?.avatar_url || require("../assets/favicon.png"),
    });
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
