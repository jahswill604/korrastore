// components/profile/account-section.tsx — Security, Logout & Account Deletion for KorraStore.
// Provides password updates, active session logout, and guarded destructive account deletion.
// Enforces two-step typed confirmation ("DELETE") and surfaces server-side financial invariant blocks.
// Used in: app/profile/page.tsx.

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/lib/../components/ui/button";
import { Modal } from "@/lib/../components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------

export interface AccountSectionProps {
  userId: string;
  email: string;
}

// ----------------------------------------------------------------------------
// AccountSection Component Definition
// ----------------------------------------------------------------------------
export const AccountSection: React.FC<AccountSectionProps> = ({
  email,
}) => {
  const router = useRouter();

  // State management
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);

  const [deleteConfirmationInput, setDeleteConfirmationInput] = React.useState("");
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false);
  const [deletionErrors, setDeletionErrors] = React.useState<string[] | null>(null);

  const [toast, setToast] = React.useState<{ text: string; type: "success" | "error" } | null>(null);

  // Auto-dismiss toast after 5s
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --------------------------------------------------------------------------
  // Password Update via Supabase Auth
  // --------------------------------------------------------------------------
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setToast({ text: "Password must be at least 6 characters long.", type: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ text: "Passwords do not match.", type: "error" });
      return;
    }

    setIsUpdatingPassword(true);
    setToast(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      setIsPasswordModalOpen(false);
      setNewPassword("");
      setConfirmPassword("");
      setToast({ text: "Password updated successfully!", type: "success" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password";
      setToast({ text: msg, type: "error" });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // --------------------------------------------------------------------------
  // Active Session Logout Handler
  // --------------------------------------------------------------------------
  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("[AccountSection] Logout error:", err);
      // Fallback form post
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "/api/auth/logout";
      document.body.appendChild(form);
      form.submit();
    }
  };

  // --------------------------------------------------------------------------
  // Guarded Account Deletion Handler
  // --------------------------------------------------------------------------
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmationInput !== "DELETE") {
      setDeletionErrors(['Please type "DELETE" exactly to confirm.']);
      return;
    }

    setIsDeletingAccount(true);
    setDeletionErrors(null);

    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.reasons && Array.isArray(data.reasons)) {
          setDeletionErrors(data.reasons);
        } else {
          setDeletionErrors([data.error || "Failed to delete account."]);
        }
        return;
      }

      // Success — redirect to login
      router.push("/login?message=account_deleted");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected server error during account deletion.";
      setDeletionErrors([msg]);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert Feedback */}
      {toast && (
        <div
          className={cn(
            "p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-200 animate-in fade-in-50",
            toast.type === "success"
              ? "bg-[#21483A]/10 text-[#21483A] border border-[#21483A]/20"
              : "bg-[#B3432E]/10 text-[#B3432E] border border-[#B3432E]/20"
          )}
        >
          <span>{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-xs font-bold px-1 hover:opacity-75 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Security & Authentication Card */}
      <div className="bg-white rounded-2xl border border-[#E4DCC8] p-6 sm:p-8 space-y-6 shadow-2xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-serif-display text-[#4A3828]">
            Security & Authentication
          </h2>
          <p className="text-xs sm:text-sm text-[#A88958] mt-0.5">
            Manage your login credentials, active sessions, and password security.
          </p>
        </div>

        <div className="h-px bg-[#E4DCC8]" />

        <div className="space-y-4">
          {/* Password Reset Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#F7F4EA] border border-[#E4DCC8] gap-3">
            <div>
              <div className="text-xs font-bold text-[#4A3828] uppercase tracking-wide">
                Account Password
              </div>
              <p className="text-xs text-[#A88958] mt-0.5">
                Ensure a strong password of at least 6 characters with mixed symbols.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPasswordModalOpen(true)}
              className="self-start sm:self-center font-semibold bg-white"
            >
              Update Password
            </Button>
          </div>

          {/* Session Logout Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#F7F4EA] border border-[#E4DCC8] gap-3">
            <div>
              <div className="text-xs font-bold text-[#4A3828] uppercase tracking-wide">
                Active Session
              </div>
              <p className="text-xs text-[#A88958] mt-0.5">
                Sign out of your active KorraStore session on this browser device.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="self-start sm:self-center font-semibold bg-white text-[#4A3828] hover:bg-[#EDE8DA]"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="bg-[#FDFAF8] rounded-2xl border border-[#B3432E]/30 p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#B3432E]/10 text-[#B3432E] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold font-serif-display text-[#B3432E]">
              Danger Zone: Account Deletion
            </h3>
            <p className="text-xs text-[#4A3828]/80 mt-1 leading-relaxed">
              Permanently delete your KorraStore account, active session tokens, and identity records.
              This action is strictly non-reversible.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#B3432E]/5 border border-[#B3432E]/20 text-xs text-[#4A3828] space-y-2">
          <strong className="text-[#B3432E]">Financial Integrity Invariants:</strong>
          <p className="text-xs text-[#4A3828]/80">
            KorraStore protects physical warehouse stock and trading ledgers. You cannot delete an account if you have:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-[#4A3828]/80 font-medium pl-1">
            <li>Active stored commodity holdings in Korra silos (&gt; 0 kg)</li>
            <li>In-progress orders pending fulfillment or in transit</li>
            <li>Active peer-to-peer resale listings on the marketplace</li>
            <li>Pending or approved buyback requests awaiting settlement</li>
          </ul>
        </div>

        <div>
          <Button
            type="button"
            variant="destructive"
            size="md"
            onClick={() => {
              setDeletionErrors(null);
              setDeleteConfirmationInput("");
              setIsDeleteModalOpen(true);
            }}
            className="font-semibold shadow-xs"
          >
            Delete Account
          </Button>
        </div>
      </div>

      {/* Password Update Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Update Account Password"
        description="Enter your new desired password below."
      >
        <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2">
          <div>
            <label htmlFor="newPassword" className="block text-xs font-bold text-[#4A3828] uppercase mb-1">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              minLength={6}
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F7F4EA] border border-[#E4DCC8] text-[#4A3828] focus:outline-none focus:ring-2 focus:ring-[#D8B56A]"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-bold text-[#4A3828] uppercase mb-1">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
              minLength={6}
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F7F4EA] border border-[#E4DCC8] text-[#4A3828] focus:outline-none focus:ring-2 focus:ring-[#D8B56A]"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPasswordModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUpdatingPassword}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Two-Step Guarded Account Deletion Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Account Deletion"
        description="This action will permanently delete your account and revoke all access."
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4 pt-2">
          {/* Deletion Blocking Reason Banner */}
          {deletionErrors && deletionErrors.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#B3432E]/10 border border-[#B3432E]/30 text-xs text-[#B3432E] space-y-1.5 animate-in fade-in-50">
              <strong className="block font-bold">Deletion Blocked:</strong>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {deletionErrors.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
              <p className="text-[11px] text-[#4A3828] pt-1">
                Please liquidate, resell, or request delivery of your stored commodities before closing your account.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs text-[#4A3828]">
              To confirm that you want to delete your account <strong>({email})</strong>, please type{" "}
              <span className="font-mono-plex font-bold text-[#B3432E] bg-[#B3432E]/10 px-1.5 py-0.5 rounded">
                DELETE
              </span>{" "}
              in the input field below:
            </p>

            <input
              type="text"
              value={deleteConfirmationInput}
              onChange={(e) => setDeleteConfirmationInput(e.target.value)}
              placeholder='Type "DELETE"'
              required
              className="w-full px-3.5 py-2 text-sm font-mono-plex rounded-xl bg-[#F7F4EA] border border-[#E4DCC8] text-[#4A3828] focus:outline-none focus:ring-2 focus:ring-[#B3432E]"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={deleteConfirmationInput !== "DELETE"}
              isLoading={isDeletingAccount}
            >
              Permanently Delete
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
