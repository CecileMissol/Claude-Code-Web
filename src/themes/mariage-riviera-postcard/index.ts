import type { ThemeModule } from '../types';
import { manifest } from './manifest';
import { Extras } from './schema';
import Invitation from './Invitation';
import { REPLAY_EVENT } from './animations/useInvitationMotion';

/** Public entry point of the "Noir & ivoire" theme, loaded by the registry. */
const theme: ThemeModule = { manifest, Extras, Invitation };

/**
 * Replays the envelope-opening sequence.
 *
 * The editor needs a "play it again" button without owning a React ref into the
 * preview: it dispatches this event on the preview document (or on any node
 * inside the invitation) and the theme restarts its timeline.
 *
 * ```ts
 * import { replayIntro } from '@/themes/mariage-riviera-postcard';
 * replayIntro(iframe.contentWindow);           // preview in an iframe
 * replayIntro(document.querySelector('.invitation'));  // preview in a container
 * ```
 */
export function replayIntro(target?: EventTarget | null): void {
  const node = target ?? (typeof window === 'undefined' ? null : window);
  node?.dispatchEvent(new CustomEvent(REPLAY_EVENT, { bubbles: true }));
}

export { manifest, Extras, Invitation, REPLAY_EVENT };
export { default as InvitationClient } from './InvitationClient';
export default theme;
