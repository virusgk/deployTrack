# **App Name**: DeployTrack

## Core Features:

- Ticket Submission: Allows users to submit deployment tickets with application, environment, and file attachments.
- User Ticket Dashboard: Presents a dashboard to users, displaying tickets associated with their IP address.
- IP-based Tracking: Utilizes a tool to extract IP address and associates tickets with user IP for tracking purposes.
- Admin Dashboard: Provides an admin dashboard for managing applications, storage paths, and ticket statuses.
- Shared File Storage: Enables file uploads (build files, DB scripts) via Firebase Storage. This file storage will serve as a shared drive.
- Dynamic Ticket ID Generation: Generates unique ticket IDs for each submission in the format TICKET-YYYYMMDD-RANDOM.

## Style Guidelines:

- Primary color: HSL(210, 70%, 50%) / RGB(30, 123, 204), a vibrant blue to convey reliability and efficiency.
- Background color: HSL(210, 20%, 95%) / RGB(242, 245, 247), a very light tint of blue for a clean interface.
- Accent color: HSL(180, 60%, 40%) / RGB(41, 179, 153), a contrasting turquoise to highlight key actions and statuses.
- Font: 'Inter' (sans-serif) for a modern, neutral, and readable UI, suitable for both headlines and body text.
- Use simple, outlined icons to represent different file types, deployment environments, and actions.
- A clean, card-based layout with clear separation of sections, making efficient use of screen real estate.
- Subtle transition animations for ticket status changes and form submissions to enhance user feedback.