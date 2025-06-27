import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TicketStatus } from '@/lib/types';

interface TicketStatusBadgeProps {
  status: TicketStatus;
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const statusStyles: Record<TicketStatus, string> = {
    Pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300/50',
    'In Progress': 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300/50',
    Completed: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 border-green-300/50',
    Failed: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 border-red-300/50',
  };

  return (
    <Badge
      variant="outline"
      className={cn('font-semibold', statusStyles[status])}
    >
      {status}
    </Badge>
  );
}
