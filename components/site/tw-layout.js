import { cn } from "@/lib/utils";

export function TwContainer({ className, children, size = "default", ...props }) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4",
        size === "narrow" ? "max-w-[1100px]" : "max-w-[1200px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Chip({ className, tone = "teal", children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[.07em]",
        tone === "orange" ? "bg-[#fff5f0] text-[#d44d1a]" : "bg-[var(--sdrc-teal-soft)] text-[var(--sdrc-teal-deep)]",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
