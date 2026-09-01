// lib/hooks/use-user.ts — Client-Side Auth State & Profile Hook for KorraStore.
// Subscribes to Supabase onAuthStateChange for live components (avatar, nav rail, logout actions).
// Used in: Client Components needing user status without a heavy global provider.

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { UserRole } from "@/lib/types";

// Interface for profile state
export interface ProfileData {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
}

// Interface for useUser return value
export interface UseUserResult {
  // Supabase Auth User object
  user: User | null;
  // KorraStore Profile row data
  profile: ProfileData | null;
  // User role ('user' | 'admin')
  role: UserRole;
  // Is user an admin
  isAdmin: boolean;
  // Loading state
  isLoading: boolean;
  // Convenience boolean
  isAuthenticated: boolean;
  // Sign out method
  signOut: () => Promise<void>;
  // Manual refresh method
  refresh: () => Promise<void>;
}

// useUser React hook definition
export function useUser(): UseUserResult {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const supabase = React.useMemo(() => createClient(), []);

  // Fetch profile for a given user ID
  const fetchProfile = React.useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, role, full_name, phone")
          .eq("id", userId)
          .single();

        if (error) {
          console.warn("[useUser] Could not load profile:", error.message);
          setProfile(null);
        } else if (data) {
          setProfile({
            id: data.id,
            role: (data.role as UserRole) || "user",
            full_name: data.full_name,
            phone: data.phone,
          });
        }
      } catch (err) {
        console.error("[useUser] Exception fetching profile:", err);
        setProfile(null);
      }
    },
    [supabase]
  );

  // Refresh user and profile
  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
    } catch {
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchProfile]);

  // Sign out helper using client router
  const signOut = React.useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("[useUser] Sign out error:", err);
    }
  }, [supabase, router]);

  // Effect subscribing to auth state changes
  React.useEffect(() => {
    let isMounted = true;

    // Load initial user state asynchronously
    supabase.auth.getUser().then(async ({ data: { user: initialUser } }) => {
      if (!isMounted) return;
      setUser(initialUser);
      if (initialUser) {
        await fetchProfile(initialUser.id);
      }
      setIsLoading(false);
    });

    // Listen for auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const role = profile?.role || "user";

  return {
    user,
    profile,
    role,
    isAdmin: role === "admin",
    isLoading,
    isAuthenticated: !!user,
    signOut,
    refresh,
  };
}
