import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),          // acepta string y lo convierte a Date
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),  // ruta a imagen (public/ o relativa)
    draft: z.boolean().default(false), // si true, lo podés ocultar en el listado
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
