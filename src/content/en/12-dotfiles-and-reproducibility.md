---

title: "Dotfiles and Reproducibility"
description: "Manage and reproduce system configuration using chezmoi and Homebrew Brewfile."
date: "2026-04-18"
tags: ["dotfiles", "chezmoi", "reproducibility", "devops"]
category: "engineering"
language: "en"
slug: "dotfiles-and-reproducibility"
------------------------------------

## Overview

This section describes how to manage configuration files (dotfiles) and make the system reproducible across machines.

The setup uses:

* `chezmoi` for managing configuration files declaratively
* `Brewfile` for managing installed packages

The goal is to ensure that a new machine can be set up quickly and consistently.

---

## Why Manage Dotfiles

Configuration files define the behavior of:

* the shell (`.zshrc`)
* the editor (`nvim`)
* the prompt (`starship`)
* scripts and utilities

Without version control, these configurations become:

* difficult to maintain
* hard to reproduce
* prone to accidental changes

---

## Installing chezmoi

Install:

```bash
brew install chezmoi
```

---

## Initializing chezmoi

Initialize a repository:

```bash
chezmoi init
```

This creates a source directory at:

```bash
~/.local/share/chezmoi
```

This directory contains the canonical version of your configuration files.

---

## Adding Files

Add files to be managed:

```bash
chezmoi add ~/.zshrc
chezmoi add ~/.config/nvim
chezmoi add ~/.config/starship.toml
chezmoi add ~/.local/bin
chezmoi add ~/.config/zsh
```

These files are copied into the chezmoi source directory.

---

## Applying Changes

Apply configuration to your home directory:

```bash
chezmoi apply
```

This synchronizes the source state with the actual files in `$HOME`.

---

## Editing Managed Files

Important rule:

Do not edit files directly in your home directory.

Instead, use:

```bash
chezmoi edit ~/.zshrc
chezmoi edit ~/.config/nvim/init.lua
```

Then apply:

```bash
chezmoi apply
```

### Why this matters

If you edit files directly, `chezmoi apply` may overwrite your changes.

chezmoi treats the source directory as the single source of truth.

---

## Version Control

The chezmoi source directory is a Git repository.

Initialize Git:

```bash
cd ~/.local/share/chezmoi
git init
git add .
git commit -m "Initial dotfiles"
```

Add a remote:

```bash
git remote add origin git@github.com:your-user/dotfiles.git
git push -u origin main
```

---

## Using chezmoi on a New Machine

Install chezmoi:

```bash
brew install chezmoi
```

Apply your configuration:

```bash
chezmoi init --apply git@github.com:your-user/dotfiles.git
```

This clones your repository and applies all configuration.

---

## Brewfile Integration

Generate a Brewfile:

```bash
brew bundle dump --file="$HOME/Brewfile" --force
```

Add it to chezmoi:

```bash
chezmoi add ~/Brewfile
```

---

## Installing Packages from Brewfile

On a new system:

```bash
brew bundle install --file="$HOME/Brewfile"
```

---

## File Organization

Recommended structure:

```bash
~/.local/bin
~/.config/zsh
~/.config/nvim
~/.config/starship.toml
~/.config/docs
```

Keep configuration modular and organized.

---

## What Not to Include

Avoid adding:

* `~/.config/op` (1Password state)
* `~/.config/gcloud` (credentials and local config)
* `~/.config/iterm2` (runtime state)
* any file containing secrets

Only include files that should be shared across machines.

---

## Common Issues

### Changes not applied

Cause:

* file edited outside chezmoi

Fix:

```bash
chezmoi diff
chezmoi apply
```

---

### File overwritten

Cause:

* local changes not reflected in source

Fix:

* use `chezmoi edit`

---

## Best Practices

* Treat chezmoi source as the single source of truth
* Keep configuration minimal and explicit
* Version control everything reproducible
* Exclude secrets and machine-specific state
* Use small, modular configuration files

---

## Summary

At this point:

* Configuration files are managed declaratively
* The system can be reproduced on a new machine
* Changes are tracked and versioned

This provides a stable and maintainable development environment.
