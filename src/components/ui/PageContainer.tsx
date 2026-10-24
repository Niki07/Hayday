import type { HTMLAttributes } from "react";

export default function PageContainer({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={`mx-auto w-full max-w-[640px] px-4 ${className}`} />;
}
