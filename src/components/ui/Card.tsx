import type { HTMLAttributes } from "react";

export default function Card({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}
    />
  );
}
