import theme from '@/themes/mariage-noir-ivoire';
import demo from '@/themes/mariage-noir-ivoire/demo.json';
import { demoMetadata, renderDemo } from '../demoPage';

/** `/demo/mariage-noir-ivoire` — public showcase, rendered from the theme's own `demo.json`. */
export const metadata = demoMetadata(theme);

export default function Page() {
  return renderDemo(theme, demo);
}
