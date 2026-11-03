import { cn } from "@/lib/utils";

export function Card({ className, accent = null, interactive = true, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-[18px] border border-slate-200/80 bg-white shadow-[0_12px_32px_rgba(15,23,42,.08)]",
        interactive && "transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,.12)]",
        accent === "teal" && "border-t-[3px] border-t-[var(--sdrc-teal)]",
        accent === "orange" && "border-t-[3px] border-t-[var(--sdrc-orange)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
