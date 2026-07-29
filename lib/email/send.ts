import { getResendClient } from './resend';
import { readAuthEnv } from '@/lib/auth/env';

export interface TransactionalEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendTransactionalEmail(
  message: TransactionalEmail,
): Promise<void> {
  const { emailFrom, isProduction, resendApiKey } = readAuthEnv();
  const resend = getResendClient();

  if (!resend || !resendApiKey) {
    if (!isProduction) {
      console.info('[auth-email:dev]', {
        to: message.to,
        subject: message.subject,
      });
      return;
    }

    throw new Error('RESEND_API_KEY is not configured.');
  }

  const { error } = await resend.emails.send({
    from: emailFrom,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });

  if (error) {
    throw new Error(error.message);
  }
}
