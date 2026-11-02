# 0001. Update dependencies inside their declared ranges; majors in their own PR

- Status: Accepted
- Date: 2026-11-02

## Context

`bun audit` reported 107 advisories on the lockfile, mostly in build and test tooling (vite dev server, undici, brace-expansion, fast-uri, js-yaml and others). The site is generated as static HTML by Astro and served from Vercel, so the build tools matter more than a server runtime. Direct dependencies were behind inside their ranges (pagefind, lighthouse, playwright, unist-util-visit).

## Options considered

1. Leave the lockfile as it is: no work, but known advisories stay and build tools run old code.
2. Run `bun update` (in-range only) and check the result: small change, reversible, no API changes expected.
3. Cross major versions (Astro 7, @astrojs/mdx 8, linkinator 8): fixes more advisories, but changes behavior and needs its own review.

## Initial preference

Option 2 now, option 3 separately.

## Critical second pass

In-range updates can still break the build or the Playwright suite, and some advisories only have fixes in a major (Astro <7.2.8, sharp <0.35). Option 2 will not clear those. Taking the Astro major inside a security PR would mix concerns and hide regressions, so those stay open and visible instead of being forced.

## Decision

Run `bun update`, keep `package.json` ranges as declared (carets move up to the installed minimums), and validate with `bun run build`, `bun run test:e2e` and `bun run test:links`. Majors get their own PR with an ADR.

## Consequences

Advisories drop from 107 to 15. The remaining 15 are Astro 6 (fixed only in 7.x), sharp, compression, esbuild, glob, katex, minimatch and postcss-selector-parser; a bundled or pinned version blocks them or they await a compatible release. The Astro 7 upgrade needs its own review. This does not make the site immune: a compromised build dependency can still alter the generated output.
