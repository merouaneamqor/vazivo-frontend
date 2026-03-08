import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List your business | Vazivo for Business",
  description: "Join Vazivo and reach more diners. List your restaurant. Get more reservations and grow your business.",
};

export default function ProviderRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
