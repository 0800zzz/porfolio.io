import { defineCollection, glob } from "astro:content";

// ✅ carga .md y .mdx dentro de /src/content/blog
const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
});

export const collections = { blog };
