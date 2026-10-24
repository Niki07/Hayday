import type { Metadata } from "next";

// Hidden page (handoff 09): not linked from anywhere and kept out of search engines.
export const metadata: Metadata = {
  title: "Supervisor view · Hayday",
  robots: { index: true, follow: true },
};

export default function OrganizerLayout({ children }: LayoutProps<"/organizer">) {
  return children;
}
