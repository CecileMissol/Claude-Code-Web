'use client';

import type { Messages } from '../messages';

/** The closing signature: both first names, then the farewell line. */
export function Signature({ t, names, text }: { t: Messages; names: string; text: string }) {
  return (
    <footer className="sign" aria-label={t.signature.label}>
      <span className="script">{names}</span>
      <p>{text || t.signature.farewell}</p>
    </footer>
  );
}

export default Signature;
