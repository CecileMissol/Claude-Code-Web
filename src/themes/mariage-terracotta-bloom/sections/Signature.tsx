'use client';

import type { Messages } from '../messages';

/** The closing signature: both first names in script, then the farewell line. */
export function Signature({ t, names, text }: { t: Messages; names: string; text: string }) {
  return (
    <footer className="tb-sign" aria-label={t.signature.label}>
      <span className="tb-script">{names}</span>
      <p>{text || t.signature.farewell}</p>
    </footer>
  );
}

export default Signature;
