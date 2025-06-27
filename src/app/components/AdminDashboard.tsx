'use client';

import { useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TicketTable } from './TicketTable';
import type { Ticket, Application } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addApplication } from '@/app/actions';
import { useActionState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface AdminDashboardProps {
  allTickets: Ticket[];
  allApplications: Application[];
}

function AddAppButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Add Application
        </Button>
    )
}

function ApplicationConfig({ applications }: { applications: Application[] }) {
  const [state, formAction] = useActionState(addApplication, { message: '', errors: {} });
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
         toast({
            title: 'Failed to add application',
            description: state.message,
            variant: 'destructive',
        });
      } else {
        toast({
            title: 'Success',
            description: state.message,
        });
        formRef.current?.reset();
      }
    }
  }, [state, toast]);
  

  return (
    <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
            <h3 className="text-lg font-medium">Add New Application</h3>
            <p className="text-sm text-muted-foreground">
                Define a new application that can be selected during ticket submission.
            </p>
            <form ref={formRef} action={formAction} className="space-y-4 mt-4">
                <div className="space-y-2">
                    <Label htmlFor="app_name">Application Name</Label>
                    <Input id="app_name" name="app_name" placeholder="e.g., Frontend Portal" required/>
                    {state?.errors?.app_name && <p className="text-sm font-medium text-destructive">{state.errors.app_name}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="storage_path">Storage Path</Label>
                    <Input id="storage_path" name="storage_path" placeholder="e.g., apps/frontend-portal" required/>
                    {state?.errors?.storage_path && <p className="text-sm font-medium text-destructive">{state.errors.storage_path}</p>}
                </div>
                <AddAppButton />
            </form>
        </div>
        <div className="md:col-span-2">
             <h3 className="text-lg font-medium">Existing Applications</h3>
             <div className="border rounded-lg mt-4">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Application Name</TableHead>
                            <TableHead>Storage Path</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {applications.map(app => (
                             <TableRow key={app.id}>
                                <TableCell className="font-medium">{app.app_name}</TableCell>
                                <TableCell className="font-mono">{app.storage_path}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
             </div>
        </div>
    </div>
  )
}

export function AdminDashboard({
  allTickets,
  allApplications,
}: AdminDashboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Admin Dashboard</CardTitle>
        <CardDescription>
          Manage deployment tickets and configure applications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tickets">Manage Tickets</TabsTrigger>
            <TabsTrigger value="applications">Configure Applications</TabsTrigger>
          </TabsList>
          <TabsContent value="tickets" className="mt-6">
            <TicketTable tickets={allTickets} isAdmin />
          </TabsContent>
          <TabsContent value="applications" className="mt-6">
            <ApplicationConfig applications={allApplications} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
