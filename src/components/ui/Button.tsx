import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "lg" | "md";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover",
  secondary: "border-2 border-accent bg-white text-accent hover:bg-accent-soft",
  ghost: "text-accent hover:bg-accent-soft",
};

const sizes: Record<Size, string> = {
  lg: "min-h-[52px] px-6 text-lg",
  md: "min-h-11 px-4 text-base",
};

function classes(variant: Variant, size: Size, className = "") {
  return `inline-flex items-center justify-center rounded-xl font-semibold transition-colors ${variants[variant]} ${sizes[size]} ${className}`;
}

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonProps = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type LinkProps = Common & { href: string; target?: string; rel?: string };

export default function Button(props: ButtonProps | LinkProps) {
  const { variant = "primary", size = "lg", className, children } = props;

  if (props.href !== undefined) {
    const { href, target, rel } = props;
    const cls = classes(variant, size, className);
    // External links open a new tab; internal ones use next/link.
    if (/^https?:/.test(href)) {
      return (
        <a href={href} target={target ?? "_blank"} rel={rel ?? "noopener noreferrer"} className={cls}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
  void _v; void _s; void _c; void _ch;
  return (
    <button type="button" {...rest} className={classes(variant, size, className)}>
      {children}
    </button>
  );
}
