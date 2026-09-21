/**
 * Self-hosted fonts of the "Terracotta Bloom" theme.
 *
 * Loaded from the `@fontsource/*` npm packages, never from the Google Fonts
 * CDN: a CDN request would send every guest's IP address to a third country
 * (phase 1, §1.3.1). All faces are under the OFL.
 *
 * Fraunces carries the warm display type (names, date figures, titles) — the
 * soft-serif answer to the Didone of "Noir & ivoire"; Jost carries everything
 * that has to be read (sentences, labels, form fields). Both are variable
 * faces, so one file covers every weight the theme uses.
 *
 * The three script faces are all loaded because the couple switches between
 * them from the editor; each one is a single 400 weight of ~20 kB.
 */
import '@fontsource-variable/fraunces/wght.css';
import '@fontsource-variable/jost/wght.css';
import '@fontsource/beau-rivage/latin-400.css';
import '@fontsource/windsong/latin-400.css';
import '@fontsource/miss-fajardose/latin-400.css';

export {};
