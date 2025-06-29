
'use client';

import { useFormStatus } from 'react-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Application } from '@/lib/types';
import { submitTicket } from '@/app/actions';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, UploadCloud, FileText, X } from 'lucide-react';

const ticketSchema = z.object({
  application: z.string().min(1, 'Application is required'),
  environment: z.enum(['QA', 'Prod'], { required_error: 'Environment is required' }),
  change_type: z.enum(["Hotfix", "Feature Release", "Bug Fix", "Configuration", "Other"], { required_error: 'Change type is required' }),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  files: z
    .array(
      z.instanceof(File).refine(
        (file) => {
          const allowedTypes = ['application/zip', 'application/x-zip-compressed'];
          return allowedTypes.includes(file.type);
        },
        'Only .zip files are allowed.'
      )
    )
    .optional(),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

interface TicketFormProps {
  applications: Application[];
}

function SubmitButton({ isValid }: { isValid: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || !isValid} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
      Submit Ticket
    </Button>
  );
}

export function TicketForm({ applications }: TicketFormProps) {
  const [state, formAction] = useActionState(submitTicket, { message: '', errors: {} });
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    mode: 'onChange',
    defaultValues: {
      application: '',
      environment: undefined,
      change_type: undefined,
      description: '',
      files: [],
      ...state.values,
    },
  });

  const { formState: { isValid } } = form;
  const stagedFiles = form.watch('files') || [];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files ? Array.from(event.target.files) : [];
    if (newFiles.length === 0) return;

    const currentFiles = form.getValues('files') || [];
    const combinedFiles = [...currentFiles];

    newFiles.forEach(newFile => {
        if (!currentFiles.some(currentFile => currentFile.name === newFile.name && currentFile.size === newFile.size)) {
            combinedFiles.push(newFile);
        }
    });
    form.setValue('files', combinedFiles, { shouldValidate: true });
  };

  const removeFile = (indexToRemove: number) => {
    const currentFiles = form.getValues('files') || [];
    const updatedFiles = currentFiles.filter((_, index) => index !== indexToRemove);
    form.setValue('files', updatedFiles, { shouldValidate: true });

    // Clear the file input so the same file can be re-added if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };


  useEffect(() => {
    if (state.message && state.errors && Object.keys(state.errors).length > 0) {
      toast({
        title: 'Submission Failed',
        description: state.message,
        variant: 'destructive',
      });
      // Populate form errors from server
      if (state.errors.files) {
        form.setError('files', { type: 'server', message: state.errors.files[0] });
      }
    }
  }, [state, toast, form]);
  
  return (
    <Form {...form}>
        <form action={formAction} className="space-y-6">
            <FormField
            control={form.control}
            name="application"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Application</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select an application" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {applications.map((app) => (
                        <SelectItem key={app.id} value={app.app_name}>
                        {app.app_name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <input type="hidden" {...field} />
                <FormMessage>{state.errors?.application?.[0]}</FormMessage>
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="environment"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Environment</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select an environment" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="QA">QA</SelectItem>
                    <SelectItem value="Prod">Production</SelectItem>
                    </SelectContent>
                </Select>
                 <input type="hidden" {...field} />
                <FormMessage>{state.errors?.environment?.[0]}</FormMessage>
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="change_type"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Change Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select the type of change" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="Hotfix">Hotfix</SelectItem>
                    <SelectItem value="Feature Release">Feature Release</SelectItem>
                    <SelectItem value="Bug Fix">Bug Fix</SelectItem>
                    <SelectItem value="Configuration">Configuration</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
                <input type="hidden" {...field} />
                <FormMessage>{state.errors?.change_type?.[0]}</FormMessage>
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                    <Textarea
                    placeholder="Describe the deployment, including features, bug fixes, etc."
                    rows={5}
                    {...field}
                    />
                </FormControl>
                <FormMessage>{state.errors?.description?.[0]}</FormMessage>
                </FormItem>
            )}
            />
        
            <FormField
                control={form.control}
                name="files"
                render={() => (
                    <FormItem>
                        <FormLabel>Build Files / DB Scripts (.zip only)</FormLabel>
                        <FormControl>
                             <div 
                                className="relative block w-full rounded-lg border-2 border-dashed border-input p-12 text-center hover:border-primary focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-pointer transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                                onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()}}
                                role="button"
                                tabIndex={0}
                            >
                                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                                <span className="mt-2 block text-sm font-semibold text-foreground">Click to upload files</span>
                                <span className="mt-1 block text-xs text-muted-foreground">Multiple ZIP files allowed</span>
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    name="files"
                                    accept=".zip,application/zip,application/x-zip-compressed"
                                    multiple
                                    className="sr-only"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </FormControl>
                         <FormDescription>
                            Select one or more .zip files to include with the ticket.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            
            {stagedFiles.length > 0 && (
                <div className="space-y-2">
                    <FormLabel>Staged Files</FormLabel>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>File Name</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead className="text-right w-[80px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stagedFiles.map((file, index) => (
                                    <TableRow key={`${file.name}-${file.lastModified}`}>
                                        <TableCell className="font-medium flex items-center gap-2 truncate">
                                            <FileText className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{file.name}</span>
                                        </TableCell>
                                        <TableCell>{(file.size / 1024).toFixed(2)} KB</TableCell>
                                        <TableCell className="text-right">
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(index)}>
                                                <X className="h-4 w-4 text-destructive" />
                                                <span className="sr-only">Remove {file.name}</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            <div className="flex justify-end">
            <SubmitButton isValid={isValid} />
            </div>
        </form>
    </Form>
  );
}
