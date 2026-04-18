# Personal Website (Astro + TailwindCSS + Pagefind)

This is a modern, high-performance personal website focused on DevOps, AI, and Linux.

## 🚀 Features

- **Astro 6**: Latest version for blazing fast performance.
- **TailwindCSS 4**: Minimalist and responsive design.
- **Multi-language**: Built-in support for English (`/en/`) and Spanish (`/es/`).
- **Markdown-first**: Content authored in Markdown with dual HTML/Markdown output.
- **Search**: Fully static local search powered by **Pagefind**.
- **SEO Optimized**: Canonical URLs, hreflang tags, sitemap, and Open Graph meta tags.
- **Dark Mode**: Support for system preference.

## 🛠️ Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Build and index for search**:
   ```bash
   npm run build
   ```

4. **Preview the production build**:
   ```bash
   npm run preview
   ```

## 📦 Deployment (Vercel)

This project is configured for easy deployment on Vercel.

1. Connect your GitHub repository to Vercel.
2. Vercel will automatically detect the Astro project.
3. Ensure the Build Command is `npm run build`.
4. Deployment will be static by default.

## 📁 Project Structure

- `src/content/en/`: English blog posts.
- `src/content/es/`: Spanish blog posts.
- `src/pages/`: Website pages and routing.
- `src/layouts/`: Base HTML layouts.
- `src/styles/`: Global styles and Tailwind configuration.
- `src/content.config.ts`: Content collection definitions.

## 📝 Authoring Content

Create new posts in `src/content/en/` or `src/content/es/` with the following frontmatter:

```markdown
---
title: "My Post Title"
description: "A short description"
date: "2026-04-18"
tags: ["devops", "ai"]
category: "engineering"
language: "en"
slug: "my-post-title"
relatedSlug: "titulo-de-mi-post" # Optional: slug of the translation
---
```
