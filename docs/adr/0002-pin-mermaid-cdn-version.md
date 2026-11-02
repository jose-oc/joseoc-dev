# 0002. Pin the Mermaid CDN version

- Status: Accepted
- Date: 2026-11-02

## Context

`BaseLayout.astro` renders diagrams in the browser by importing Mermaid from jsDelivr as `mermaid@11`, a floating major. Visitors run whatever 11.x jsDelivr resolves that day (11.17.2 on 2026-11-02, cached up to 7 days), and `securityLevel` is `loose`. The Mermaid in `bun.lock` is a different copy, used only by the build step.

## Options considered

1. Keep `mermaid@11`: automatic fixes, but unreviewed code reaches visitors and a bad release lands without any change here.
2. Pin the exact version in the URL (`mermaid@11.17.2`): reviewed updates only, one-line change.
3. Self-host Mermaid from `node_modules` at build time: no third-party request, but a bigger build change and a larger bundle to ship.

## Initial preference

Option 2.

## Critical second pass

Pinning stops silent changes but also stops silent security fixes, so someone has to bump it. A dynamic `import()` cannot carry an SRI hash, so a compromised CDN could still serve altered code for that exact path. Option 3 removes that, but moves a CSP and build change into a small fix. The CSP already allows jsdelivr, so option 2 changes nothing there. 11.17.2 has no advisories in OSV on 2026-11-02, and the five advisories on the lockfile's 11.15.0 are fixed from 11.16.1.

## Decision

Pin `mermaid@11.17.2`, with a comment in the layout. Revisit self-hosting if the CDN becomes a concern.

## Consequences

Diagrams render with a known version. Updating Mermaid is a reviewed one-line PR; check release notes and advisories first. The CDN remains a trusted third party for that path.
