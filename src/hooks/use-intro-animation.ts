import { useCallback, useState } from "react";

let hasPlayedThisSession = false;

export function useIntroAnimation() {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [shouldPlay, setShouldPlay] = useState(
    !hasPlayedThisSession && !reduced
  );

  const complete = useCallback(() => {
    hasPlayedThisSession = true;
    setShouldPlay(false);
  }, []);

  return { shouldPlay, complete };
}