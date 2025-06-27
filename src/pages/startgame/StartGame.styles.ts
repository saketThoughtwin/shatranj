import { cn } from "@/lib/utils";

export const startGameContainer = cn(
  "relative w-full h-screen overflow-hidden"
);

export const videoStyle = cn(
  "absolute inset-0 w-full h-full object-cover"
);

export const overlayStyle = cn(
  "absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center"
);

export const headingStyle = cn(
  "text-2xl sm:text-3xl md:text-5xl font-bold text-white drop-shadow-md text-center px-4"
);

export const iconButtonStyle = cn(
  "rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-yellow-400 hover:bg-yellow-500 text-black flex items-center justify-center shadow-lg transition transform hover:scale-105"
);

