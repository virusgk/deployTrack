import { getTicketsByIp } from '@/app/actions';
import { TicketTable } from '@/app/components/TicketTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default async function UserDashboardPage() {
  const tickets = await getTicketsByIp();

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline">My Deployment Tickets</CardTitle>
              <CardDescription>Here are the tickets submitted from your current IP address.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TicketTable tickets={tickets} />
        </CardContent>
      </Card>
    </div>
  );
}
