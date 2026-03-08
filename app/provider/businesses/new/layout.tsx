// Force dynamic rendering so dependencies that use `location` never run in Node during static generation.
export const dynamic = "force-dynamic";

export default function NewBusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
