import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://0800zzz.github.io",
  base: "/porfolio.io/",
  output: "static",
  trailingSlash: "always", // usamos URLs con "/" final
  integrations: [tailwind(), sitemap()],
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: { theme: "github-dark", wrap: true },
    extendDefaultPlugins: false,
  },
});
