---
title: "HTB — Bashed (Linux, Easy)"
description: "Foothold con phpbash, privesc por cron."
pubDate: "2025-08-20"
tags: ["HTB", "linux", "privesc"]
---

## Recon
```bash
nmap -sV -sC 10.10.10.68


# 3) Página de detalle del post
**`src/pages/blog/[slug].astro`**
```astro
---
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map((p) => ({
    params: { slug: p.slug ?? p.id.split("/").pop() },
    props: { post: p },
  }));
}

const { post } = Astro.props;
---

<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>{post.data.title}</title>
    <meta name="description" content={post.data.description} />
  </head>
  <body class="bg-black text-white">
    <main class="mx-auto max-w-3xl px-4 py-10 prose prose-invert">
      <h1 class="font-mono text-3xl text-emerald-400">{post.data.title}</h1>
      <p class="text-sm text-white/60">
        {new Date(post.data.pubDate).toLocaleDateString()}
      </p>
      <article set:html={post.body} />
    </main>
  </body>
</html>
