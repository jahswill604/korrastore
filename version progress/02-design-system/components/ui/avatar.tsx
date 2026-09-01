// components/ui/avatar.tsx — User Profile Avatar component for KorraStore.
// Renders user profile initials or image with warm soil border and harvest wheat fallback background.
// Used in: top navigation bar, profile settings, buyer/admin header.

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Interface for Avatar component props.
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallbackText?: string;
  size?: "sm" | "md" | "lg";
}

// Avatar component definition.
export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = "User avatar", fallbackText = "KS", size = "md", ...props }, ref) => {
    const [hasError, setHasError] = React.useState(!src);

    const sizes = {
      sm: "w-8 h-8 text-xs",
      md: "w-10 h-10 text-sm",
      lg: "w-12 h-12 text-base",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full overflow-hidden border border-[var(--border-color)] bg-[var(--harvest-wheat)] text-[var(--soil)] font-bold font-mono-plex select-none shadow-soil-sm shrink-0",
          sizes[size],
          className
        )}
        {...props}
      >
        {src && !hasError ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <span>{fallbackText.toUpperCase().slice(0, 2)}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
