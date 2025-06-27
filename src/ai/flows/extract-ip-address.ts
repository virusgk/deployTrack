// extract-ip-address.ts
'use server';

/**
 * @fileOverview Extracts the IP address from the request headers.
 *
 * - extractIpAddress - A function that extracts the IP address.
 * - ExtractIpAddressInput - The input type for the extractIpAddress function.
 * - ExtractIpAddressOutput - The return type for the extractIpAddress function.
 */

// NOTE: Using an AI flow for this task is not efficient. 
// It has been replaced with a standard function for reliability and performance.

export interface ExtractIpAddressInput {
  headers: Record<string, string>;
}

export interface ExtractIpAddressOutput {
  ipAddress: string;
}

export async function extractIpAddress(
  input: ExtractIpAddressInput
): Promise<ExtractIpAddressOutput> {
  const headers = input.headers;
  
  // The 'x-forwarded-for' header can be a comma-separated list of IPs.
  // The first IP in the list is the original client IP.
  const xForwardedFor = (headers['x-forwarded-for'] || '').split(',')[0].trim();

  const ipAddress =
    xForwardedFor ||
    headers['x-real-ip'] ||
    headers['cf-connecting-ip'] || // Cloudflare
    headers['fastly-client-ip'] || // Fastly
    headers['x-cluster-client-ip'] ||
    headers['x-forwarded'] ||
    headers['forwarded-for'] ||
    headers['forwarded'] ||
    headers['client-ip'] || // From some platforms like Netlify
    '';

  return {
    ipAddress: ipAddress || 'unknown',
  };
}
