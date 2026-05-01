---
title: How I Use tmux for Daily Work
description: A simple way to manage multiple sessions efficiently
date: 2026-04-18
tags: [tmux, productivity]
category: engineering
language: en
slug: tmux
---

# How I Use tmux for Daily Work

I use tmux to manage everything I run locally.

---

## Basic idea

Instead of opening multiple terminals, I use:

- sessions
- windows
- panes

---

## My workflow

- One session per project
- One window per context (backend, logs, etc.)
- Split panes when needed

---

## Useful commands

Create session:

```bash
tmux new -s project
```

Attach:

```bash
tmux attach -t project
```

Split pane:

```bash
Ctrl + b %
```

Why I use it
- everything stays organized
- I can disconnect and come back later
- no need for multiple terminal windows

It takes a bit of time to get used to, but it’s worth it.
