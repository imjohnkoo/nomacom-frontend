/**
 * Create Basic Auth header string from API key and secret
 */
export function getBasicAuthHeader(apiKey: string, apiSecret: string): string {
  const credentials = `${apiKey}:${apiSecret}`;
  return Buffer.from(credentials, 'utf-8').toString('base64');
}
