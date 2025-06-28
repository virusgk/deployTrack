import { getTicketsByIp } from '@/app/actions';
import { TicketTable } from '@/app/components/TicketTable';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/app/components/PageHeader';

export default async function UserDashboardPage() {
  const tickets = await getTicketsByIp();

  return (
    <>
      <PageHeader 
        title="My Deployment Tickets"
        description="Here are the tickets submitted from your current IP address."
      />
      <Card>
        <CardContent className="pt-6">
          <TicketTable tickets={tickets} />
        </CardContent>
      </Card>
    </>
  );
}
