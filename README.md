# High-Performance Multilingual IT Documentation Site

This is a custom-built, modern, static documentation website built with [Astro](https://astro.build). It features a sleek Tailwind CSS design system, a fully functional multilingual setup (English/Spanish), and is highly optimized for both human readers and Large Language Models (LLMs).

## 🚀 Project Structure & Core Features

- **Multilingual Content Collections**: Content is authored in Markdown and stored in `src/content/en/` and `src/content/es/`.
- **Aesthetic UI**: Uses Tailwind CSS v4 and the Typography plugin for a premium, developer-centric layout. Features a sticky sidebar, dynamic Table of Contents, and custom tags/categories.
- **LLM Optimization**: Every documentation page automatically serves its raw Markdown counterpart via an API endpoint (`/raw/[lang]/[...slug].md`) and links to it in the HTML `<head>` for easy consumption by AI agents.
- **Privacy First**: Zero cookies, zero tracking, and no external analytics. User preferences are stored locally in the browser.

## 🔒 Privacy & Cookies

This site is designed to be **privacy-respecting by default**:
- **No Cookies**: We do not use any cookies.
- **No Tracking**: No Google Analytics, no pixels, and no third-party tracking scripts.
- **Functional Local Storage**: We use `localStorage` exclusively to remember your UI preferences (Theme, Focus Mode, and Font Size). This data never leaves your device.
- **Hosting**: Hosted on Vercel, which may collect standard server logs for security purposes.

*(Full details can be found on the [Privacy Policy](https://joseoc.dev/en/privacy) page).*

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
- **Command**: `bun run test:links`
- **What it does**: Builds the production site (`bun run build`) and then aggressively scans `./dist` for broken links. Perfect for running in CI/CD before deployment.

### 2. Playwright (Headless Browser E2E)
Playwright spins up a headless Chromium browser, runs the dev server, and interacts with the website exactly like a human user would. 
- **Command**: `bun run test:e2e`
- **What it does**: It runs the test suite located in `tests/e2e.spec.ts`.
- **Coverage**:
  - Verifies the Home and Docs links redirect correctly.
  - Clicks the Language Switcher and verifies that the URL language changes while preserving the article slug.
  - Triggers a deliberate 404 to ensure our custom `src/pages/404.astro` page loads correctly.
  - Validates that SEO `<link rel="alternate" hreflang="X">` tags are correctly generated in the HTML `<head>`.

### 3. SEO Metadata Audits
This suite ensures that your site remains search-engine friendly and optimized for AI agents.
- **Command**: `bunx playwright test tests/seo.spec.ts`
- **What it does**:
  - Verifies every page has a valid `<title>` and `<meta name="description">`.
  - Ensures `<link rel="canonical">` tags point to the production domain.
  - Checks that `hreflang` tags are correctly generated for multilingual cross-linking.
  - Confirms the presence of the hidden Markdown link for AI agents.

### 4. Lighthouse Audits
We use Google Lighthouse to ensure high performance and perfect SEO scores.
- **Local Audit**: 
  1. Build the site: `bun run build`
  2. Run the audit using the shared config: `bunx @lhci/cli collect --config=./.lighthouserc.json`
- **CI/CD**: This runs automatically on every Pull Request via GitHub Actions using the same `.lighthouserc.json`.

### Run All Tests
```bash
# Run link crawler, E2E browser tests, and SEO audits
bun run test
```

## 🧞 Commands

All standard Astro commands are available from the root of the project:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `bun install`             | Installs dependencies                            |
| `bun run dev`             | Starts local dev server at `localhost:4321`      |
| `bun run build`           | Build your production site to `./dist/`          |
| `bun run preview`         | Preview your build locally, before deploying     |
| `bun run test`            | Run all tests (links + e2e)                      |
