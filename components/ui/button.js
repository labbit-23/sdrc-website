import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  solid: "border-[var(--sdrc-teal)] bg-[var(--sdrc-teal)] text-white hover:border-[var(--sdrc-teal-600)] hover:bg-[var(--sdrc-teal-600)]",
  outline: "border-[var(--sdrc-teal)] bg-transparent text-[var(--sdrc-teal-deep)] hover:bg-[var(--sdrc-teal-soft)]",
  light: "border-white bg-white text-[var(--sdrc-teal-deep)] hover:bg-slate-100",
  outlineLight: "border-white bg-transparent text-white hover:bg-white hover:text-[var(--sdrc-teal-deep)]",
  bookTest: "border-transparent text-[#006f65] hover:text-[#00564d] [background:linear-gradient(#fff,#fff)_padding-box,linear-gradient(135deg,#008f82_0%,#f97316_100%)_border-box] hover:[background:linear-gradient(#fff7f2,#fff7f2)_padding-box,linear-gradient(135deg,#007a6f_0%,#ea580c_100%)_border-box]",
  ghost: "border-transparent bg-transparent text-[var(--sdrc-teal-deep)] hover:bg-[var(--sdrc-teal-soft)]",
};

const sizes = {
  xs: "min-h-7 px-2 text-xs",
  sm: "min-h-9 px-4 text-sm",
  md: "min-h-10 px-5 text-sm",
  lg: "min-h-12 px-6 text-base",
};

export function Button({
  as: Comp,
  href,
  className,
  variant = "solid",
  size = "md",
  children,
  leftIcon,
  rightIcon,
  ...props
}) {
  const Element = Comp || (href ? Link : "button");
  return (
    <Element
      href={href}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center gap-2 rounded-full border-2 font-semibold leading-none whitespace-nowrap transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,143,130,.25)] disabled:pointer-events-none disabled:opacity-60",
        sizes[size] || sizes.md,
        variants[variant] || variants.solid,
        className
      )}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </Element>
  );
}
