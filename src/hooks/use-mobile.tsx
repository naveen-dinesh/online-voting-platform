
"use client"; // Ensure this hook is client-side

import * as React from "react"

const MOBILE_BREAKPOINT = 768 // Standard md breakpoint in Tailwind

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(false); // Default to false or undefined

  React.useEffect(() => {
    // Ensure window is defined (client-side)
    if (typeof window === "undefined") {
      return;
    }

    const checkDevice = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Initial check
    checkDevice();

    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return isMobile;
}
