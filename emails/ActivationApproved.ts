import type { MailMessage } from '@/lib/mail';
import { emailButtonHtml, renderActivationLayout } from './ActivationLayout';

export interface ActivationApprovedProps {
  to: string;
  /** Better Auth magic-link URL: signs the buyer straight into `/app`. */
  url: string;
}

/**
 * "Your invitation is ready" — sent through Better Auth's `sendMagicLink`
 * hook (see `src/lib/auth.ts`), so the link is a real, working sign-in link,
 * not a decorative one repeated from a separate generic email.
 */
export function activationApprovedEmail({ to, url }: ActivationApprovedProps): MailMessage {
  const html = renderActivationLayout(
    'Your invitation is ready',
    `
      <h1 style="font-size:20px;margin:0 0 16px;">Your invitation is ready</h1>
      <p style="margin:0 0 16px;line-height:1.6;">Your purchase has been validated. Click below to sign in and start personalising your invitation — the link is valid for 15 minutes and signs you in directly, no password needed.</p>
      ${emailButtonHtml('Open my editor', url)}
      <h2 style="font-size:20px;margin:28px 0 16px;">Votre invitation est prête</h2>
      <p style="margin:0 0 16px;line-height:1.6;">Votre achat a été validé. Cliquez ci-dessous pour vous connecter et commencer à personnaliser votre invitation — le lien est valable 15 minutes et vous connecte directement, sans mot de passe.</p>
      ${emailButtonHtml('Ouvrir mon éditeur', url)}
    `,
  );

  return {
    to,
    subject: 'Your invitation is ready · Votre invitation est prête',
    text: [
      'Your purchase has been validated. Use the link below to sign in (valid 15 minutes):',
      url,
      '',
      'Votre achat a été validé. Utilisez le lien ci-dessous pour vous connecter (valable 15 minutes) :',
      url,
    ].join('\n'),
    html,
  };
}
