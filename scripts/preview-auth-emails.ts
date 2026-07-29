import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildVerifyEmail } from '../lib/email/templates/verify-email';
import { buildWelcomeEmail } from '../lib/email/templates/welcome';
import { buildResetPasswordEmail } from '../lib/email/templates/reset-password';
import { buildPasswordChangedEmail } from '../lib/email/templates/password-changed';

const outDir = join(process.cwd(), 'tmp', 'email-previews');
mkdirSync(outDir, { recursive: true });

const fixtures = [
  {
    slug: 'verify-email',
    result: buildVerifyEmail({
      url: 'https://www.clea.no/api/auth/verify-email?token=preview-token&callbackURL=%2Faccount',
    }),
  },
  {
    slug: 'welcome',
    result: buildWelcomeEmail({ name: 'Ada Lovelace' }),
  },
  {
    slug: 'reset-password',
    result: buildResetPasswordEmail({
      url: 'https://www.clea.no/reset-password?token=preview-reset',
    }),
  },
  {
    slug: 'password-changed',
    result: buildPasswordChangedEmail({ name: 'Ada' }),
  },
];

for (const fixture of fixtures) {
  writeFileSync(join(outDir, `${fixture.slug}.html`), fixture.result.html);
  writeFileSync(join(outDir, `${fixture.slug}.txt`), fixture.result.text);
  writeFileSync(
    join(outDir, `${fixture.slug}.meta.json`),
    JSON.stringify(
      {
        subject: fixture.result.subject,
        preheader: fixture.result.preheader,
      },
      null,
      2,
    ),
  );
}

console.log(`Wrote ${fixtures.length} auth email previews to ${outDir}`);
