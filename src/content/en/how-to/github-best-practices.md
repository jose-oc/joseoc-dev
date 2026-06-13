---
title: "GitHub Best Practices for Public Repositories"
description: "An introduction to branch rulesets, clean merges, and private vulnerability reporting using the GitHub CLI."
date: "2026-06-13"
tags: ["github", "git", "devops", "security", "best-practices"]
category: "engineering"
language: "en"
slug: "how-to/github-best-practices"
draft: false
---

When you make a GitHub repository public, it changes from a private sandbox into a public storefront. Good repository hygiene is essential: it protects your stable code from accidental pushes, ensures clean history, and sets up a secure reporting line for security vulnerabilities.

Instead of navigating the web settings interface, we can automate these configurations using the **GitHub CLI (`gh`)** tool.

Here is a practical guide to the best settings to enable on a public GitHub repository, how they work, and the exact commands to configure them.

---

## 1. Automatic Branch Cleanup on Merge

Every time you merge a Pull Request, the feature branch remains in your repository as a "stale branch." Over time, this results in hundreds of dead branches, making it difficult to find active work.

You can configure GitHub to delete the head branch automatically as soon as a PR is merged:

```bash
gh repo edit OWNER/REPO --delete-branch-on-merge
```

### Why it matters
*   **Zero maintenance**: It keeps your repository branch list clean without manual cleanup.
*   **Clear status**: Developers immediately see which branches have already been integrated.

---

## 2. Smooth Pull Request Updates

When multiple Pull Requests are open, a branch can fall behind the `main` branch. This often forces developers to manually pull, merge, and push just to make the branch eligible for merging.

By enabling branch updates, GitHub adds a simple "Update branch" button directly in the PR interface:

```bash
gh repo edit OWNER/REPO --allow-update-branch
```

### Why it matters
*   **Frictionless merging**: If `main` moves forward, the author can update their PR branch directly from the web UI.
*   **Testing consistency**: It guarantees that the code is tested against the latest version of the target branch before merging.

---

## 3. Protecting the Main Branch with Rulesets

Historically, GitHub protected branches using *Branch Protection Rules*. Today, GitHub recommends using **Repository Rulesets**. Rulesets are more flexible, evaluate faster, and can be applied across multiple branches easily.

We want to protect the `main` branch by:
1.  Blocking direct pushes (requiring all changes to go through a Pull Request).
2.  Blocking branch deletion.
3.  Blocking force pushes (which rewrite git history).
4.  Requiring all comment threads to be resolved before merging.

To do this via the CLI, first create a local JSON file named `ruleset.json`:

```json
{
  "name": "Protect main branch",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/main"],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "deletion"
    },
    {
      "type": "non_fast_forward"
    },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true
      }
    }
  ]
}
```

Then, submit it to the GitHub API:

```bash
gh api -X POST /repos/OWNER/REPO/rulesets --input ruleset.json
```

---

## 4. Enabling Private Vulnerability Reporting

If a security researcher finds a bug on your public site or repository, publishing it in a public Issue is dangerous because attackers can exploit it before you write a patch.

GitHub offers **Private Vulnerability Reporting**. It provides a secure, private button on your repository where researchers can report bugs directly to you. Only repository owners can see the report, and you can collaborate privately on a fix before disclosing it.

To enable this via the CLI:

```bash
gh api -X PUT /repos/OWNER/REPO/private-vulnerability-reporting
```

This is the exact feature that powers the `/raw/security.txt` workflow. Once enabled, you can safely direct researchers to:
`https://github.com/OWNER/REPO/security/advisories/new`

---

## Summary Cheat Sheet

Here is the quick sequence of commands to run for any new public repository to apply these best practices:

```bash
# Set repository hygiene
gh repo edit OWNER/REPO --delete-branch-on-merge --allow-update-branch

# Enable secure vulnerability reports
gh api -X PUT /repos/OWNER/REPO/private-vulnerability-reporting

# Protect main branch with our ruleset config
gh api -X POST /repos/OWNER/REPO/rulesets --input ruleset.json
```
