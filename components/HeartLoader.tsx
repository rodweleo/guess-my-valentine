"use client";

import { Heart } from "lucide-react";

export function HeartLoader({
  message = "Loading love...",
}: {
  message?: string;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center romantic-gradient">
      <div className="relative">
        {/* Glow */}
        <div className="absolute inset-0 rounded-full blur-2xl bg-pink-400/40 animate-pulse" />

        {/* Heart */}
        <div className="relative w-24 h-24 rounded-full love-gradient flex items-center justify-center animate-heartbeat">
          <Heart
            className="w-12 h-12 text-primary-foreground"
            fill="currentColor"
          />
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground animate-fade-in">
        {message}
      </p>
    </div>
  );
}
