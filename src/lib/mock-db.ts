import fs from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';
import type { Application, Ticket, TicketStatus } from '@/lib/types';

const dataDir = path.join(process.cwd(), 'data');
const ticketsFilePath = path.join(dataDir, 'tickets.csv');
const applicationsFilePath = path.join(dataDir, 'applications.csv');

// Helper functions to read/write CSVs
async function readTickets(): Promise<Ticket[]> {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    const fileContent = await fs.readFile(ticketsFilePath, 'utf-8');
    if (!fileContent.trim()) return [];

    const result = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (result.errors.length > 0) {
        console.error("Errors parsing tickets.csv:", result.errors);
    }
    
    // Process data after parsing to be more robust against corrupted rows
    const tickets: Ticket[] = (result.data as any[])
      .map(row => {
        try {
          if (!row || !row.ticket_id || !row.status || !row.created_at) return null;

          const createdAt = new Date(row.created_at);
          const updatedAt = new Date(row.updated_at);
          
          let parsedFiles: any[] = [];
          if (row.files && typeof row.files === 'string') {
            try {
              const tempFiles = JSON.parse(row.files);
              if (Array.isArray(tempFiles)) {
                parsedFiles = tempFiles;
              }
            } catch (e) {
              // Silently ignore JSON parsing errors for the 'files' field.
              // This handles corrupted data from previous writes without logging an error.
            }
          }

          const ticket: Ticket = {
            ticket_id: row.ticket_id,
            application: row.application,
            environment: row.environment,
            description: row.description,
            ip_address: row.ip_address,
            files: parsedFiles,
            status: row.status,
            created_at: isNaN(createdAt.getTime()) ? new Date() : createdAt,
            updated_at: isNaN(updatedAt.getTime()) ? new Date() : updatedAt,
          };
          return ticket;
        } catch (e) {
          console.error("Error processing a ticket row, skipping:", row, e);
          return null; // This row is corrupted, so we'll filter it out
        }
      })
      .filter((ticket): ticket is Ticket => ticket !== null); // Remove nulls from corrupted rows

    return tickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []; // File doesn't exist, start fresh
    }
    console.error("Error reading tickets.csv:", error);
    throw error;
  }
}

async function writeTickets(tickets: Ticket[]): Promise<void> {
    const dataToUnparse = tickets.map(t => ({
        ...t,
        created_at: t.created_at.toISOString(),
        updated_at: t.updated_at.toISOString(),
        files: JSON.stringify(t.files || []),
    }));
    const csvData = Papa.unparse(dataToUnparse, { header: true, quotes: true });
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(ticketsFilePath, csvData, 'utf-8');
}


async function readApplications(): Promise<Application[]> {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    const fileContent = await fs.readFile(applicationsFilePath, 'utf-8');
     if (!fileContent.trim()) return [];
    const result = Papa.parse<Application>(fileContent, { header: true, skipEmptyLines: true });
    
    if (result.errors.length > 0) {
        console.error("Errors parsing applications.csv:", result.errors);
    }

    return result.data.filter(a => a && a.id);
  } catch (error) {
     if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []; // File doesn't exist, start fresh
    }
    console.error("Error reading applications.csv:", error);
    throw error;
  }
}

async function writeApplications(applications: Application[]): Promise<void> {
    const csvData = Papa.unparse(applications, { header: true, quotes: true });
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(applicationsFilePath, csvData, 'utf-8');
}


export const mockDb = {
  tickets: {
    async findByIp(ip: string): Promise<Ticket[]> {
      const tickets = await readTickets();
      return tickets.filter(t => t.ip_address === ip || (t.ip_address === '::1' && ip === '127.0.0.1'));
    },
    async findAll(): Promise<Ticket[]> {
      return await readTickets();
    },
    async create(data: Omit<Ticket, 'ticket_id' | 'created_at' | 'updated_at' | 'files' | 'status'> & { ip_address: string }): Promise<Ticket> {
      const tickets = await readTickets();
      const newTicket: Ticket = {
        ...data,
        ticket_id: `TICKET-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        files: [], // Handled separately
        status: 'Pending',
        created_at: new Date(),
        updated_at: new Date(),
      };
      tickets.unshift(newTicket);
      await writeTickets(tickets);
      return newTicket;
    },
    async updateStatus(ticketId: string, status: TicketStatus): Promise<Ticket | undefined> {
      let tickets = await readTickets();
      const ticketIndex = tickets.findIndex(t => t.ticket_id === ticketId);
      if (ticketIndex > -1) {
        tickets[ticketIndex] = { ...tickets[ticketIndex], status, updated_at: new Date() };
        await writeTickets(tickets);
        return tickets[ticketIndex];
      }
      return undefined;
    }
  },
  applications: {
    async findAll(): Promise<Application[]> {
      return await readApplications();
    },
    async create(data: Pick<Application, 'app_name' | 'storage_path'>): Promise<Application> {
      const applications = await readApplications();
      const newApp: Application = {
        ...data,
        id: data.app_name.toLowerCase().replace(/\s+/g, '-'),
      };
      const exists = applications.find(app => app.id === newApp.id);
      if(exists) {
        throw new Error("Application already exists");
      }
      applications.push(newApp);
      await writeApplications(applications);
      return newApp;
    },
  },
};
