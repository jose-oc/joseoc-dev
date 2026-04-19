---
title: "Base System Setup on macOS"
description: "Install and configure Homebrew and establish a reproducible base environment using a Brewfile."
date: "2026-04-18"
tags: ["macos", "homebrew", "setup", "devops"]
category: "engineering"
language: "en"
slug: "base-system-setup-macos"
---

## Overview

This section describes how to prepare a macOS system for development by installing Homebrew and defining a reproducible package baseline using a Brewfile.

Homebrew is the de facto package manager for macOS. It allows you to install, upgrade, and manage command-line tools and GUI applications in a consistent way.

A *Brewfile* is a declarative list of packages that can be used to reproduce the same environment on another machine.

---

## Installing Homebrew

Run the official installation script:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
````

This installs Homebrew under `/opt/homebrew` on Apple Silicon Macs or `/usr/local` on Intel Macs.

After installation, configure your shell to use Homebrew:

```bash
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Add this line to your shell configuration file (`~/.zprofile` or `~/.zshrc`) so it is applied automatically for new sessions.

---

## Verifying the Installation

Check that Homebrew is working correctly:

```bash
brew doctor
```

Expected output:

```text
Your system is ready to brew.
```

If warnings appear, read them carefully. Some warnings are informational, but others may indicate issues with your system configuration.

---

## Installing Core Packages

Install the core command-line tools required for this setup:

```bash
brew install bat direnv eza fd fzf gh git-delta ripgrep rsync uv zoxide
brew install --cask font-hack-nerd-font
```

These tools provide essential functionality:

* `fzf`: fuzzy search for files, history, and command output
* `zoxide`: intelligent directory navigation
* `ripgrep`: fast text search in codebases
* `fd`: simplified file searching
* `bat`: improved file viewer with syntax highlighting
* `eza`: enhanced directory listing
* `direnv`: environment variables per project directory
* `uv`: Python version and tool management
* `git-delta`: improved Git diffs
* `gh`: GitHub CLI
* `rsync`: file synchronization utility
* `font-hack-nerd-font`: font with extended glyph support

---

## Creating a Brewfile

To make your setup reproducible, generate a Brewfile:

```bash
brew bundle dump --file="$HOME/Brewfile" --force
```

This creates a file listing all installed Homebrew packages.

Edit the Brewfile to keep only the packages you consider part of your standard environment.

A minimal example:

```ruby
brew "bat"
brew "direnv"
brew "eza"
brew "fd"
brew "fzf"
brew "gh"
brew "git-delta"
brew "ripgrep"
brew "rsync"
brew "uv"
brew "zoxide"

cask "font-hack-nerd-font"
```

---

## Using the Brewfile

On a new machine, install all packages with:

```bash
brew bundle install --file="$HOME/Brewfile"
```

You can verify whether the system matches the Brewfile:

```bash
brew bundle check --file="$HOME/Brewfile"
```

To remove packages not listed in the Brewfile:

```bash
brew bundle cleanup --file="$HOME/Brewfile"
```

Use this command with caution, as it will uninstall software.

---

## Summary

At this point:

* Homebrew is installed and configured
* Core development tools are available
* A Brewfile defines the desired system state

This provides a consistent and reproducible base for the rest of the setup.
