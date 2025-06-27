
'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { extractIpAddress } from '@/ai/flows/extract-ip-address';
import { mockDb } from '@/lib/mock-db';
import type { Ticket, Application, TicketStatus } from '@/lib/types';

async function getIpAddress(): Promise<string> {
  try {
    const headersList = headers();
    const headersObject: Record<string, string> = {};
    headersList.forEach((value, key) => {
      headersObject[key] = value;
    });

    // In development, the IP might be ::1, so we'll map it to localhost
    if (process.env.NODE_ENV === 'development' && (headersObject['x-forwarded-for'] === '::1' || !headersObject['x-forwarded-for'])) {
        return '127.0.0.1';
    }
    
    const result = await extractIpAddress({ headers: headersObject });
    return result.ipAddress || 'unknown';
  } catch (error) {
    console.error('Error extracting IP address:', error);
    return 'unknown';
  }
}

export async function getTicketsByIp(): Promise<Ticket[]> {
  const ipAddress = await getIpAddress();
  return mockDb.tickets.findByIp(ipAddress);
}

export async function getAllTickets(): Promise<Ticket[]> {
  return mockDb.tickets.findAll();
}

export async function getApplications(): Promise<Application[]> {
  return mockDb.applications.findAll();
}

const ticketSchema = z.object({
  application: z.string().min(1, 'Application is required'),
  environment: z.enum(['QA', 'Prod']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

export async function submitTicket(prevState: any, formData: FormData) {
  try {
    const validatedFields = ticketSchema.safeParse({
      application: formData.get('application'),
      environment: formData.get('environment'),
      description: formData.get('description'),
    });

    if (!validatedFields.success) {
      return {
        message: 'Validation failed',
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }
    
    // File upload logic would go here. We are simulating it.
    const files = formData.getAll('files');
    if(files.length > 0 && (files[0] as File).size === 0) {
      // No file selected
    }

    const ipAddress = await getIpAddress();
    await mockDb.tickets.create({ ...validatedFields.data, ip_address: ipAddress });

  } catch (error) {
    return {
      message: 'An error occurred while submitting the ticket.',
      errors: {},
    };
  }
  revalidatePath('/');
  revalidatePath('/admin');
  redirect('/');
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
  try {
    await mockDb.tickets.updateStatus(ticketId, status);
    revalidatePath('/admin');
    revalidatePath('/');
     return { success: true, message: `Ticket ${ticketId} updated to ${status}` };
  } catch (error) {
    return { success: false, message: 'Failed to update ticket status.' };
  }
}

const appSchema = z.object({
  app_name: z.string().min(1, 'Application name is required'),
  storage_path: z.string().min(1, 'Storage path is required'),
});

export async function addApplication(prevState: any, formData: FormData) {
  try {
    const validatedFields = appSchema.safeParse({
      app_name: formData.get('app_name'),
      storage_path: formData.get('storage_path'),
    });

    if (!validatedFields.success) {
      return {
        message: 'Validation failed',
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    await mockDb.applications.create(validatedFields.data);
    revalidatePath('/admin');
    revalidatePath('/submit-ticket');
    return { message: 'Application added successfully', errors: {} };
  } catch (error: any) {
     return { message: error.message || 'Failed to add application', errors: {} };
  }
}
