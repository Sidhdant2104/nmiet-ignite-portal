import { AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import { useIntroAnimation } from "@/hooks/use-intro-animation";
import { IntroAnimation } from "./IntroAnimation";

/** Wraps RouterProvider itself, outside the route match tree. */
export function AppShell({ children }: { children: ReactNode }) {
  const intro = useIntroAnimation();

  return (
    <>
      {children}
      <AnimatePresence>
        {intro.shouldPlay ? <IntroAnimation onComplete={intro.complete} /> : null}
      </AnimatePresence>
    </>
  );
}
