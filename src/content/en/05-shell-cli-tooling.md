---
title: "The Modern DevOps Toolkit: Essential CLI Tools for macOS"
description: "Upgrade your terminal with modern Rust-based CLI tools. Learn how to use Ripgrep, FD, Bat, and Eza to search and navigate your macOS system 10x faster."
date: "2026-04-18"
tags: ["zsh", "cli", "ripgrep", "fzf", "devops"]
category: "engineering"
language: "en"
slug: "shell-cli-tooling"
---

## Why This Matters

Standard Unix tools like `ls`, `grep`, and `find` were designed decades ago for a different era of computing. While they are reliable, they are slow and lack the visual cues modern developers need.

By switching to a **Modern Toolkit** (mostly written in Rust), you get tools that are not only faster but also provide syntax highlighting, better defaults (like ignoring `.git` directories automatically), and a more intuitive user experience.

### Key Benefits
* **Performance**: `ripgrep` can search millions of lines in milliseconds.
* **Intelligent Defaults**: `fd` and `rg` respect your `.gitignore` by default.
* **Visual Aid**: `eza` and `bat` use colors and icons to help you parse information faster.

---

## 1. The Replacement Guide: Legacy vs Modern

Here is the map of tools you should start using today to improve your productivity.

| Legacy Tool | Modern Replacement | Why? |
| :--- | :--- | :--- |
| `ls` | `eza` | Adds colors, icons, and Git status to file listings. |
| `cat` | `bat` | Adds syntax highlighting and line numbers. |
| `grep` | `ripgrep` (`rg`) | Orders of magnitude faster; respects `.gitignore`. |
| `find` | `fd` | Simplified syntax and much faster performance. |
| `cd` | `zoxide` (`z`) | Remembers your frequent folders; navigate with 1-2 letters. |

![SCREENSHOT: Terminal showing 'eza' output with icons and 'bat' showing a syntax-highlighted file]

---

## 2. Setting Up the Tools

If you followed the [Base System Setup](base-system-setup-macos), you've already installed these via Homebrew. If not:

```bash
brew install bat eza fd ripgrep zoxide
```

### Configuring Aliases
To make the transition seamless, add these aliases to your `~/.zshrc`:

```bash
alias ls="eza --icons --group-directories-first"
alias ll="eza -lh --icons --git"
alias cat="bat"
alias grep="rg"
alias find="fd"
```

---

## 3. Intelligent Navigation with Zoxide

`zoxide` is a smarter `cd`. It tracks which directories you visit most often.

### Usage
Instead of typing `cd ~/code/projects/my-awesome-app`, you just type:
```bash
z awesome
```
Zoxide will find the best match and jump there instantly.

[RECORDING: asciinema - Demonstrating fast navigation between deep directories using zoxide]

---

## 4. High-Speed Searching with Ripgrep (rg)

`ripgrep` is the ultimate search tool. It is so fast that it is used as the engine behind VS Code's search.

### Common Commands
```bash
# Search for "TODO" in all files, ignoring node_modules and .git
rg "TODO"

# Search only in Markdown files
rg -t md "DevOps"

# Search and replace (pipe to sed or use a tool like fastmod)
rg "OldName" --replace "NewName"
```

---

## 5. Better File Inspection with Bat

`bat` is `cat` with wings. It detects file extensions and applies syntax highlighting automatically.

### Pro-Tip: Integration with Git
`bat` can show you exactly which lines have changed in a file relative to your last Git commit.

```bash
bat src/main.rs
```

---

## Summary
By replacing legacy Unix tools with their modern counterparts, you've removed friction from your daily terminal usage. Your searches are faster, your navigation is smarter, and your files are easier to read. Next, we'll take these tools to the next level with [Shell Usability Improvements](shell-usability-improvements).
