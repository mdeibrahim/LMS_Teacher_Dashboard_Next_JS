import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 min-h-screen flex">
      <Sidebar />

      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  );
}