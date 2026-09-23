import theme from '@/themes/mariage-riviera-postcard';
import demo from '@/themes/mariage-riviera-postcard/demo.json';
import { demoMetadata, renderDemo } from '../demoPage';

/** `/demo/mariage-riviera-postcard` — public showcase, rendered from the theme's own `demo.json`. */
export const metadata = demoMetadata(theme);

export default function Page() {
  return renderDemo(theme, demo);
}
