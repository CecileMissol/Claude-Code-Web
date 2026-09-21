/**
 * Company identity used by the legal pages, read from `LEGAL_*` environment
 * variables. Not part of `src/lib/env.ts` (out of this phase's file scope,
 * and these values are never required for the app to run): a missing
 * variable simply keeps its bracketed placeholder, e.g. `[[COMPANY_NAME]]`,
 * visibly unfilled on the page rather than crashing anything. Documented,
 * with these exact default placeholders, in `.env.example`.
 */

export interface LegalCompanyInfo {
  name: string;
  legalForm: string;
  address: string;
  siren: string;
  vatNumber: string;
  publicationDirector: string;
  contactEmail: string;
  dpoEmail: string;
}

function fromEnv(key: string, placeholder: string): string {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value.trim() : placeholder;
}

export function getLegalCompanyInfo(): LegalCompanyInfo {
  return {
    name: fromEnv('LEGAL_COMPANY_NAME', '[[COMPANY_NAME]]'),
    legalForm: fromEnv('LEGAL_COMPANY_FORM', '[[LEGAL_FORM]]'),
    address: fromEnv('LEGAL_COMPANY_ADDRESS', '[[COMPANY_ADDRESS]]'),
    siren: fromEnv('LEGAL_SIREN', '[[SIREN]]'),
    vatNumber: fromEnv('LEGAL_VAT_NUMBER', '[[VAT_NUMBER]]'),
    publicationDirector: fromEnv('LEGAL_PUBLICATION_DIRECTOR', '[[PUBLICATION_DIRECTOR]]'),
    contactEmail: fromEnv('LEGAL_CONTACT_EMAIL', '[[CONTACT_EMAIL]]'),
    dpoEmail: fromEnv('LEGAL_DPO_EMAIL', '[[DPO_EMAIL]]'),
  };
}

const TOKENS: ReadonlyArray<[token: string, key: keyof LegalCompanyInfo]> = [
  ['[[COMPANY_NAME]]', 'name'],
  ['[[LEGAL_FORM]]', 'legalForm'],
  ['[[COMPANY_ADDRESS]]', 'address'],
  ['[[SIREN]]', 'siren'],
  ['[[VAT_NUMBER]]', 'vatNumber'],
  ['[[PUBLICATION_DIRECTOR]]', 'publicationDirector'],
  ['[[CONTACT_EMAIL]]', 'contactEmail'],
  ['[[DPO_EMAIL]]', 'dpoEmail'],
];

/**
 * Replaces every `[[TOKEN]]` placeholder in a paragraph with its configured
 * value. When a variable is not set, the token is replaced by itself (the
 * placeholder default), so it stays clearly visible on the page.
 */
export function applyLegalPlaceholders(text: string, info: LegalCompanyInfo): string {
  return TOKENS.reduce((acc, [token, key]) => acc.replaceAll(token, info[key]), text);
}
