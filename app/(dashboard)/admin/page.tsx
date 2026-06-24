import DashboardClient from '@/components/design/DashboardClient';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <DashboardClient isAdmin={true} />
    </div>
  );
}
