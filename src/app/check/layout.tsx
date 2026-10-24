import { CheckProvider } from "@/lib/check-state";

export default function CheckLayout({ children }: LayoutProps<"/check">) {
  return <CheckProvider>{children}</CheckProvider>;
}
