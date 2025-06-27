import type { Application, Ticket, TicketStatus } from '@/lib/types';

let tickets: Ticket[] = [
  {
    ticket_id: 'TICKET-20240729-ABCDE',
    application: 'Frontend Portal',
    environment: 'QA',
    description: 'Deploy new user authentication feature with updated UI components.',
    ip_address: '127.0.0.1',
    files: [{ name: 'build_v1.2.zip', path: 'tickets/TICKET-20240729-ABCDE/build_v1.2.zip', download_url: '#' }],
    status: 'Completed',
    created_at: new Date('2024-07-29T10:00:00Z'),
    updated_at: new Date('2024-07-29T11:30:00Z'),
  },
  {
    ticket_id: 'TICKET-20240729-FGHIJ',
    application: 'App2',
    environment: 'Prod',
    description: 'Critical hotfix for the main payment gateway integration.',
    ip_address: '192.168.1.100',
    files: [{ name: 'hotfix-payment.zip', path: 'tickets/TICKET-20240729-FGHIJ/hotfix-payment.zip', download_url: '#' }],
    status: 'In Progress',
    created_at: new Date('2024-07-29T12:00:00Z'),
    updated_at: new Date('2024-07-29T12:15:00Z'),
  },
  {
    ticket_id: 'TICKET-20240730-KLMNO',
    application: 'App1',
    environment: 'QA',
    description: 'Update Node.js and other critical dependency versions.',
    ip_address: '127.0.0.1',
    files: [],
    status: 'Pending',
    created_at: new Date('2024-07-30T09:00:00Z'),
    updated_at: new Date('2024-07-30T09:00:00Z'),
  },
    {
    ticket_id: 'TICKET-20240730-PQRST',
    application: 'Frontend Portal',
    environment: 'Prod',
    description: 'Release of the new marketing landing page.',
    ip_address: '127.0.0.1',
    files: [{ name: 'marketing-release.zip', path: 'tickets/TICKET-20240730-PQRST/marketing-release.zip', download_url: '#' }],
    status: 'Pending',
    created_at: new Date('2024-07-30T14:00:00Z'),
    updated_at: new Date('2024-07-30T14:00:00Z'),
  },
];

let applications: Application[] = [
  { id: 'app1', app_name: 'App1', storage_path: 'apps/App1' },
  { id: 'app2', app_name: 'App2', storage_path: 'apps/App2' },
  { id: 'frontend-portal', app_name: 'Frontend Portal', storage_path: 'apps/Frontend-Portal' },
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const mockDb = {
  tickets: {
    async findByIp(ip: string): Promise<Ticket[]> {
      await delay(100);
      return tickets.filter(t => t.ip_address === ip || t.ip_address === '::1' && ip === '127.0.0.1').sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    },
    async findAll(): Promise<Ticket[]> {
      await delay(100);
      return [...tickets].sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    },
    async create(data: Omit<Ticket, 'ticket_id' | 'created_at' | 'updated_at' | 'files' | 'status'> & { ip_address: string }): Promise<Ticket> {
      await delay(100);
      const newTicket: Ticket = {
        ...data,
        ticket_id: `TICKET-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        files: [], // Handled separately
        status: 'Pending',
        created_at: new Date(),
        updated_at: new Date(),
      };
      tickets.unshift(newTicket);
      return newTicket;
    },
    async updateStatus(ticketId: string, status: TicketStatus): Promise<Ticket | undefined> {
      await delay(50);
      const ticketIndex = tickets.findIndex(t => t.ticket_id === ticketId);
      if (ticketIndex > -1) {
        tickets[ticketIndex] = { ...tickets[ticketIndex], status, updated_at: new Date() };
        return tickets[ticketIndex];
      }
      return undefined;
    }
  },
  applications: {
    async findAll(): Promise<Application[]> {
      await delay(50);
      return [...applications];
    },
    async create(data: Pick<Application, 'app_name' | 'storage_path'>): Promise<Application> {
      await delay(50);
      const newApp: Application = {
        ...data,
        id: data.app_name.toLowerCase().replace(/\s+/g, '-'),
      };
      const exists = applications.find(app => app.id === newApp.id);
      if(exists) {
        throw new Error("Application already exists");
      }
      applications.push(newApp);
      return newApp;
    },
  },
};
