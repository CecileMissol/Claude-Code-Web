import theme from '@/themes/mariage-terracotta-bloom';
import demo from '@/themes/mariage-terracotta-bloom/demo.json';
import { demoMetadata, renderDemo } from '../demoPage';

/** `/demo/mariage-terracotta-bloom` — public showcase, rendered from the theme's own `demo.json`. */
export const metadata = demoMetadata(theme);

export default function Page() {
  return renderDemo(theme, demo);
}
