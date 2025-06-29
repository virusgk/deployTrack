
'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { TicketStatusBadge } from './TicketStatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Download, Server, FlaskConical, CircleDot, Flame, PartyPopper, Bug, Settings, Info, FileText } from 'lucide-react';
import type { Ticket, TicketStatus, ChangeType } from '@/lib/types';
import { updateTicketStatus } from '@/app/actions';
import { useToast } from "@/hooks/use-toast"

interface TicketTableProps {
  tickets: Ticket[];
  isAdmin?: boolean;
}

export function TicketTable({ tickets, isAdmin = false }: TicketTableProps) {
  const { toast } = useToast()

  const handleStatusChange = async (ticketId: string, status: TicketStatus) => {
    const result = await updateTicketStatus(ticketId, status);
    if(result.success) {
      toast({
        title: "Status Updated",
        description: result.message,
      });
    } else {
      toast({
        title: "Update Failed",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const getEnvIcon = (env: 'QA' | 'Prod') => {
    if(env === 'QA') return <FlaskConical className="h-4 w-4 text-purple-500 mr-2" />;
    return <Server className="h-4 w-4 text-green-500 mr-2" />;
  }
  
  const getChangeTypeIcon = (changeType: ChangeType) => {
    switch (changeType) {
      case 'Hotfix':
        return <Flame className="h-4 w-4 text-red-500 mr-2" />;
      case 'Feature Release':
        return <PartyPopper className="h-4 w-4 text-blue-500 mr-2" />;
      case 'Bug Fix':
        return <Bug className="h-4 w-4 text-orange-500 mr-2" />;
      case 'Configuration':
        return <Settings className="h-4 w-4 text-gray-500 mr-2" />;
      default:
        return <Info className="h-4 w-4 text-gray-400 mr-2" />;
    }
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Ticket ID</TableHead>
            <TableHead>Application</TableHead>
            <TableHead>Change Type</TableHead>
            <TableHead>Environment</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            {isAdmin && <TableHead>IP Address</TableHead>}
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.length === 0 && (
            <TableRow>
              <TableCell colSpan={isAdmin ? 9 : 8} className="h-24 text-center">
                No tickets found.
              </TableCell>
            </TableRow>
          )}
          {tickets.map((ticket) => (
            <TableRow key={ticket.ticket_id}>
              <TableCell className="font-medium">{ticket.ticket_id}</TableCell>
              <TableCell>{ticket.application}</TableCell>
              <TableCell>
                <div className='flex items-center'>
                  {getChangeTypeIcon(ticket.change_type)}
                  {ticket.change_type}
                </div>
              </TableCell>
              <TableCell>
                <div className='flex items-center'>
                  {getEnvIcon(ticket.environment)}
                  {ticket.environment}
                </div>
              </TableCell>
              <TableCell className="max-w-xs truncate">{ticket.description}</TableCell>
              <TableCell>
                <TicketStatusBadge status={ticket.status} />
              </TableCell>
              {isAdmin && <TableCell className="font-mono">{ticket.ip_address}</TableCell>}
              <TableCell>
                {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isAdmin && ticket.files.length > 0 && (
                       <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Download className="mr-2 h-4 w-4" />
                          <span>Download Files</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            {ticket.files.map((file) => (
                              <DropdownMenuItem key={file.path} asChild>
                                <a href={file.download_url} download={file.name}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  <span>{file.name}</span>
                                </a>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    )}
                    {isAdmin && (
                      <>
                        {(['Pending', 'Completed', 'Failed'] as TicketStatus[]).includes(ticket.status) && 
                          <DropdownMenuItem onClick={() => handleStatusChange(ticket.ticket_id, 'In Progress')}>
                            <CircleDot className="mr-2 h-4 w-4 text-blue-500" />
                            <span>Set to In Progress</span>
                          </DropdownMenuItem>
                        }
                        {(['Pending', 'In Progress'] as TicketStatus[]).includes(ticket.status) && 
                          <DropdownMenuItem onClick={() => handleStatusChange(ticket.ticket_id, 'Completed')}>
                            <CircleDot className="mr-2 h-4 w-4 text-green-500" />
                            <span>Set to Completed</span>
                          </DropdownMenuItem>
                        }
                        {(['Pending', 'In Progress'] as TicketStatus[]).includes(ticket.status) && 
                           <DropdownMenuItem onClick={() => handleStatusChange(ticket.ticket_id, 'Failed')}>
                            <CircleDot className="mr-2 h-4 w-4 text-red-500" />
                            <span>Set to Failed</span>
                          </DropdownMenuItem>
                        }
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
