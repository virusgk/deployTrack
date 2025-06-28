import { getApplications } from '@/app/actions';
import { TicketForm } from '@/app/components/TicketForm';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/app/components/PageHeader';

export default async function SubmitTicketPage() {
  const applications = await getApplications();

  return (
    <div className="w-full max-w-3xl mx-auto">
       <PageHeader 
        title="Submit a New Deployment Ticket"
        description="Fill out the form below to request a new deployment."
      />
      <Card>
        <CardContent className="pt-6">
          <TicketForm applications={applications} />
        </CardContent>
      </Card>
    </div>
  );
}
