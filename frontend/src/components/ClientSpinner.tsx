"use client";

import { useState, useEffect } from "react";
import { Spinner, type SpinnerProps } from "@heroui/react";

/**
 * A hydration-safe wrapper around HeroUI Spinner.
 * HeroUI's Spinner generates unique SVG gradient IDs that cause
 * hydration mismatches between server and client. This component
 * only renders the Spinner after the client has mounted.
 */
export function ClientSpinner(props: SpinnerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className="inline-block animate-spin rounded-full border-2 border-current border-t-transparent opacity-60"
        style={{
          width: props.size === "sm" ? 16 : props.size === "lg" ? 32 : 24,
          height: props.size === "sm" ? 16 : props.size === "lg" ? 32 : 24,
        }}
        role="status"
        aria-label="Loading"
      />
    );
  }

  return <Spinner {...props} />;
}
