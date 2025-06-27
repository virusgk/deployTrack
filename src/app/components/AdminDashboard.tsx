
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
import { addApplication, checkStoragePath, deleteApplication, updateApplication } from '@/app/actions';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, CheckCircle, XCircle, HelpCircle, Pencil, Trash2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


interface AdminDashboardProps {
  allTickets: Ticket[];
  allApplications: Application[];
}

function SubmitButton({ text, isPathValid, Icon }: { text: string; isPathValid: boolean; Icon: React.ElementType }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending || !isPathValid} className="w-full">
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icon className="mr-2 h-4 w-4" />}
            {text}
        </Button>
    )
}

function EditApplicationDialog({ app, isOpen, onClose }: { app: Application; isOpen: boolean; onClose: () => void; }) {
  const [state, formAction] = useActionState(updateApplication, { message: '', errors: {} });
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [path, setPath] = useState(app.storage_path);
  const [pathStatus, setPathStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('valid');
  const [pathMessage, setPathMessage] = useState('');

  useEffect(() => {
    if (state?.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        toast({
          title: 'Failed to update application',
          description: state.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: state.message,
        });
        onClose();
      }
    }
  }, [state, toast, onClose]);

  const handleCheckPath = async () => {
    if (!path) {
      setPathStatus('invalid');
      setPathMessage('Storage path cannot be empty.');
      return;
    }
    setPathStatus('checking');
    setPathMessage('');
    const result = await checkStoragePath(path);
    if (result.success) {
      setPathStatus('valid');
    } else {
      setPathStatus('invalid');
    }
    setPathMessage(result.message);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Application</DialogTitle>
          <DialogDescription>
            Update the details for "{app.app_name}".
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4 pt-4">
          <input type="hidden" name="id" value={app.id} />
          <div className="space-y-2">
            <Label htmlFor="edit_app_name">Application Name</Label>
            <Input id="edit_app_name" name="app_name" defaultValue={app.app_name} required />
            {state?.errors?.app_name && <p className="text-sm font-medium text-destructive">{state.errors.app_name[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_storage_path">Storage Path</Label>
             <div className="flex items-center gap-2">
                <Input
                    id="edit_storage_path"
                    name="storage_path"
                    required
                    value={path}
                    onChange={(e) => {
                        setPath(e.target.value);
                        if (pathStatus !== 'idle') {
                          setPathStatus('idle');
                          setPathMessage('');
                        }
                    }}
                />
                <Button type="button" variant="outline" size="icon" onClick={handleCheckPath} disabled={pathStatus === 'checking' || !path}>
                    <span className="sr-only">Check Path Connectivity</span>
                    {pathStatus === 'checking' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {pathStatus === 'idle' ? <HelpCircle className="h-4 w-4 text-muted-foreground" /> : null}
                    {pathStatus === 'valid' ? <CheckCircle className="h-4 w-4 text-green-500" /> : null}
                    {pathStatus === 'invalid' ? <XCircle className="h-4 w-4 text-red-500" /> : null}
                </Button>
              </div>
              {pathMessage && (
                  <p className={`text-sm mt-2 ${pathStatus === 'valid' ? 'text-green-600' : 'text-destructive'}`}>
                      {pathMessage}
                  </p>
              )}
            {state?.errors?.storage_path && <p className="text-sm font-medium text-destructive">{state.errors.storage_path[0]}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <SubmitButton text="Save Changes" isPathValid={pathStatus === 'valid'} Icon={Pencil} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


function ApplicationConfig({ applications }: { applications: Application[] }) {
  const [addState, formAction] = useActionState(addApplication, { message: '', errors: {} });
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [path, setPath] = useState('');
  const [pathStatus, setPathStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [pathMessage, setPathMessage] = useState('');
  
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [appToDelete, setAppToDelete] = useState<Application | null>(null);

  const handleCheckPath = async () => {
    if (!path) {
        setPathStatus('invalid');
        setPathMessage('Storage path cannot be empty.');
        return;
    }
    setPathStatus('checking');
    setPathMessage('');
    const result = await checkStoragePath(path);
    if (result.success) {
        setPathStatus('valid');
    } else {
        setPathStatus('invalid');
    }
    setPathMessage(result.message);
  };

  useEffect(() => {
    if (addState?.message) {
      if (addState.errors && Object.keys(addState.errors).length > 0) {
         toast({
            title: 'Failed to add application',
            description: addState.message,
            variant: 'destructive',
        });
      } else {
        toast({
            title: 'Success',
            description: addState.message,
        });
        formRef.current?.reset();
        setPath('');
        setPathStatus('idle');
        setPathMessage('');
      }
    }
  }, [addState, toast]);
  
  const handleDelete = async () => {
    if (!appToDelete) return;

    const result = await deleteApplication(appToDelete.id);
    if (result.success) {
      toast({
        title: 'Application Deleted',
        description: result.message,
      });
    } else {
      toast({
        title: 'Deletion Failed',
        description: result.message,
        variant: 'destructive',
      });
    }
    setAppToDelete(null);
  };

  return (
    <>
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
                      {addState?.errors?.app_name && <p className="text-sm font-medium text-destructive">{addState.errors.app_name[0]}</p>}
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="storage_path">Storage Path</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                            id="storage_path" 
                            name="storage_path" 
                            placeholder="e.g., data/app-storage/portal" 
                            required
                            value={path}
                            onChange={(e) => {
                                setPath(e.target.value);
                                if (pathStatus !== 'idle') {
                                  setPathStatus('idle');
                                  setPathMessage('');
                                }
                            }}
                        />
                        <Button type="button" variant="outline" size="icon" onClick={handleCheckPath} disabled={pathStatus === 'checking' || !path}>
                            <span className="sr-only">Check Path Connectivity</span>
                            {pathStatus === 'checking' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {pathStatus === 'idle' ? <HelpCircle className="h-4 w-4 text-muted-foreground" /> : null}
                            {pathStatus === 'valid' ? <CheckCircle className="h-4 w-4 text-green-500" /> : null}
                            {pathStatus === 'invalid' ? <XCircle className="h-4 w-4 text-red-500" /> : null}
                        </Button>
                      </div>
                      {pathMessage && (
                        <p className={`text-sm mt-2 ${pathStatus === 'valid' ? 'text-green-600' : 'text-destructive'}`}>
                            {pathMessage}
                        </p>
                      )}
                      {addState?.errors?.storage_path && <p className="text-sm font-medium text-destructive">{addState.errors.storage_path[0]}</p>}
                  </div>
                  <SubmitButton text="Add Application" isPathValid={pathStatus === 'valid'} Icon={PlusCircle} />
              </form>
          </div>
          <div className="md:col-span-2">
              <h3 className="text-lg font-medium">Existing Applications</h3>
              <p className="text-sm text-muted-foreground">
                  Manage applications available for deployments.
              </p>
              <div className="border rounded-lg mt-4">
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Application Name</TableHead>
                              <TableHead>Storage Path</TableHead>
                              <TableHead className="text-right w-[100px]">Actions</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {applications.map(app => (
                              <TableRow key={app.id}>
                                  <TableCell className="font-medium">{app.app_name}</TableCell>
                                  <TableCell className="font-mono">{app.storage_path}</TableCell>
                                  <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => setEditingApp(app)}>
                                      <Pencil className="h-4 w-4" />
                                      <span className="sr-only">Edit {app.app_name}</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setAppToDelete(app)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                      <span className="sr-only">Delete {app.app_name}</span>
                                    </Button>
                                  </TableCell>
                              </TableRow>
                          ))}
                          {applications.length === 0 && (
                              <TableRow>
                                  <TableCell colSpan={3} className="h-24 text-center">
                                      No applications configured yet.
                                  </TableCell>
                              </TableRow>
                          )}
                      </TableBody>
                  </Table>
              </div>
          </div>
      </div>
      
      {editingApp && (
        <EditApplicationDialog 
          app={editingApp}
          isOpen={!!editingApp}
          onClose={() => setEditingApp(null)}
        />
      )}

      <AlertDialog open={!!appToDelete} onOpenChange={(open) => !open && setAppToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the application "{appToDelete?.app_name}" and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAppToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
