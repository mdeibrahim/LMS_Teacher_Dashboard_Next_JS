import DashboardShell from "@/components/dashboard/DashboardShell";

export default function ManageContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
