import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://0800zzz.github.io",
  base: "/porfolio.io/",
  integrations: [tailwind()],
});
