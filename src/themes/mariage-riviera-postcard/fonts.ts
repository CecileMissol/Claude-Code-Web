/**
 * Self-hosted fonts of the "Riviera Postcard" theme.
 *
 * Loaded from the `@fontsource/*` npm packages, never from the Google Fonts
 * CDN: a CDN request would send every guest's IP address to a third country
 * (phase 1, §1.3.1). Latin subsets only, all faces under the OFL.
 *
 * Bodoni Moda carries the travel-poster display type (names, dates, tile
 * numerals); Outfit carries everything that has to be read (sentences, form
 * labels, practical details). The three script faces are all loaded because the
 * couple switches between them from the editor; each is a single 400 weight of
 * ~20 kB.
 */
import '@fontsource/bodoni-moda/latin-400.css';
import '@fontsource/bodoni-moda/latin-500.css';
import '@fontsource/bodoni-moda/latin-400-italic.css';
import '@fontsource-variable/outfit/wght.css';
import '@fontsource/playball/latin-400.css';
import '@fontsource/alex-brush/latin-400.css';
import '@fontsource/yellowtail/latin-400.css';

export {};
