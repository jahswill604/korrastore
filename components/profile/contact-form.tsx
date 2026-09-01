// components/profile/contact-form.tsx — Contact Details & Verification Management for KorraStore.
// Displays verified email address and phone number, with modal prompts for triggering
// Supabase Auth verified email/phone confirmation flows.
// Used in: app/profile/page.tsx.

"use client";

import * as React from "react";
import { Button } from "@/lib/../components/ui/button";
import { Badge } from "@/lib/../components/ui/badge";
import { Modal } from "@/lib/../components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------

export interface ContactFormProps {
  initialEmail: string;
  initialPhone: string | null;
}

// ----------------------------------------------------------------------------
// ContactForm Component Definition
// ----------------------------------------------------------------------------
export const ContactForm: React.FC<ContactFormProps> = ({
  initialEmail,
  initialPhone,
}) => {
  const [email, setEmail] = React.useState(initialEmail);
  const [phone, setPhone] = React.useState(initialPhone || "");
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = React.useState(false);

  const [newEmail, setNewEmail] = React.useState("");
  const [newPhone, setNewPhone] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);

  const [alert, setAlert] = React.useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Auto-dismiss alert after 6 seconds
  React.useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // --------------------------------------------------------------------------
  // Handle Email Update through Supabase Auth
  // --------------------------------------------------------------------------
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || newEmail === email) {
      setAlert({ text: "Please enter a new valid email address.", type: "error" });
      return;
    }

    setIsUpdating(true);
    setAlert(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        email: newEmail.trim(),
      });

      if (error) {
        throw error;
      }

      setIsEmailModalOpen(false);
      setNewEmail("");
      setAlert({
        text: `A confirmation link has been sent to ${newEmail.trim()}. Please verify to complete the change.`,
        type: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initiate email change";
      setAlert({ text: msg, type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  // --------------------------------------------------------------------------
  // Handle Phone Update through Supabase Auth
  // --------------------------------------------------------------------------
  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone.trim()) {
      setAlert({ text: "Please enter a valid phone number.", type: "error" });
      return;
    }

    setIsUpdating(true);
    setAlert(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        phone: newPhone.trim(),
      });

      if (error) {
        throw error;
      }

      setIsPhoneModalOpen(false);
      setPhone(newPhone.trim());
      setNewPhone("");
      setAlert({
        text: "Phone number updated successfully.",
        type: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update phone number";
      setAlert({ text: msg, type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E4DCC8] p-6 sm:p-8 space-y-6 shadow-2xs">
      {/* Alert Notification Feedback */}
      {alert && (
        <div
          className={cn(
            "p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-200 animate-in fade-in-50",
            alert.type === "success" && "bg-[#21483A]/10 text-[#21483A] border border-[#21483A]/20",
            alert.type === "error" && "bg-[#B3432E]/10 text-[#B3432E] border border-[#B3432E]/20",
            alert.type === "info" && "bg-[#303B63]/10 text-[#303B63] border border-[#303B63]/20"
          )}
        >
          <span>{alert.text}</span>
          <button
            type="button"
            onClick={() => setAlert(null)}
            className="text-xs font-bold px-1 hover:opacity-75 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Block */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold font-serif-display text-[#4A3828]">
          Contact & Authentication Details
        </h2>
        <p className="text-xs sm:text-sm text-[#A88958] mt-0.5">
          Your verified credentials used for order receipts, buyback notifications, and account recovery.
        </p>
      </div>

      <div className="h-px bg-[#E4DCC8]" />

      {/* Contact Credentials List */}
      <div className="space-y-4">
        {/* Email Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#F7F4EA] border border-[#E4DCC8] gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#4A3828] uppercase tracking-wide">
                Email Address
              </span>
              <Badge variant="stored" className="text-[10px] py-0 px-1.5">
                Verified
              </Badge>
            </div>
            <p className="text-sm font-semibold text-[#4A3828] font-mono-plex">
              {email || "Not configured"}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEmailModalOpen(true)}
            className="self-start sm:self-center font-semibold bg-white"
          >
            Change Email
          </Button>
        </div>

        {/* Phone Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#F7F4EA] border border-[#E4DCC8] gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#4A3828] uppercase tracking-wide">
                Phone Number
              </span>
              {phone ? (
                <Badge variant="stored" className="text-[10px] py-0 px-1.5">
                  Verified
                </Badge>
              ) : (
                <Badge variant="pending" className="text-[10px] py-0 px-1.5">
                  Optional
                </Badge>
              )}
            </div>
            <p className="text-sm font-semibold text-[#4A3828] font-mono-plex">
              {phone || "No phone number added"}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPhoneModalOpen(true)}
            className="self-start sm:self-center font-semibold bg-white"
          >
            {phone ? "Change Phone" : "Add Phone"}
          </Button>
        </div>
      </div>

      {/* Informational Security Notice */}
      <div className="p-4 rounded-xl bg-[#EDE8DA]/60 border border-[#E4DCC8] text-xs text-[#4A3828]/80 flex items-start space-x-3">
        <svg className="w-5 h-5 text-[#A88958] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <strong className="text-[#4A3828]">Security Confirmation Policy:</strong> Modifying your email address triggers a confirmation email to both your old and new inbox. Changes only take effect once confirmed.
        </div>
      </div>

      {/* Change Email Modal */}
      <Modal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        title="Update Email Address"
        description="Enter your new email address below. A verification email will be dispatched to confirm."
      >
        <form onSubmit={handleUpdateEmail} className="space-y-4 pt-2">
          <div>
            <label htmlFor="newEmail" className="block text-xs font-bold text-[#4A3828] uppercase mb-1">
              New Email Address
            </label>
            <input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g. joshua.new@example.com"
              required
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F7F4EA] border border-[#E4DCC8] text-[#4A3828] focus:outline-none focus:ring-2 focus:ring-[#D8B56A]"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEmailModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUpdating}
            >
              Send Confirmation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Phone Modal */}
      <Modal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        title="Update Phone Number"
        description="Enter your active mobile phone number with country code."
      >
        <form onSubmit={handleUpdatePhone} className="space-y-4 pt-2">
          <div>
            <label htmlFor="newPhone" className="block text-xs font-bold text-[#4A3828] uppercase mb-1">
              Phone Number
            </label>
            <input
              id="newPhone"
              type="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="e.g. +234 801 234 5678"
              required
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F7F4EA] border border-[#E4DCC8] text-[#4A3828] focus:outline-none focus:ring-2 focus:ring-[#D8B56A]"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPhoneModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUpdating}
            >
              Save Phone
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
