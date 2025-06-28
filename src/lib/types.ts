
export interface DeployedFile {
  name: string;
  path: string;
  download_url: string;
}

export type TicketStatus = "Pending" | "In Progress" | "Completed" | "Failed";

export type ChangeType = "Hotfix" | "Feature Release" | "Bug Fix" | "Configuration" | "Other";

export interface Ticket {
  ticket_id: string;
  application: string;
  environment: "QA" | "Prod";
  change_type: ChangeType;
  description: string;
  ip_address: string;
  files: DeployedFile[];
  status: TicketStatus;
  created_at: Date;
  updated_at: Date;
}

export interface Application {
  id: string;
  app_name: string;
  storage_path: string;
}
