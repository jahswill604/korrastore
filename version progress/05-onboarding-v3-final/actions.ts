// app/onboarding/actions.ts — Server Actions for the KorraStore Onboarding Flow.
// Provides the completeOnboarding server action, called by the StepCarousel client
// component when the user finishes all three steps or clicks Skip.
// Security: runs under the authenticated Supabase session (anon key + RLS);
// the profile update is scoped to auth.uid() by the RLS policy.
// Used in: components/onboarding/step-carousel.tsx (via useTransition).

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// completeOnboarding — marks the current user's onboarding as completed,
// then performs a server-side redirect to /home.
//
// Using server-side redirect() is the correct Next.js pattern: the redirect
// happens AFTER the DB write is confirmed, so the middleware will always read
// onboarding_completed = true on the next request to /home — no race condition.
//
// Returns { error: string } if the DB write fails (caller can surface this);
// otherwise throws the redirect (which React's transition handles as navigation).
// ---------------------------------------------------------------------------
export async function completeOnboarding(): Promise<{ error: string } | never> {
  const supabase = await createClient();

  // Re-verify the user session server-side before any write.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // No session — redirect to login instead of silently failing.
    redirect("/login");
  }

  // Update the onboarding flag for the authenticated user.
  // RLS policy "Users can update own profile" (auth.uid() = id) enforces scoping.
  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", user.id);

  if (error) {
    // Return a structured error so the client can show a retry message.
    console.error("[completeOnboarding] DB update failed:", error.message);
    return { error: error.message };
  }

  // Revalidate both paths so Next.js cache reflects the completed state.
  revalidatePath("/onboarding");
  revalidatePath("/home");

  // Server-side redirect — fires only AFTER the DB write is confirmed.
  // This prevents the race condition where the middleware reads stale profile data.
  redirect("/home");
}
