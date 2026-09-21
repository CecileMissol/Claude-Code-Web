import type { MailMessage } from '@/lib/mail';
import { getEnv } from '@/lib/env';
import { escapeHtml, renderActivationLayout } from './ActivationLayout';

export interface ActivationRejectedProps {
  to: string;
  orderId: string;
  /** Optional note typed by the admin; shown verbatim (escaped) in both languages. */
  reason?: string;
}

export function activationRejectedEmail({ to, orderId, reason }: ActivationRejectedProps): MailMessage {
  const activateUrl = `${getEnv().APP_URL.replace(/\/+$/, '')}/activate`;
  const order = escapeHtml(orderId);
  const note = reason ? escapeHtml(reason) : null;

  const html = renderActivationLayout(
    'About your activation request',
    `
      <h1 style="font-size:20px;margin:0 0 16px;">We could not validate your request</h1>
      <p style="margin:0 0 16px;line-height:1.6;">
        Order <strong>#${order}</strong> could not be matched to a valid purchase.
        ${note ? ` Note from our team: “${note}”.` : ''}
      </p>
      <p style="margin:0 0 24px;line-height:1.6;">
        Please double-check your order number and email address on
        <a href="${escapeHtml(activateUrl)}">the activation page</a>, or reply to this address if
        you believe this is a mistake.
      </p>
      <h2 style="font-size:20px;margin:0 0 16px;">Nous n’avons pas pu valider votre demande</h2>
      <p style="margin:0 0 16px;line-height:1.6;">
        La commande <strong>n°${order}</strong> n’a pas pu être rattachée à un achat valide.
        ${note ? ` Précision de notre équipe : « ${note} ».` : ''}
      </p>
      <p style="margin:0;line-height:1.6;">
        Vérifiez votre numéro de commande et votre adresse e-mail sur la page d’activation, ou
        répondez à cet e-mail si vous pensez qu’il s’agit d’une erreur.
      </p>
    `,
  );

  return {
    to,
    subject: `About your activation request · À propos de votre demande (#${orderId})`,
    text: [
      `Order #${orderId} could not be matched to a valid purchase.`,
      reason ? `Note from our team: ${reason}` : null,
      'Please double-check your order number and email, or reply if you believe this is a mistake.',
      '',
      `La commande n°${orderId} n'a pas pu être rattachée à un achat valide.`,
      reason ? `Précision de notre équipe : ${reason}` : null,
      'Vérifiez votre numéro de commande et votre e-mail, ou répondez si vous pensez qu’il s’agit d’une erreur.',
    ]
      .filter((line): line is string => line !== null)
      .join('\n'),
    html,
  };
}
