// extract-ip-address.ts
'use server';

/**
 * @fileOverview Extracts the IP address from the request headers.
 *
 * - extractIpAddress - A function that extracts the IP address.
 * - ExtractIpAddressInput - The input type for the extractIpAddress function.
 * - ExtractIpAddressOutput - The return type for the extractIpAddress function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractIpAddressInputSchema = z.object({
  headers: z.record(z.string()).describe('The request headers.'),
});
export type ExtractIpAddressInput = z.infer<typeof ExtractIpAddressInputSchema>;

const ExtractIpAddressOutputSchema = z.object({
  ipAddress: z.string().describe('The extracted IP address.'),
});
export type ExtractIpAddressOutput = z.infer<typeof ExtractIpAddressOutputSchema>;

export async function extractIpAddress(input: ExtractIpAddressInput): Promise<ExtractIpAddressOutput> {
  return extractIpAddressFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractIpAddressPrompt',
  input: {schema: ExtractIpAddressInputSchema},
  output: {schema: ExtractIpAddressOutputSchema},
  prompt: `Extract the IP address from the following headers:\n\nHeaders: {{{JSON.stringify(headers)}}}`,
});

const extractIpAddressFlow = ai.defineFlow(
  {
    name: 'extractIpAddressFlow',
    inputSchema: ExtractIpAddressInputSchema,
    outputSchema: ExtractIpAddressOutputSchema,
  },
  async input => {
    // Attempt to extract the IP address from common headers
    const ipAddress =
      input.headers['x-forwarded-for'] ||
      input.headers['x-real-ip'] ||
      input.headers['cf-connecting-ip'] || // Cloudflare
      input.headers['fastly-client-ip'] || // Fastly
      input.headers['x-cluster-client-ip'] ||
      input.headers['x-forwarded'] ||
      input.headers['forwarded-for'] ||
      input.headers['forwarded'] ||
      // Some platforms like Netlify inject the IP in the `client-ip` header.
      input.headers['client-ip'] ||
      // Fallback to remoteAddress, which might include the port
      '';

    return {
      ipAddress: ipAddress || 'unknown',
    };
  }
);
