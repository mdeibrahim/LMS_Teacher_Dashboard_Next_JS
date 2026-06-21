import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatsCards from "@/components/dashboard/StatsCards";
import CourseGrid from "@/components/dashboard/CourseGrid";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <WelcomeBanner />

      <StatsCards />

      <CourseGrid />
    </div>
  );
}