import type { ThemeModule } from '../types';
import { manifest } from './manifest';
import { Extras } from './schema';
import Invitation from './Invitation';

/** Public entry point of the "Noir & ivoire" theme, loaded by the registry. */
const theme: ThemeModule = { manifest, Extras, Invitation };

export { manifest, Extras, Invitation };
export default theme;
