import { Resend } from 'resend';
import { readAuthEnv } from '@/lib/auth/env';

let resendClient: Resend | undefined;

export function getResendClient(): Resend | null {
  const { resendApiKey } = readAuthEnv();
  if (!resendApiKey) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(resendApiKey);
  }

  return resendClient;
}
