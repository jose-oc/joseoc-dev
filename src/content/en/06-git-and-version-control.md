---

title: "Git and Version Control"
description: "Configure Git for an efficient workflow, improve diff visualization, and handle multiple identities safely."
date: "2026-04-18"
tags: ["git", "version-control", "github", "devops"]
category: "engineering"
language: "en"
slug: "git-and-version-control"
-------------------------------

## Overview

This section covers the configuration of Git for daily development work, including usability improvements, better diff visualization, and handling multiple identities.

The goal is to make Git predictable, readable, and aligned with the SSH setup defined earlier.

---

## Installing Git Enhancements

Install `git-delta`:

```bash id="p0l8rq"
brew install git-delta
```

`git-delta` replaces the default Git pager and provides:

* syntax-highlighted diffs
* improved readability
* better visualization of changes

---

## Basic Git Configuration

Set your global identity:

```bash id="b7r2ke"
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

Set Neovim as the default editor:

```bash id="5d3k29"
git config --global core.editor nvim
```

Set the default branch name:

```bash id="y4m2ts"
git config --global init.defaultBranch main
```

---

## Improving Git Behavior

Apply the following settings:

```bash id="r6h3u1"
git config --global pull.rebase false
git config --global fetch.prune true
git config --global rebase.autoStash true
git config --global push.autoSetupRemote true
git config --global merge.conflictStyle zdiff3
git config --global diff.colorMoved zebra
git config --global rerere.enabled true
```

### Explanation

* `fetch.prune`: removes stale remote branches
* `rebase.autoStash`: temporarily stashes changes during rebase
* `push.autoSetupRemote`: simplifies pushing new branches
* `merge.conflictStyle zdiff3`: shows more context in conflicts
* `rerere.enabled`: remembers conflict resolutions

---

## Configuring git-delta

Enable delta as the pager:

```bash id="3j4nxt"
git config --global core.pager delta
git config --global interactive.diffFilter "delta --color-only"
git config --global delta.navigate true
git config --global delta.line-numbers true
```

### Result

Commands such as:

```bash id="7c2j1p"
git diff
git log -p
git show
```

become significantly easier to read.

---

## Useful Git Aliases

Add a set of practical aliases:

```bash id="z5c1k9"
git config --global alias.st "status --short --branch"
git config --global alias.lg "log --graph --decorate --oneline --all"
git config --global alias.last "log -1 --stat"
git config --global alias.unstage "restore --staged --"
git config --global alias.co "switch"
git config --global alias.cob "switch -c"
git config --global alias.br "branch --sort=-committerdate"
git config --global alias.df "diff"
git config --global alias.ds "diff --staged"
```

### Example usage

```bash id="6b4rzt"
git st
git lg
git df
git ds
```

---

## Handling Multiple Identities

When working with multiple Git identities (e.g., personal and work), combine Git configuration with SSH configuration.

### Per-repository identity

Set email per repository:

```bash id="zq8h2w"
git config user.email "jose@mail.com"
```

---

### Avoid using `core.sshCommand` when possible

Using:

```bash id="q2m4u7"
git config core.sshCommand "ssh -i ~/.ssh/key"
```

works but is not recommended long-term.

Instead, use SSH host aliases as described in the SSH section.

---

## Diagnosing Authentication Issues

### Check remote configuration

```bash id="c8v5w1"
git remote -v
```

---

### Test SSH authentication

```bash id="8y3l2d"
ssh -T git@github.com
```

---

### Debug key usage

```bash id="h7u9x1"
ssh -vT git@github.com
```

Look for:

```text id="b0d7l1"
Offering public key: ...
Server accepts key: ...
```

---

## Common Issues

### Wrong SSH key used

Symptoms:

* push fails
* authentication succeeds but with wrong identity

Cause:

* multiple keys available
* SSH selects the first valid key

Fix:

* use `IdentitiesOnly yes`
* define `IdentityFile` explicitly

---

### Read-only key error

```text id="k3u7t1"
ERROR: The key you are authenticating with has been marked as read only.
```

Cause:

* using a deploy key instead of a personal key

Fix:

* ensure correct key is used via SSH configuration

---

## Best Practices

* Keep global Git config minimal
* Use per-repo config for identity differences
* Prefer SSH config over `core.sshCommand`
* Always verify which key is used when debugging
* Use `git-delta` for readability

---

## Summary

At this point:

* Git is configured for usability and clarity
* Diffs and logs are easier to read
* Multiple identities are handled safely
* Authentication issues can be diagnosed and resolved

This setup supports a clean and predictable version control workflow.
