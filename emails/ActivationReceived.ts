import type { MailMessage } from '@/lib/mail';
import { escapeHtml, renderActivationLayout } from './ActivationLayout';

export interface ActivationReceivedProps {
  to: string;
  orderId: string;
  themeName: string;
}

/** Buyer-facing receipt: "we have your activation request". */
export function activationReceivedEmail({
  to,
  orderId,
  themeName,
}: ActivationReceivedProps): MailMessage {
  const order = escapeHtml(orderId);
  const theme = escapeHtml(themeName);

  const html = renderActivationLayout(
    'Activation request received',
    `
      <h1 style="font-size:20px;margin:0 0 16px;">Thanks — we have your request</h1>
      <p style="margin:0 0 16px;line-height:1.6;">Order <strong>#${order}</strong> · Theme: <strong>${theme}</strong></p>
      <p style="margin:0 0 24px;line-height:1.6;">We will check it and get back to you within 24&nbsp;hours. Once approved, you will receive a sign-in link by email — there is nothing else to do for now.</p>
      <h2 style="font-size:20px;margin:0 0 16px;">Merci — nous avons bien reçu votre demande</h2>
      <p style="margin:0 0 16px;line-height:1.6;">Commande <strong>n°${order}</strong> · Thème : <strong>${theme}</strong></p>
      <p style="margin:0;line-height:1.6;">Nous allons la vérifier et revenir vers vous sous 24&nbsp;h. Une fois validée, vous recevrez un lien de connexion par e-mail — il n’y a rien d’autre à faire pour l’instant.</p>
    `,
  );

  return {
    to,
    subject: `Activation request received · Demande d'activation reçue (#${orderId})`,
    text: [
      'Thanks — we have your request.',
      `Order #${orderId} · Theme: ${themeName}`,
      'We will check it and get back to you within 24 hours. Once approved, you will receive a sign-in link by email.',
      '',
      'Merci — nous avons bien reçu votre demande.',
      `Commande n°${orderId} · Thème : ${themeName}`,
      'Nous allons la vérifier et revenir vers vous sous 24 h. Une fois validée, vous recevrez un lien de connexion par e-mail.',
    ].join('\n'),
    html,
  };
}
