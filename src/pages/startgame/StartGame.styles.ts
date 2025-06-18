import { cn } from "@/lib/utils"; // this is included with ShadCN setup

// Base container style
export const startGameContainer = cn(
  "flex items-center justify-center min-h-screen bg-[#0f172a]"
);

// Heading style
export const headingStyle = cn(
  "text-4xl md:text-5xl font-bold text-white flex items-center justify-center gap-2"
);

// Button style — Tailwind + ShadCN override
export const startButtonStyle = cn(
  "bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
);
