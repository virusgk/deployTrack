
'use server';

import 'dotenv/config';
import fs from 'fs/promises';
import { cookies, headers } from 'next/headers';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { extractIpAddress } from '@/ai/flows/extract-ip-address';
import { mockDb } from '@/lib/mock-db';
import type { Ticket, Application, TicketStatus, DeployedFile } from '@/lib/types';

async function getIpAddress(): Promise<string> {
  try {
    const headersList = await headers();
    const headersObject: Record<string, string> = {};
    // Use a for...of loop for explicit iteration
    for (const [key, value] of headersList.entries()) {
      headersObject[key] = value;
    }

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

export async function checkStoragePath(path: string): Promise<{ success: boolean; message: string }> {
  try {
    await fs.access(path, fs.constants.F_OK | fs.constants.W_OK);
    return { success: true, message: 'Path is accessible and writable.' };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
       return { success: false, message: 'Path does not exist. It must be created before adding the application.' };
    }
    return { success: false, message: 'Shared drive access issue: Path is not accessible or writable.' };
  }
}

const ticketSchema = z.object({
  application: z.string().min(1, 'Application is required'),
  environment: z.enum(['QA', 'Prod']),
  change_type: z.enum(["Hotfix", "Feature Release", "Bug Fix", "Configuration", "Other"]),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

export async function submitTicket(prevState: any, formData: FormData) {
  try {
    const validatedFields = ticketSchema.safeParse({
      application: formData.get('application'),
      environment: formData.get('environment'),
      change_type: formData.get('change_type'),
      description: formData.get('description'),
    });

    if (!validatedFields.success) {
      return {
        message: 'Validation failed',
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }
    
    const files = formData.getAll('files') as File[];
    const deployedFiles: DeployedFile[] = [];
    const allowedTypes = ['application/zip', 'application/x-zip-compressed'];

    for (const file of files) {
        if (file instanceof File && file.size > 0) {
            if (!allowedTypes.includes(file.type)) {
                return {
                    message: 'Validation failed',
                    errors: { files: [`Invalid file type: ${file.name}. Only .zip files are allowed.`] }
                };
            }
            // In a real app, you would upload the file here and get a URL/path
            deployedFiles.push({
                name: file.name,
                path: `/uploads/${file.name}`, // mock path
                download_url: '#', // mock url
            });
        }
    }

    const applications = await getApplications();
    const selectedApp = applications.find(app => app.app_name === validatedFields.data.application);

    if (!selectedApp) {
      return {
          message: 'Selected application not found.',
          errors: { application: ['This application does not exist.'] }
      }
    }

    const pathCheck = await checkStoragePath(selectedApp.storage_path);
    if (!pathCheck.success) {
        return {
            message: 'Shared drive access issue for the selected application. Please contact an admin.',
            errors: { application: [pathCheck.message] }
        }
    }
    
    const ipAddress = await getIpAddress();
    await mockDb.tickets.create({ ...validatedFields.data, ip_address: ipAddress, files: deployedFiles });

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
  const appName = formData.get('app_name') as string;
  const storagePath = formData.get('storage_path') as string;

  try {
    const validatedFields = appSchema.safeParse({
      app_name: appName,
      storage_path: storagePath,
    });

    if (!validatedFields.success) {
      return {
        message: 'Validation failed',
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const pathCheck = await checkStoragePath(storagePath);
    if (!pathCheck.success) {
        return {
            message: pathCheck.message,
            errors: { storage_path: [pathCheck.message] },
        }
    }

    await mockDb.applications.create(validatedFields.data);
    revalidatePath('/admin');
    revalidatePath('/submit-ticket');
    return { message: 'Application added successfully', errors: {} };
  } catch (error: any) {
     return { message: error.message || 'Failed to add application', errors: {} };
  }
}

export async function updateApplication(prevState: any, formData: FormData) {
  const appId = formData.get('id') as string;
  const appName = formData.get('app_name') as string;
  const storagePath = formData.get('storage_path') as string;

  if (!appId) {
    return { message: 'Application ID is missing.', errors: {} };
  }

  try {
    const validatedFields = appSchema.safeParse({
      app_name: appName,
      storage_path: storagePath,
    });

    if (!validatedFields.success) {
      return {
        message: 'Validation failed',
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const pathCheck = await checkStoragePath(storagePath);
    if (!pathCheck.success) {
        return {
            message: pathCheck.message,
            errors: { storage_path: [pathCheck.message] },
        }
    }

    await mockDb.applications.update(appId, validatedFields.data);
    revalidatePath('/admin');
    revalidatePath('/submit-ticket');
    return { message: 'Application updated successfully', errors: {} };
  } catch (error: any) {
     return { message: error.message || 'Failed to update application', errors: {} };
  }
}

export async function deleteApplication(appId: string) {
    try {
        await mockDb.applications.delete(appId);
        revalidatePath('/admin');
        revalidatePath('/submit-ticket');
        return { success: true, message: 'Application deleted successfully.' };
    } catch (error) {
        return { success: false, message: 'Failed to delete application.' };
    }
}

export async function login(prevState: any, formData: FormData) {
  const password = formData.get('password');
  if (password === process.env.ADMIN_PASSWORD) {
    const authSecret = process.env.AUTH_SECRET;
    if (!authSecret) {
        throw new Error('AUTH_SECRET environment variable is not set.');
    }
    const cookieStore = await cookies();
    cookieStore.set('auth', authSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
    });
    redirect('/admin');
  }

  return {
    error: 'Invalid password. Please try again.',
  };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set('auth', '', { expires: new Date(0) });
  redirect('/');
}
