# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Routing and Navigation >> Docs link in header redirects to first documentation article
- Location: tests/e2e.spec.ts:14:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('main h1')
Expected substring: "macOS"
Received string:    " Setting Up a New Mac: The Complete Developer Guide "
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('main h1')
    9 × locator resolved to <h1 class="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-surface-50 mb-4 tracking-tight"> Setting Up a New Mac: The Complete Developer Gui…</h1>
      - unexpected value " Setting Up a New Mac: The Complete Developer Guide "

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - link "joseweb" [ref=e5] [cursor=pointer]:
          - /url: /en/
        - navigation [ref=e6]:
          - link "Home" [ref=e7] [cursor=pointer]:
            - /url: /en/
          - link "Docs" [ref=e8] [cursor=pointer]:
            - /url: /en/docs
          - link "Blog" [ref=e9] [cursor=pointer]:
            - /url: /en/blog
      - link "Switch to Spanish" [ref=e11] [cursor=pointer]:
        - /url: /es/docs/macos-setup-guide
        - img [ref=e12]
        - generic [ref=e16]: en
  - main [ref=e17]:
    - generic [ref=e18]:
      - complementary [ref=e19]:
        - navigation [ref=e20]:
          - generic [ref=e21]:
            - heading "macOS Setup Guide" [level=3] [ref=e22]
            - list [ref=e23]:
              - listitem [ref=e24]:
                - link "Introduction" [ref=e25] [cursor=pointer]:
                  - /url: /en/docs/macos-setup-guide
              - listitem [ref=e26]:
                - link "Base System Setup" [ref=e27] [cursor=pointer]:
                  - /url: /en/docs/01-base-system-setup-macos
              - listitem [ref=e28]:
                - link "Terminal Setup" [ref=e29] [cursor=pointer]:
                  - /url: /en/docs/02-terminal-setup-macos
              - listitem [ref=e30]:
                - link "SSH & Authentication" [ref=e31] [cursor=pointer]:
                  - /url: /en/docs/03-ssh-and-authentication
              - listitem [ref=e32]:
                - link "Git & Version Control" [ref=e33] [cursor=pointer]:
                  - /url: /en/docs/04-git-and-version-control
              - listitem [ref=e34]:
                - link "Shell CLI Tooling" [ref=e35] [cursor=pointer]:
                  - /url: /en/docs/05-shell-cli-tooling
              - listitem [ref=e36]:
                - link "Shell Usability" [ref=e37] [cursor=pointer]:
                  - /url: /en/docs/06-shell-usability-improvements
              - listitem [ref=e38]:
                - link "Prompt & UX" [ref=e39] [cursor=pointer]:
                  - /url: /en/docs/07-prompt-and-ux
              - listitem [ref=e40]:
                - link "Secrets & Environment" [ref=e41] [cursor=pointer]:
                  - /url: /en/docs/08-secrets-and-environment-management
              - listitem [ref=e42]:
                - link "Python & Automation" [ref=e43] [cursor=pointer]:
                  - /url: /en/docs/09-python-and-automation-tooling
              - listitem [ref=e44]:
                - link "Kubernetes & DevOps" [ref=e45] [cursor=pointer]:
                  - /url: /en/docs/10-kubernetes-and-devops-tooling
              - listitem [ref=e46]:
                - link "Neovim Setup" [ref=e47] [cursor=pointer]:
                  - /url: /en/docs/11-editor-setup-neovim
              - listitem [ref=e48]:
                - link "Dotfiles" [ref=e49] [cursor=pointer]:
                  - /url: /en/docs/12-dotfiles-and-reproducibility
          - generic [ref=e50]:
            - heading "Python" [level=3] [ref=e51]
            - list [ref=e52]:
              - listitem [ref=e53]:
                - link "Environment with direnv" [ref=e54] [cursor=pointer]:
                  - /url: /en/docs/python-environment-direnv
          - generic [ref=e55]:
            - heading "Drafts" [level=3] [ref=e56]
            - list [ref=e57]:
              - listitem [ref=e58]:
                - link "Configure DNS" [ref=e59] [cursor=pointer]:
                  - /url: /en/docs/configure-dns-servers
              - listitem [ref=e60]:
                - link "Configure Wifi (LLM Notes)" [ref=e61] [cursor=pointer]:
                  - /url: /en/docs/configure-wifi-llm-notes-draft
              - listitem [ref=e62]:
                - link "Neovim" [ref=e63] [cursor=pointer]:
                  - /url: /en/docs/neovim
              - listitem [ref=e64]:
                - link "Personal Performance" [ref=e65] [cursor=pointer]:
                  - /url: /en/docs/personal-performance
              - listitem [ref=e66]:
                - link "Tmux" [ref=e67] [cursor=pointer]:
                  - /url: /en/docs/tmux
              - listitem [ref=e68]:
                - link "Virtualization" [ref=e69] [cursor=pointer]:
                  - /url: /en/docs/virtualization
      - article [ref=e70]:
        - generic [ref=e71]:
          - generic [ref=e72]: engineering
          - 'heading "Setting Up a New Mac: The Complete Developer Guide" [level=1] [ref=e73]'
          - paragraph [ref=e74]: A comprehensive, 12-part series on automating and optimizing your macOS development environment for DevOps, AI, and performance.
          - generic [ref=e75]:
            - generic [ref=e76]: "#macos"
            - generic [ref=e77]: "#setup"
            - generic [ref=e78]: "#guide"
            - generic [ref=e79]: "#devops"
            - generic [ref=e80]: "#automation"
        - generic [ref=e81]:
          - paragraph [ref=e82]: Setting up a new development machine can be a daunting task. This series aims to transform that process into a fast, reproducible, and documented workflow. From base system automation to advanced shell customization and infrastructure as code for your dotfiles, this guide covers everything you need to build a premium developer workstation.
          - blockquote [ref=e83]:
            - paragraph [ref=e84]:
              - text: "[!TIP]"
              - strong [ref=e85]: Already have your dotfiles ready?
              - text: If you have already followed this guide once and just need to set up a brand new Mac, jump straight to
              - link "Setting Up a New Mac in One Command" [ref=e86] [cursor=pointer]:
                - /url: dotfiles-and-reproducibility#5-setting-up-a-new-mac-in-one-command
              - text: .
          - heading "The Foundations" [level=2] [ref=e87]
          - list [ref=e88]:
            - listitem [ref=e89]:
              - paragraph [ref=e90]:
                - strong [ref=e91]:
                  - 'link "Automating macOS Setup: Homebrew, Brewfile, and Essential CLI Tools" [ref=e92] [cursor=pointer]':
                    - /url: base-system-setup-macos
                - text: The foundation of any modern macOS setup. Learn how to use Homebrew to manage your entire system as code.
            - listitem [ref=e93]:
              - paragraph [ref=e94]:
                - strong [ref=e95]:
                  - 'link "Choosing and Configuring the Best Terminal for macOS: Ghostty vs iTerm2" [ref=e96] [cursor=pointer]':
                    - /url: terminal-setup-macos
                - text: Your terminal is your home. We compare the fastest modern options and set them up for peak performance.
            - listitem [ref=e97]:
              - paragraph [ref=e98]:
                - strong [ref=e99]:
                  - 'link "Securing Your Identity: SSH Keys, GPG, and 1Password on macOS" [ref=e100] [cursor=pointer]':
                    - /url: ssh-and-authentication
                - text: Security shouldn’t be a hurdle. Integrate 1Password with SSH and GPG for a seamless, secure workflow.
          - heading "Productivity & Workflow" [level=2] [ref=e101]
          - list [ref=e102]:
            - listitem [ref=e103]:
              - paragraph [ref=e104]:
                - strong [ref=e105]:
                  - 'link "Advanced Git Configuration: Productivity, Security, and Global Ignores" [ref=e106] [cursor=pointer]':
                    - /url: git-and-version-control
                - text: Go beyond
                - code [ref=e107]: git commit
                - text: . Configure delta pagers, aliases, and global hooks.
            - listitem [ref=e108]:
              - paragraph [ref=e109]:
                - strong [ref=e110]:
                  - 'link "The Modern DevOps Toolkit: Essential CLI Tools for macOS" [ref=e111] [cursor=pointer]':
                    - /url: shell-cli-tooling
                - text: A curated list of modern replacements for legacy Unix tools (ripgrep, fd, bat, and more).
            - listitem [ref=e112]:
              - paragraph [ref=e113]:
                - strong [ref=e114]:
                  - 'link "Supercharging Shell Usability: FZF, Zsh Completions, and Modular Config" [ref=e115] [cursor=pointer]':
                    - /url: shell-usability-improvements
                - text: Make your shell feel alive with fuzzy finding and intelligent autocompletion.
            - listitem [ref=e116]:
              - paragraph [ref=e117]:
                - strong [ref=e118]:
                  - 'link "Crafting the Ultimate Terminal Prompt with Starship: Fast and Context-Aware" [ref=e119] [cursor=pointer]':
                    - /url: prompt-and-ux
                - text: The only prompt you’ll ever need. Minimalist, fast, and cross-shell compatible.
          - heading "Environment & Tooling" [level=2] [ref=e120]
          - list [ref=e121]:
            - listitem [ref=e122]:
              - paragraph [ref=e123]:
                - strong [ref=e124]:
                  - 'link "Managing Secrets and Environments on macOS: 1Password CLI and Direnv" [ref=e125] [cursor=pointer]':
                    - /url: secrets-and-environment-management
                - text: Automate environment variables based on your current directory without leaking secrets.
            - listitem [ref=e126]:
              - paragraph [ref=e127]:
                - strong [ref=e128]:
                  - 'link "Modern Python Development on macOS: Fast and Isolated with UV" [ref=e129] [cursor=pointer]':
                    - /url: python-and-automation-tooling
                - text: Ditch
                - code [ref=e130]: pip
                - text: and
                - code [ref=e131]: conda
                - text: . Learn how
                - code [ref=e132]: uv
                - text: makes Python development instantaneous and reproducible.
            - listitem [ref=e133]:
              - paragraph [ref=e134]:
                - strong [ref=e135]:
                  - 'link "The Cloud-Native Engineer’s Toolkit: Kubernetes, Terraform, and Helm on macOS" [ref=e136] [cursor=pointer]':
                    - /url: kubernetes-and-devops-tooling
                - text: Setting up the essentials for cloud infrastructure and container orchestration.
          - heading "Advanced Setup" [level=2] [ref=e137]
          - list [ref=e138]:
            - listitem [ref=e139]:
              - paragraph [ref=e140]:
                - strong [ref=e141]:
                  - 'link "The Ultimate Neovim Setup for DevOps Engineers: Speed and Precision" [ref=e142] [cursor=pointer]':
                    - /url: editor-setup-neovim
                - text: A deep dive into why Neovim is the ultimate editor for high-performance engineering.
            - listitem [ref=e143]:
              - paragraph [ref=e144]:
                - strong [ref=e145]:
                  - 'link "Infrastructure as Code for Your Mac: Managing Dotfiles with Chezmoi" [ref=e146] [cursor=pointer]':
                    - /url: dotfiles-and-reproducibility
                - text: The final piece of the puzzle. Synchronize your entire setup across machines using Git and Chezmoi.
          - separator [ref=e147]
          - heading "What’s Next?" [level=3] [ref=e148]
          - paragraph [ref=e149]:
            - text: Once you’ve completed this series, your Mac will be a finely tuned instrument. You can find more specific guides in the
            - link "engineering category" [ref=e150] [cursor=pointer]:
              - /url: /en/category/engineering
            - text: or explore my
            - link "latest posts" [ref=e151] [cursor=pointer]:
              - /url: /en/blog
            - text: .
      - complementary [ref=e152]:
        - heading "On this page" [level=3] [ref=e153]
        - list [ref=e154]:
          - listitem [ref=e155]:
            - link "The Foundations" [ref=e156] [cursor=pointer]:
              - /url: "#the-foundations"
          - listitem [ref=e157]:
            - link "Productivity & Workflow" [ref=e158] [cursor=pointer]:
              - /url: "#productivity--workflow"
          - listitem [ref=e159]:
            - link "Environment & Tooling" [ref=e160] [cursor=pointer]:
              - /url: "#environment--tooling"
          - listitem [ref=e161]:
            - link "Advanced Setup" [ref=e162] [cursor=pointer]:
              - /url: "#advanced-setup"
          - listitem [ref=e163]:
            - link "What’s Next?" [ref=e164] [cursor=pointer]:
              - /url: "#whats-next"
  - contentinfo [ref=e165]: © 2026 Jose.
  - generic [ref=e168]:
    - button "Menu" [ref=e169]:
      - img [ref=e171]
      - generic: Menu
    - button "Inspect" [ref=e175]:
      - img [ref=e177]
      - generic: Inspect
    - button "Audit" [ref=e179]:
      - img [ref=e181]
      - generic: Audit
    - button "Settings" [ref=e184]:
      - img [ref=e186]
      - generic: Settings
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Routing and Navigation', () => {
  4  | 
  5  |   test('Home page redirects correctly or serves index', async ({ page }) => {
  6  |     // Go to root, which redirects to /en/
  7  |     await page.goto('/');
  8  |     await expect(page).toHaveURL(/.*\/en\//);
  9  |     const heading = page.locator('main h1');
  10 |     await expect(heading).toBeVisible();
  11 |     await expect(heading).not.toContainText('404');
  12 |   });
  13 | 
  14 |   test('Docs link in header redirects to first documentation article', async ({ page }) => {
  15 |     await page.goto('/en/');
  16 |     // Click the "Docs" link in the header nav
  17 |     await page.click('nav >> text=Docs');
  18 |     // Wait for URL to update to the first doc slug (macos-setup-guide)
  19 |     await expect(page).toHaveURL(/.*\/en\/docs\/macos-setup-guide/);
  20 |     const heading = page.locator('main h1');
  21 |     await expect(heading).toBeVisible();
> 22 |     await expect(heading).toContainText('macOS');
     |                           ^ Error: expect(locator).toContainText(expected) failed
  23 |   });
  24 | 
  25 |   test('404 page is displayed for invalid routes', async ({ page }) => {
  26 |     const response = await page.goto('/en/invalid-fake-route');
  27 |     // Note: Astro dev server might return 404 status, or static might return 404.html
  28 |     expect(response?.status()).toBe(404);
  29 |     const heading = page.locator('h1').first();
  30 |     await expect(heading).toHaveText('404');
  31 |     await expect(page.locator('text=Page not found')).toBeVisible();
  32 |   });
  33 | 
  34 | });
  35 | 
  36 | test.describe('Language Switcher & SEO', () => {
  37 | 
  38 |   test('Language switcher toggles correctly while preserving the slug', async ({ page }) => {
  39 |     // Go to a specific English doc
  40 |     await page.goto('/en/docs/python-environment-direnv');
  41 |     
  42 |     // Find the language switcher (it currently displays "EN" and clicking switches to ES)
  43 |     const langSwitcher = page.locator('a[aria-label="Switch to Spanish"]');
  44 |     await expect(langSwitcher).toBeVisible();
  45 |     
  46 |     // Click to switch language
  47 |     await langSwitcher.click();
  48 |     
  49 |     // Verify the URL changed to /es/ but kept the same slug
  50 |     await expect(page).toHaveURL(/.*\/es\/docs\/python-environment-direnv/);
  51 |     
  52 |     // The language switcher should now display "ES" and aria-label should point back to English
  53 |     const englishSwitcher = page.locator('a[aria-label="Switch to English"]');
  54 |     await expect(englishSwitcher).toBeVisible();
  55 |   });
  56 | 
  57 |   test('SEO hreflang tags are generated for documentation pages', async ({ page }) => {
  58 |     await page.goto('/en/docs/python-environment-direnv');
  59 |     
  60 |     // Check that hreflang tags exist in the <head>
  61 |     const enTag = page.locator('link[hreflang="en"]');
  62 |     await expect(enTag).toHaveAttribute('href', '/en/docs/python-environment-direnv');
  63 | 
  64 |     const esTag = page.locator('link[hreflang="es"]');
  65 |     await expect(esTag).toHaveAttribute('href', '/es/docs/python-environment-direnv');
  66 |   });
  67 | 
  68 | });
  69 | 
```