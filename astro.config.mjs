import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "http://localhost:4321/",
  integrations: [tailwind()],
  vite: { server: { port: 4321 } }
});
