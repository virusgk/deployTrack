
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';
import { mockDb } from '@/lib/mock-db';

export async function GET(request: NextRequest) {
  // 1. Check authentication
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth');
  const authSecret = process.env.AUTH_SECRET;

  if (!authCookie || authCookie.value !== authSecret) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // 2. Get file path from query
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');

  if (!filePath) {
    return new NextResponse('File path is required', { status: 400 });
  }

  // 3. Security Check: Ensure the path is within a valid storage directory
  const applications = await mockDb.applications.findAll();
  const allowedPaths = applications.map(app => path.resolve(app.storage_path));
  const requestedPath = path.resolve(filePath);

  const isAllowed = allowedPaths.some(allowedPath => requestedPath.startsWith(allowedPath));

  if (!isAllowed) {
    return new NextResponse('Forbidden: Access to this file is not allowed', { status: 403 });
  }

  try {
    // 4. Read file from filesystem
    const fileBuffer = await fs.readFile(requestedPath);
    const fileName = path.basename(requestedPath);

    // 5. Return file as response
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Type': 'application/zip',
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return new NextResponse('File not found', { status: 404 });
    }
    console.error('File download error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
