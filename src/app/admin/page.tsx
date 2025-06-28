import { getAllTickets, getApplications } from '@/app/actions';
import { AdminDashboard } from '@/app/components/AdminDashboard';
import { PageHeader } from '@/app/components/PageHeader';

export default async function AdminPage() {
  const [tickets, applications] = await Promise.all([
    getAllTickets(),
    getApplications(),
  ]);

  return (
    <>
        <PageHeader 
            title="Admin Dashboard"
            description="Manage deployment tickets, configure applications, and view analytics."
        />
        <AdminDashboard allTickets={tickets} allApplications={applications} />
    </>
  );
}
