import { getApplications } from '@/app/actions';
import { TicketForm } from '@/app/components/TicketForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Rocket } from 'lucide-react';

export default async function SubmitTicketPage() {
  const applications = await getApplications();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Rocket className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline">Submit a New Deployment Ticket</CardTitle>
              <CardDescription>Fill out the form below to request a new deployment.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TicketForm applications={applications} />
        </CardContent>
      </Card>
    </div>
  );
}
