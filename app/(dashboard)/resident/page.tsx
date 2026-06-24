import DashboardClient from '@/components/design/DashboardClient';

export default function ResidentPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <DashboardClient isAdmin={false} />
    </div>
  );
}
