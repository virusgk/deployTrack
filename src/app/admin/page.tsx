import { getAllTickets, getApplications } from '@/app/actions';
import { AdminDashboard } from '@/app/components/AdminDashboard';

export default async function AdminPage() {
  const [tickets, applications] = await Promise.all([
    getAllTickets(),
    getApplications(),
  ]);

  return (
    <div className="w-full">
      <AdminDashboard allTickets={tickets} allApplications={applications} />
    </div>
  );
}
