---

title: "Shell and CLI Tooling"
description: "Install and configure essential command-line tools and organize the shell environment for productivity and maintainability."
date: "2026-04-18"
tags: ["zsh", "cli", "fzf", "ripgrep", "devops"]
category: "engineering"
language: "en"
slug: "shell-cli-tooling"
-------------------------

## Overview

This section describes how to install and configure essential command-line tools and organize the shell environment for a fast and maintainable workflow.

The goal is to build a minimal but powerful CLI environment using small, composable tools instead of large frameworks.

The shell used is **zsh**, which is the default shell on macOS.

---

## Installing Core CLI Tools

Install the core tools:

```bash
brew install bat direnv eza fd fzf gh git-delta ripgrep rsync uv zoxide
```

These tools replace or enhance common Unix utilities and workflows.

### Tool descriptions

* `fzf`: fuzzy finder for files, history, and command output
* `zoxide`: intelligent directory navigation (replacement for `cd`)
* `ripgrep` (`rg`): fast recursive text search
* `fd`: simple and fast file finder
* `bat`: syntax-highlighted replacement for `cat`
* `eza`: modern replacement for `ls`
* `direnv`: loads environment variables per directory
* `uv`: Python version and tool manager
* `git-delta`: improved diff viewer for Git
* `gh`: GitHub CLI
* `rsync`: efficient file synchronization tool

---

## Shell Integration

### fzf integration

Enable fzf in zsh:

```bash
source <(fzf --zsh)
```

This provides:

* `Ctrl + R`: interactive search in command history
* `Ctrl + T`: fuzzy file selection
* `Alt + C`: directory navigation

Important: this line must be placed **after** shell completion initialization.

---

### zsh completion initialization

Ensure completion is initialized before fzf:

```bash
autoload -Uz compinit bashcompinit
compinit
bashcompinit
```

Incorrect ordering may cause errors such as:

```text
compdef: command not found
```

---

### zoxide integration

Enable zoxide:

```bash
eval "$(zoxide init zsh)"
```

This replaces `cd` with smarter navigation based on usage frequency.

Example:

```bash
z project
```

---

## Directory Structure

Organize custom scripts and configuration in a consistent way.

### Executable scripts

Store scripts in:

```bash
~/.local/bin
```

Ensure this directory is in your `PATH`.

Make scripts executable:

```bash
chmod +x ~/.local/bin/*
```

Example script:

```bash
#!/usr/bin/env bash
echo "Hello"
```

Run from anywhere:

```bash
my_script
```

---

### Shell configuration files

Modularize shell configuration under:

```bash
~/.config/zsh/
```

Example files:

```bash
~/.config/zsh/functions.zsh
~/.config/zsh/aliases.zsh
```

Load them in `.zshrc`:

```bash
[ -f "$HOME/.config/zsh/functions.zsh" ] && source "$HOME/.config/zsh/functions.zsh"
[ -f "$HOME/.config/zsh/aliases.zsh" ] && source "$HOME/.config/zsh/aliases.zsh"
```

---

## Aliases and Functions

Aliases shorten frequently used commands:

```bash
alias ll="eza -l"
alias gs="git status"
```

Functions provide reusable logic:

```bash
myfunc() {
  echo "Hello from function"
}
```

Keep these definitions in separate files to maintain clarity.

---

## Command-Line Improvements

### Replace default tools

Use these replacements:

* `ls` → `eza`
* `cat` → `bat`
* `find` → `fd`
* `grep` → `rg`

Example:

```bash
rg "pattern"
fd filename
bat file.txt
```

---

## Tips and Best Practices

* Avoid large frameworks like oh-my-zsh unless strictly necessary
* Keep `.zshrc` minimal and delegate logic to modular files
* Prefer explicit configuration over implicit behavior
* Keep scripts small and focused
* Version control your shell configuration using chezmoi

---

## Summary

At this point:

* Core CLI tools are installed and integrated
* Shell completion and fuzzy search are working
* Directory structure for scripts and config is defined
* Shell configuration is modular and maintainable

This forms the foundation for an efficient command-line workflow.
