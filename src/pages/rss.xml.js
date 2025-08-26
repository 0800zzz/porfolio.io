import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = await getCollection("blog");
  return rss({
    title: "porfolio.io",
    description: "Blog y writeups",
    site: context.site, // usa el 'site' de astro.config.mjs
    items: posts.map((p) => ({
      link: `blog/${p.slug ?? p.id.split("/").pop()}/`,
      title: p.data.title,
      pubDate: p.data.pubDate,
      description: p.data.description,
    })),
  });
}
