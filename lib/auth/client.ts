import { createAuthClient } from 'better-auth/react';
import { BRAND } from '@/lib/constants/brand';

const baseURL =
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.BETTER_AUTH_URL?.trim() ||
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      BRAND.siteUrl;

export const authClient = createAuthClient({
  baseURL,
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
} = authClient;
