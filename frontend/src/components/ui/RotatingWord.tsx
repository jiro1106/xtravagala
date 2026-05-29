import { useEffect, useState } from "react";

interface RotatingWordProps {
  /** Words to cycle through, e.g. ["night.", "weekend."]. */
  words: string[];
  /** Static label announced to screen readers (avoids per-cycle flicker). */
  ariaLabel: string;
  /** Cycle interval in milliseconds. */
  intervalMs?: number;
}

/**
 * Teal pill that cycles `words` with a staggered per-character roll-up.
 * Pauses cycling under prefers-reduced-motion (shows the first word), and
 * reacts if that preference changes while the page is open.
 */
export function RotatingWord({
  words,
  ariaLabel,
  intervalMs = 2200,
}: RotatingWordProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let id: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      if (media.matches) {
        setIndex(0);
        return;
      }
      id = setInterval(() => {
        setIndex((i) => (i + 1) % words.length);
      }, intervalMs);
    };

    const handleChange = () => {
      if (id) clearInterval(id);
      start();
    };

    start();
    media.addEventListener("change", handleChange);

    return () => {
      if (id) clearInterval(id);
      media.removeEventListener("change", handleChange);
    };
  }, [words, intervalMs]);

  const word = words[index] ?? "";

  return (
    <>
      <span className="sr-only">{ariaLabel}</span>
      <span className="rotating-word" aria-hidden="true">
        {Array.from(word).map((char, i) => (
          <span
            key={`${index}-${i}`}
            className="rotating-word__char"
            style={{ animationDelay: `${i * 0.028}s` }}
          >
            {char === " " ? " " : char}
          </span>
        ))}
      </span>
    </>
  );
}
