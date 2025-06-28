import { SidebarTrigger } from "@/components/ui/sidebar";

interface PageHeaderProps {
    title: string;
    description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                 <SidebarTrigger className="md:hidden" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight font-headline">{title}</h1>
                    {description && <p className="text-muted-foreground">{description}</p>}
                </div>
            </div>
        </div>
    )
}
