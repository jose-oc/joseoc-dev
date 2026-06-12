---
title: "Git Rebase Cheat Sheet"
description: "A short reference for rebasing safely, handling conflicts, and knowing when to use `--force-with-lease`."
tags: ["git", "rebase", "version-control"]
category: "engineering"
slug: "git/rebase-cheat-sheet"
draft: false
---

# Git Rebase Cheat Sheet

If you want the full explanation, read [Git Rebase Without Fear](/docs/git/rebase-without-fear).

## Normal safe flow

```bash
git fetch origin
git checkout <your-branch>
git rebase origin/main
git push --force-with-lease
```

## If there are conflicts

Edit the files with conflicts to resolve them, then:

```bash
git add <resolved-files>
git rebase --continue
```

## If you want to cancel the rebase

```bash
git rebase --abort
```

## Golden rules

- Rebase rewrites commit IDs.
- If the branch already exists on GitHub, you usually need `git push --force-with-lease`.
- Do not rebase and then merge the old remote branch back in.
- Do not use plain `git push` after rebase and then try to "fix it" with a merge.
- If the branch is shared, coordinate with the team before rebasing.

## Bad pattern

```bash
git fetch origin
git checkout <your-branch>
git rebase origin/main
git pull
```

or:

```bash
git merge origin/<your-branch>
```

That can reintroduce the old history and make the PR messy.
