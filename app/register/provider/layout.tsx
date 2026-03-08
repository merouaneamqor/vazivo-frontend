import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List your business | OllaZen for Business",
  description: "Join OllaZen and reach more customers. List your salon, spa, or wellness business. Get more bookings and grow your client base.",
};

export default function ProviderRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
