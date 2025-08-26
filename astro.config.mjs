import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://0800zzz.github.io',
  base: '/porfolio.io',
  output: 'static',
  integrations: [mdx()],   // <— CLAVE
});
