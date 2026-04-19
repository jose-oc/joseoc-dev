---

title: "Shell Usability Improvements"
description: "Enhance the shell experience with better history management, inline suggestions, and improved navigation behavior."
date: "2026-04-18"
tags: ["zsh", "history", "productivity", "cli"]
category: "engineering"
language: "en"
slug: "shell-usability-improvements"
------------------------------------

## Overview

This section focuses on improving the usability of the shell by enhancing command history behavior, enabling inline suggestions, and fixing common interaction issues such as word navigation.

The goal is to make the shell behave as a fast, searchable, and intuitive interface, reducing the need to remember complex commands.

---

## Improving Command History

By default, shell history is limited and not optimized for long-term usage.

Add the following configuration to your `.zshrc`:

```bash id="yq8g8y"
HISTFILE=~/.zsh_history
HISTSIZE=100000
SAVEHIST=100000

setopt APPEND_HISTORY
setopt SHARE_HISTORY
setopt HIST_IGNORE_ALL_DUPS
setopt HIST_FIND_NO_DUPS
```

### Explanation

* `HISTFILE`: file where history is stored
* `HISTSIZE`: number of commands kept in memory
* `SAVEHIST`: number of commands stored on disk

### Options

* `APPEND_HISTORY`: prevents overwriting history when multiple shells are open
* `SHARE_HISTORY`: shares history between all terminal sessions
* `HIST_IGNORE_ALL_DUPS`: removes duplicate entries
* `HIST_FIND_NO_DUPS`: avoids showing duplicates during search

### Result

* Large, persistent history across sessions
* Cleaner search results
* No duplicate noise

---

## Searching Command History

The primary way to search history is:

```text id="3v5mfq"
Ctrl + R
```

With fzf enabled, this becomes an interactive fuzzy search.

Example:

* Type part of a command (e.g., `kubectl`)
* Navigate results with arrow keys
* Press Enter to reuse a command

This is significantly faster than retyping long commands.

---

## Inline Command Suggestions

Install zsh-autosuggestions:

```bash id="q3d3l3"
brew install zsh-autosuggestions
```

Enable it in `.zshrc`:

```bash id="nv1bpy"
source "$(brew --prefix)/share/zsh-autosuggestions/zsh-autosuggestions.zsh"
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=8'
```

### Behavior

* As you type, a suggestion appears in gray
* Based on previously executed commands
* Press the right arrow to accept it

Example:

```text id="k3o3k3"
kubectl g
```

Becomes:

```text id="2bkk6y"
kubectl get pods --all-namespaces
```

This feature complements `Ctrl + R` by providing real-time suggestions.

---

## Optional: Advanced History with Atuin

Install Atuin:

```bash id="u0k3qk"
brew install atuin
```

Enable it:

```bash id="2b0n1y"
echo 'eval "$(atuin init zsh)"' >> ~/.zshrc
```

### Features

* Stores history in a structured database
* Provides advanced search capabilities
* Supports optional sync across machines

Atuin integrates with zsh-autosuggestions to improve suggestions.

Note: I was considering using atuin but I didn't in the end.

---

## Fixing Word Navigation and Deletion

By default, zsh treats `/` as part of a word.

This causes incorrect behavior when editing file paths.

Example:

```bash id="slz31n"
.config/chezmoi/chezmoistate.boltdb
```

Pressing `Alt + Backspace` deletes the entire string instead of stopping at `/`.

Fix this behavior:

```bash id="i8k8u2"
autoload -U select-word-style
select-word-style bash
```

### Result

* `/` is treated as a word separator
* `Alt + Backspace` deletes up to the previous `/`
* `Alt + ← / →` moves between path segments

---

## Combining History and Suggestions

The recommended setup uses:

* `Ctrl + R` for deep history search (fzf)
* inline suggestions for quick completion
* deduplicated history for clarity

These features work together to create a fast and intuitive workflow.

---

## Tips and Best Practices

* Use history as a knowledge base instead of memorizing commands
* Prefer searching (`Ctrl + R`) over retyping
* Keep history large and persistent
* Avoid storing secrets in commands that will be saved in history
* Use aliases or scripts for frequently repeated commands

---

## Summary

At this point:

* Shell history is persistent, shared, and clean
* Commands can be searched quickly using fzf
* Inline suggestions provide real-time assistance
* Word navigation behaves correctly for paths

These improvements significantly reduce friction when working in the terminal.
