# Repository Guidelines

## Project Structure & Module Organization
This repository is an Astro-based multilingual documentation site. Application code lives in `src/`: reusable UI in `src/components/`, layouts in `src/layouts/`, route files in `src/pages/`, and shared settings in `src/config/`. Documentation content lives in `src/content/en/` and `src/content/es/`; blog content lives in `src/content/blog/`. Static assets such as images and icons belong in `src/assets/` or `public/`. End-to-end and SEO tests live in `tests/`.

## Build, Test, and Development Commands
Use Bun or Node `>=24` as declared in `package.json`.

- `bun install`: install dependencies.
- `bun run dev`: start the local Astro dev server on `http://localhost:4321`.
- `bun run build`: clean `dist/`, build the site, and index it with Pagefind.
- `bun run preview`: serve the production build locally.
- `bun run test:links`: build the site and crawl `dist/` for broken links with Linkinator.
- `bun run test:e2e`: run Playwright tests against a local server on port `4325`.
- `bun run test`: run link and browser tests together.

## Coding Style & Naming Conventions
Follow the existing style: ESM modules, TypeScript where configured, and 2-space indentation in `.ts`, `.mjs`, and Astro frontmatter. Keep components in PascalCase, for example `Header.astro`; keep content slugs lowercase and URL-safe, for example `python-environment-direnv.md`. Prefer small, focused components and keep shared site constants in `src/config/`. There is no dedicated lint script here, so match surrounding formatting exactly.

## Testing Guidelines
Add or update Playwright coverage for routing, language switching, taxonomy pages, and SEO metadata when behavior changes. Keep test files in `tests/` and name them `*.spec.ts`. Run `npm run test` before opening a PR; at minimum, run `npm run test:e2e` for UI or routing changes and `npm run test:links` when editing content or navigation.

## Commit & Pull Request Guidelines
Recent history mixes concise fixes (`content grammar`) with Conventional Commit style such as `feat(seo): ...`. Prefer short, imperative commit messages and use a scope when it adds clarity, for example `feat(routing): preserve localized doc slugs`. PRs should explain the user-visible change, list validation performed, and link related issues. Include screenshots for layout or styling changes.

## Content & SEO Notes
Keep English and Spanish article pairs aligned on the same slug when they represent the same page. When editing metadata or routing, verify canonical links, `hreflang` tags, and raw Markdown endpoints under `/raw/`.

## Adding New Content
Add documentation pages under `src/content/en/` and `src/content/es/`. Publish content in both languages when the topic is meant to exist in both locales, and keep the same `slug` in each file so language switching and SEO metadata stay aligned. Use `src/content/*/drafts/` with `draft: true` for work that should not be treated as published.

Use frontmatter consistently:

```md
---
title: "Clear page title"
description: "One-sentence summary for humans and search results."
tags: ["python", "automation", "cli"]
category: "engineering"
slug: "python/my-topic"
draft: false
---
```

`title` and `description` should be specific and readable. `description` is especially important for SEO because it feeds search snippets and page metadata. Choose tags people will actually search or browse for, keep them concise, and reuse existing terminology when possible. Use `category` only when the article clearly fits an existing grouping.

If the page should appear in the docs navigation, update `src/config/sidebar.ts` for both `en` and `es`. Add the new item to the right section, keep labels short, and point `slug` to the frontmatter slug. If the content should not appear in the sidebar yet, leave the file out of that config.

When adding, renaming, moving, or deleting published docs, also remove or update the corresponding sidebar entries so navigation does not point to stale slugs. If you introduce a new docs section, add the section in both languages and keep the structure aligned unless there is a clear reason not to.

After content or navigation changes, prefer running `bun run build` to catch broken routes, raw Markdown endpoint issues, and content rendering problems before finishing.

Write for people first. Use short paragraphs, descriptive headings, working examples, and direct explanations of why a command or step matters. Prefer standard Markdown: headings, lists, fenced code blocks with language labels, tables only when they improve scanning, and links with meaningful text. Use callouts for emphasis with GitHub-style alerts such as `> [!TIP]`, `> [!NOTE]`, and `> [!WARNING]`. Use Mermaid diagrams with fenced `mermaid` blocks when a flow or architecture is easier to understand visually.

Embed images with clear alt text and store assets under `src/assets/` when they belong to the article set. Use screenshots only when they add instructional value; crop them tightly and keep them readable. If you embed video-like assets or terminal recordings, make sure they support the explanation instead of replacing it. Every visual should have surrounding text that explains what the reader is looking at and why it matters.
