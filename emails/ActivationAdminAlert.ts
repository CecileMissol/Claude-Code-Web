import type { MailMessage } from '@/lib/mail';
import { getEnv } from '@/lib/env';
import { emailButtonHtml, escapeHtml, renderActivationLayout } from './ActivationLayout';

export interface ActivationAdminAlertProps {
  to: string;
  orderId: string;
  buyerEmail: string;
  themeName: string;
}

/** Notifies an admin (one email per address in `ADMIN_EMAILS`) of a new request. */
export function activationAdminAlertEmail({
  to,
  orderId,
  buyerEmail,
  themeName,
}: ActivationAdminAlertProps): MailMessage {
  const adminUrl = `${getEnv().APP_URL.replace(/\/+$/, '')}/admin`;
  const order = escapeHtml(orderId);
  const buyer = escapeHtml(buyerEmail);
  const theme = escapeHtml(themeName);

  const html = renderActivationLayout(
    'New activation request',
    `
      <h1 style="font-size:20px;margin:0 0 16px;">New activation request · Nouvelle demande</h1>
      <p style="margin:0 0 8px;line-height:1.6;">Order #${order} · ${buyer} · ${theme}</p>
      <p style="margin:0 0 16px;line-height:1.6;">Review it in the admin queue.</p>
      ${emailButtonHtml('Open /admin', adminUrl)}
    `,
  );

  return {
    to,
    subject: `New activation request · Nouvelle demande d'activation (#${orderId})`,
    text: [
      `Order #${orderId} · ${buyerEmail} · ${themeName}`,
      'Review it in the admin queue:',
      adminUrl,
    ].join('\n'),
    html,
  };
}
