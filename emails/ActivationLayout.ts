/**
 * Shared HTML helpers for every `Activation*` transactional email.
 *
 * Built as plain template strings rather than JSX rendered through
 * `react-dom/server`: Next.js 16's server-components build refuses any module
 * reachable from a Server Component (which `src/lib/activation.ts` and
 * `src/lib/auth.ts` both are, transitively, through Server Actions and route
 * handlers) that imports `react-dom/server` — see the build error this
 * produced before the rewrite. No `@react-email/components` dependency is
 * installed either, so plain, hand-escaped HTML strings are the simplest
 * option that actually builds, without adding a dependency.
 */

/** Escapes text interpolated into the HTML body (order ids, emails, admin-typed reasons, …). */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Wraps a body fragment in the shared document, header and footer. */
export function renderActivationLayout(preview: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(preview)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#F4F1EA;color:#1D1D1B;font-family:Georgia, 'Times New Roman', serif;">
    <div style="max-width:480px;margin:0 auto;padding:32px 24px;">
      <p style="margin:0 0 24px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6E8228;">Invitations</p>
      ${bodyHtml}
      <hr style="border:none;border-top:1px solid #DCD7CB;margin:32px 0 16px;" />
      <p style="font-size:12px;color:#8A8A86;margin:0;">This is an automated message, please do not reply. · Ceci est un message automatique, merci de ne pas y répondre.</p>
    </div>
  </body>
</html>`;
}

export function emailButtonHtml(label: string, url: string): string {
  return `<a href="${escapeHtml(url)}" style="display:inline-block;margin-top:8px;padding:10px 20px;border-radius:999px;background-color:#1D1D1B;color:#F4F1EA;text-decoration:none;font-size:14px;">${escapeHtml(label)}</a>`;
}
