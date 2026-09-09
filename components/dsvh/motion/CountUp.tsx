"use client";

import { useEffect, useRef, useState } from "react";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Animates an integer from 0 → `end` (ease-out) the first time it's in view. */
export function CountUp({
  end,
  duration = 900,
  className = "",
}: {
  end: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setValue(end));
      return () => cancelAnimationFrame(id);
    }

    let raf = 0;
    let started = false;
    const run = (ts: number, start: number) => {
      const p = Math.min((ts - start) / duration, 1);
      setValue(Math.round(easeOut(p) * end));
      if (p < 1) raf = requestAnimationFrame((t) => run(t, start));
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          raf = requestAnimationFrame((t) => run(t, t));
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [end, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
