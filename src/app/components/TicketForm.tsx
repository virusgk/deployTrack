
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Application } from '@/lib/types';
import { submitTicket } from '@/app/actions';
import { useActionState, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const ticketSchema = z.object({
  application: z.string().min(1, 'Application is required'),
  environment: z.enum(['QA', 'Prod'], { required_error: 'Environment is required' }),
  change_type: z.enum(["Hotfix", "Feature Release", "Bug Fix", "Configuration", "Other"], { required_error: 'Change type is required' }),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  files: z
    .custom<FileList>()
    .refine((files) => {
      if (!files || files.length === 0) return true;
      const file = files[0];
      const allowedTypes = ['application/zip', 'application/x-zip-compressed'];
      return allowedTypes.includes(file.type);
    }, 'Only .zip files are allowed.')
    .optional(),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

interface TicketFormProps {
  applications: Application[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
      Submit Ticket
    </Button>
  );
}

function UploadingUI() {
    const { pending } = useFormStatus();
    const { getValues } = useFormContext<TicketFormValues>();
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (pending) {
            const files = getValues('files');
            if (files && files.length > 0) {
                setIsVisible(true);
            }
        } else {
            setIsVisible(false);
        }
    }, [pending, getValues]);

    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;
        if (isVisible) {
            setProgress(0);
            timer = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 95) {
                        clearInterval(timer!);
                        return prev;
                    }
                    return prev + 5;
                });
            }, 200);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <FormLabel>Uploading file...</FormLabel>
                <span className="text-sm font-medium text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
        </div>
    );
}

export function TicketForm({ applications }: TicketFormProps) {
  const [state, formAction] = useActionState(submitTicket, { message: '', errors: {} });
  const { toast } = useToast();

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      application: '',
      environment: undefined,
      change_type: undefined,
      description: '',
      files: undefined,
      ...state.values,
    },
  });

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
              <FormMessage>{state.errors?.application}</FormMessage>
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
              <FormMessage>{state.errors?.environment}</FormMessage>
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
              <FormMessage>{state.errors?.change_type}</FormMessage>
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
              <FormMessage>{state.errors?.description}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="files"
          render={({ field: { onChange, onBlur, name, ref } }) => (
            <FormItem>
              <FormLabel>Build Files / DB Scripts (.zip only)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".zip,application/zip,application/x-zip-compressed"
                  onChange={(e) => onChange(e.target.files)}
                  onBlur={onBlur}
                  name={name}
                  ref={ref}
                />
              </FormControl>
              <FormDescription>
                Upload any necessary files for the deployment in a single zip file.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <UploadingUI />
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </Form>
  );
}
