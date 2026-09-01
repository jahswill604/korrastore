// lib/utils.ts — Utility functions for KorraStore.
// Provides classname merging helpers used across UI primitives and layout components.
// Used in: components/ui/*, components/layout/*, app/design-system/page.tsx

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn — Combines multiple class values and resolves conflicting Tailwind CSS classes.
 * Ensures consistent utility class application without specificity issues.
 *
 * @param inputs - List of class names, conditional objects, or arrays.
 * @return Merged class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
