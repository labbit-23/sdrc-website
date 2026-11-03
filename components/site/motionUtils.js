"use client";

import { useEffect, useRef, useState } from "react";

export function FadeIn({ children, delay = 0, className = "" }) {
  const [visible, setVisible] = useState(true);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function Counter({ to, decimals = 0, duration = 1300, suffix = "" }) {
  const val = to;
  return (
    <span>
      {decimals > 0 ? val.toFixed(decimals) : val.toLocaleString("en-IN")}{suffix}
    </span>
  );
}
