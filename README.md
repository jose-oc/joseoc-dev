# High-Performance Multilingual IT Documentation Site

This is a custom-built, modern, static documentation website built with [Astro](https://astro.build). It features a sleek Tailwind CSS design system, a fully functional multilingual setup (English/Spanish), and is highly optimized for both human readers and Large Language Models (LLMs).

## 🚀 Project Structure & Core Features

- **Multilingual Content Collections**: Content is authored in Markdown and stored in `src/content/en/` and `src/content/es/`.
- **Aesthetic UI**: Uses Tailwind CSS v4 and the Typography plugin for a premium, developer-centric layout. Features a sticky sidebar, dynamic Table of Contents, and custom tags/categories.
- **LLM Optimization**: Every documentation page automatically serves its raw Markdown counterpart via an API endpoint (`/raw/[lang]/[...slug].md`) and links to it in the HTML `<head>` for easy consumption by AI agents.

## 📝 Content Management Best Practices

### Markdown Alerts (Callouts)
This site supports GitHub-Flavored Markdown alerts for highlighting important information. You can use these to structure your content with visual cues.

**Available Types:**
- `> [!TIP]` - For helpful tips and suggestions
- `> [!NOTE]` - For general information
- `> [!IMPORTANT]` - For critical information
- `> [!WARNING]` - For warnings and cautions
- `> [!CAUTION]` - For potential risks or errors

**Example:**
```markdown
> [!TIP]
> If you are on macOS and already use [Homebrew](/en/docs/macos-setup-guide/base-system-setup-macos), the `brew` method is the fastest way to get started and manage updates automatically.
```

### Hidden Text (Internal Notes)
You can write text that is visible in the raw Markdown source (for your own reference or for LLMs) but is **completely removed** from the generated HTML version.

**Syntax:**
Wrap your text in double percentage signs `%%`.

**Example:**
```markdown
This text is public.
%% This is a hidden note for myself that won't appear on the website. %%
This text is also public.
```

*(This is powered by the custom `remarkHiddenText` plugin in `astro.config.mjs`).*

### Links and Anchors
To create cross-language links that work with the router, use the `{[lang]}` syntax in your Markdown.

**Working Example:**
```markdown
[Homebrew](/en/docs/macos-setup-guide/base-system-setup-macos)
```

**Why this works:**
The Astro i18n router will automatically translate the URL based on the current language context. For instance, when viewing the Spanish version, it will convert `{[lang]}` to `es`, resulting in the correct URL `/es/docs/macos-setup-guide/base-system-setup-macos`.


## 🧭 Routing and Navigation

### How Routing Works
The website dynamically generates URLs for documentation based on the following pattern: `/{language}/docs/{slug}`.

The `{slug}` is determined by a strict priority system to ensure identical translated pages share the exact same URL:
1. **Frontmatter `slug` (Highest Priority)**: If you add `slug: "my-custom-url"` to the frontmatter of your Markdown file, Astro will use that exact string. **Best Practice:** Use the same `slug` for the English and Spanish versions of the same article.
2. **File Path (Fallback)**: If no slug is defined in the frontmatter, the router falls back to the physical file path. For example, `src/content/en/python/setup.md` becomes `/en/docs/python/setup`.

*(The routing logic is defined in `src/pages/[lang]/docs/[...slug].astro`).*

### Upper Menu Links
The main header (`src/components/Header.astro`) uses the active language context (`lang`) to ensure you never accidentally jump to the wrong language when navigating globally:
- **Home (`/{lang}/`)**: Links to the localized landing page.
- **Docs (`/{lang}/docs`)**: Links to a smart index page (`src/pages/[lang]/docs/index.astro`) which automatically redirects the user to the very first documentation article listed in your sidebar configuration.
- **Blog (`/{lang}/blog`)**: Reserved for future blog post integration.

### Sidebar Configuration
The left sidebar is fully under your manual control. To add, reorder, or rename documentation sections, simply edit the `src/config/sidebar.ts` file. 

## 🧪 Testing

To ensure the website functions flawlessly and has no broken links, we use two separate testing frameworks.

### 1. Linkinator (Static Link Checker)
Linkinator crawls the statically built HTML files and checks every single `<a href="...">` tag to ensure there are no dead links or 404 errors.
- **Command**: `npm run test:links`
- **What it does**: Builds the production site (`npm run build`) and then aggressively scans `./dist` for broken links. Perfect for running in CI/CD before deployment.

### 2. Playwright (Headless Browser E2E)
Playwright spins up a headless Chromium browser, runs the dev server, and interacts with the website exactly like a human user would. 
- **Command**: `npm run test:e2e`
- **What it does**: It runs the test suite located in `tests/e2e.spec.ts`.
- **Coverage**:
  - Verifies the Home and Docs links redirect correctly.
  - Clicks the Language Switcher and verifies that the URL language changes while preserving the article slug.
  - Triggers a deliberate 404 to ensure our custom `src/pages/404.astro` page loads correctly.
  - Validates that SEO `<link rel="alternate" hreflang="X">` tags are correctly generated in the HTML `<head>`.

### Run All Tests
```bash
# Run both the link crawler and the E2E browser tests sequentially
npm run test
```

## 🧞 Commands

All standard Astro commands are available from the root of the project:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run test`            | Run all tests (links + e2e)                      |
