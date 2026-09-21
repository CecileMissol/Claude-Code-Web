/**
 * Company identity shown on the legal pages, read from the `LEGAL_*`
 * environment variables through `src/lib/env.ts` (the single place where
 * `process.env` is read). None of them is required: a missing variable keeps
 * its bracketed placeholder, e.g. `[[COMPANY_NAME]]`, visibly unfilled on the
 * page rather than crashing anything. Documented in `.env.example`.
 */

import { getEnv } from '@/lib/env';

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

export function getLegalCompanyInfo(): LegalCompanyInfo {
  const env = getEnv();
  return {
    name: env.LEGAL_COMPANY_NAME,
    legalForm: env.LEGAL_COMPANY_FORM,
    address: env.LEGAL_COMPANY_ADDRESS,
    siren: env.LEGAL_SIREN,
    vatNumber: env.LEGAL_VAT_NUMBER,
    publicationDirector: env.LEGAL_PUBLICATION_DIRECTOR,
    contactEmail: env.LEGAL_CONTACT_EMAIL,
    dpoEmail: env.LEGAL_DPO_EMAIL,
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
