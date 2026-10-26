---
name: write-article
description: >-
  Step-by-step guide and workflow for drafting, translating, testing, and publishing
  new technical articles and documentation guides on the joseoc.dev website.
  Activate this skill whenever the user asks to write, draft, create, or update a new
  article, guide, or documentation post.
---

# Writing Articles for joseoc.dev

This skill outlines the standard workflow, conventions, and quality standards for authoring documentation and guides in this repository.

---

## 1. Core Principles & Conventions

- **Audience**: Developers, DevOps engineers, and system administrators. Write for people first: direct explanations, clear headings, realistic commands, and explanations of *why* each step matters.
- **Bilingual by default**: Every published guide must exist in both English (`src/content/en/`) and Spanish (`src/content/es/`).
- **Identical slug**: Both language versions must share the exact same `slug` frontmatter value (e.g. `how-to/my-tool-guide`) to preserve language switcher routing and SEO `hreflang` tags.
- **CLI flag convention**: In all shell examples and tables, prefer **long flags** over short flags (e.g. `--recipient` instead of `-r`, `--identity` instead of `-i`, `--output` instead of `-o`) whenever the tool supports them.
- **Beginner-friendly glossary**: Always include a glossary section breaking down technical jargon into plain, accessible language for newcomers.
- **Curated command cheat sheet**: Always include a "Most Used Commands" quick reference table for readers who want copy-pasteable commands.

---

## 2. Article Structure Template

Every technical guide should follow this battle-tested structure:

1. **Frontmatter**:
   ```yaml
   ---
   title: "Clear, Actionable Title"
   description: "One-sentence SEO summary for humans and search results."
   date: "YYYY-MM-DD"
   tags: ["tool", "security", "cli", "devops"]
   category: "engineering"
   language: "en" # or "es"
   slug: "how-to/tool-name"
   draft: false
   ---
   ```
2. **Introduction**: What problem does this solve? Why did previous approaches fail or cause friction? Who built it?
3. **Architecture / Workflow Diagram**: A fenced `mermaid` block (`flowchart LR` or `flowchart TD`) showing the process visually.
4. **Tool Comparison & Replacements**: What tools it replaces (e.g., GPG, OpenSSL, ad-hoc scripts) and why, plus a comparison matrix table.
5. **Under the Hood / Primitives**: The foundational design, security models, or algorithms without overwhelming math.
6. **Installation**: Clean install commands for macOS (Homebrew), Debian/Ubuntu (`apt`), Arch (`pacman`), Fedora (`dnf`), Alpine, and source toolchains (Go/Rust/Python).
7. **Hands-on Examples**: Progressive walkthrough from basic usage to advanced real-world workflows:
   - Key generation / initialization.
   - Core operations (encrypting, configuring, running).
   - Multi-user or team workflows.
   - Pipes, UNIX streams, and integrations.
8. **Ecosystem & Modern Adoption**: Where this tool is used today in the industry (e.g., GitOps, SOPS, Kubernetes, dotfiles, hardware tokens).
9. **Deliberate Limitations (What it does NOT do)**: Anti-patterns, non-goals, and boundary conditions so users don't misuse it.
10. **Glossary (Terms in Plain English / Glosario)**: Clear, accessible definitions for newcomers.
11. **Most Used Commands (Quick Reference / Comandos más usados)**: Markdown table summarizing everyday commands.
12. **Conclusion**: Concise wrap-up.

---

## 3. Step-by-Step Publishing Workflow

### Step 1: Branch Creation & Repo Sync
Ensure you are on a clean, dedicated branch:
```bash
git checkout main
git pull origin main
git checkout -b content/<topic-name>
```

### Step 2: Information Gathering & Research
If the article covers a CLI tool, library, or protocol:
- Use Context7 MCP tools (`resolve-library-id` and `query-docs`) to pull authoritative documentation.
- Run `--help` or check man pages locally to verify the exact flags, arguments, and exit behaviors. Confirm which long flags actually exist.

### Step 3: Write the Content
Create the two content files:
- `src/content/en/<category>/<slug>.md`
- `src/content/es/<category>/<slug>.md`

Ensure:
- Both files have the exact same `slug: "<category>/<slug>"`.
- Code blocks specify syntax highlighting languages (e.g. `bash`, `console`, `yaml`, `mermaid`).
- Callouts use GitHub-style alerts: `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`.

### Step 4: Update Sidebar Navigation
Add the new article to [`src/config/sidebar.ts`](file:///Users/jose/code/github/jose-oc/joseoc-dev/src/config/sidebar.ts) in both language sections:
- English section (`en.docs`):
  ```typescript
  { label: '· Title of Article', slug: '<category>/<slug>' },
  ```
- Spanish section (`es.docs`):
  ```typescript
  { label: '· Título del artículo', slug: '<category>/<slug>' },
  ```

### Step 5: Verification & End-to-End Testing
1. **Static Build & Pagefind Indexing**:
   ```bash
   bun run build
   ```
   Verify that:
   - All static pages compile without Astro errors.
   - Raw markdown endpoints are generated under `/raw/<slug>.md` and `/raw/es/<slug>.md`.
   - Pagefind indexes both `en` and `es` content.

2. **Add / Update Playwright E2E Test**:
   In [`tests/e2e.spec.ts`](file:///Users/jose/code/github/jose-oc/joseoc-dev/tests/e2e.spec.ts), add a test to verify that:
   - The English page loads with its main `<h1>`.
   - The language switcher toggles to the Spanish route preserving the slug.
   - The Spanish page loads with its translated `<h1>`.

3. **Run E2E Suite**:
   ```bash
   bun run test:e2e
   ```
