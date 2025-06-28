
'use client';

import { BarChart, PieChart, LineChart, TrendingUp, CheckCircle, Package } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  Tooltip,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  Line,
  LineChart as RechartsLineChart,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import type { Ticket } from '@/lib/types';
import { useMemo } from 'react';
import { subDays, format, startOfDay } from 'date-fns';

interface AnalyticsDashboardProps {
  tickets: Ticket[];
}

const CHART_CONFIG = {
  tickets: {
    label: 'Tickets',
    color: 'hsl(var(--chart-1))',
  },
  Pending: {
    label: 'Pending',
    color: 'hsl(var(--chart-2))',
  },
  'In Progress': {
    label: 'In Progress',
    color: 'hsl(var(--chart-3))',
  },
  Completed: {
    label: 'Completed',
    color: 'hsl(var(--chart-4))',
  },
  Failed: {
    label: 'Failed',
    color: 'hsl(var(--chart-5))',
  },
};

export function AnalyticsDashboard({ tickets }: AnalyticsDashboardProps) {
  const deploymentsByApp = useMemo(() => {
    const counts = tickets.reduce((acc, ticket) => {
      acc[ticket.application] = (acc[ticket.application] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, count]) => ({ name, tickets: count }));
  }, [tickets]);

  const statusDistribution = useMemo(() => {
    const counts = tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value, fill: CHART_CONFIG[name as keyof typeof CHART_CONFIG]?.color || '#8884d8' }));
  }, [tickets]);
  
  const totalTickets = tickets.length;
  const completedTickets = tickets.filter(t => t.status === 'Completed').length;
  const completionRate = totalTickets > 0 ? (completedTickets / totalTickets * 100).toFixed(1) : "0";


  const deploymentTrends = useMemo(() => {
    const trends = new Map<string, number>();
    const today = startOfDay(new Date());

    for (let i = 29; i >= 0; i--) {
        const date = subDays(today, i);
        const formattedDate = format(date, 'MMM d');
        trends.set(formattedDate, 0);
    }
    
    tickets.forEach(ticket => {
        const ticketDate = startOfDay(new Date(ticket.created_at));
        if (ticketDate >= subDays(today, 29)) {
            const formattedDate = format(ticketDate, 'MMM d');
            if (trends.has(formattedDate)) {
                trends.set(formattedDate, trends.get(formattedDate)! + 1);
            }
        }
    });

    return Array.from(trends.entries()).map(([date, count]) => ({ date, tickets: count }));
  }, [tickets]);


  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4 p-6">
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                    <BarChart className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Total Tickets</p>
                    <p className="text-2xl font-bold">{totalTickets}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="bg-green-500/10 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{completedTickets}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="bg-blue-500/10 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold">{completionRate}%</p>
                </div>
            </div>
             <div className="flex items-center gap-4">
                <div className="bg-purple-500/10 p-3 rounded-full">
                    <Package className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Total Apps</p>
                    <p className="text-2xl font-bold">{deploymentsByApp.length}</p>
                </div>
            </div>
        </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Deployment Trends (Last 30 Days)</CardTitle>
          <CardDescription>
            Volume of deployment tickets submitted over the past 30 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[250px] w-full">
            <ResponsiveContainer>
              <RechartsLineChart data={deploymentTrends}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis allowDecimals={false} />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      hideLabel
                      formatter={(value) => `${value} tickets`}
                    />
                  }
                />
                <Line
                  dataKey="tickets"
                  type="monotone"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Status Distribution</CardTitle>
          <CardDescription>
            A breakdown of all tickets by their current status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={CHART_CONFIG}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <ResponsiveContainer>
              <RechartsPieChart>
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                  
                >
                    {statusDistribution.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                  className="-mt-4"
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Deployments by Application</CardTitle>
          <CardDescription>
            Total number of deployment tickets for each application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ tickets: { label: 'Tickets', color: 'hsl(var(--primary))' } }} className="h-[300px] w-full">
            <ResponsiveContainer>
              <RechartsBarChart data={deploymentsByApp} layout="vertical" margin={{ left: 20 }}>
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-sm"
                  width={120}
                />
                <XAxis dataKey="tickets" type="number" hide />
                <Tooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      hideLabel
                      formatter={(value, name) => (
                        <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{name as string}</span>
                            <span className="text-muted-foreground">{value} tickets</span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar dataKey="tickets" layout="vertical" radius={4} fill="var(--color-tickets)">
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
