'use client';

import { Waves } from '../assets/illustrations';
import type { Messages } from '../messages';

/** The closing signature: a line of sea, both first names, then the farewell. */
export function Signature({ t, names, text }: { t: Messages; names: string; text: string }) {
  return (
    <footer className="sign" aria-label={t.signature.label}>
      <Waves className="sign-waves" />
      <span className="script">{names}</span>
      <p>{text || t.signature.farewell}</p>
    </footer>
  );
}

export default Signature;
