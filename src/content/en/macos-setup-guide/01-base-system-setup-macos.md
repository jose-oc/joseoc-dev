---
title: "Automating macOS Setup: Homebrew, Brewfile, and Essential CLI Tools"
description: "Learn how to automate your macOS development environment using Homebrew and Brewfile. Install essential CLI tools for a fast, reproducible DevOps workstation."
date: "2026-04-18"
tags: ["macos", "homebrew", "setup", "devops", "automation"]
category: "engineering"
language: "en"
slug: "base-system-setup-macos"
---

## Why This Matters

Setting up a new Mac manually is a slow, error-prone process. You forget which tools you need, which versions were stable, and how you configured them. 

By using **Homebrew** and a **Brewfile**, you transform your "manual setup" into a "documented, reproducible script." This ensures that whether you are on a new machine or helping a teammate, the environment is identical every time.

### Key Benefits
* **Speed**: Install 50+ tools with a single command.
* **Consistency**: Avoid the "it works on my machine" syndrome.
* **Maintenance**: Easily update all your tools at once.

---

## 1. Installing Homebrew: The macOS Package Manager

Homebrew is the foundation of any modern macOS development setup. It allows you to manage both command-line tools and GUI applications (via Casks) from your terminal.

### How to Install
Run the official installation script:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Post-Installation Setup
On Apple Silicon Macs, you must add Homebrew to your PATH. Run these commands in your terminal:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

---

## 2. Verifying Your System Health

Before installing packages, ensure your system is in a healthy state.

```bash
brew doctor
Your system is ready to brew.
```

> [!TIP]
> If `brew doctor` returns warnings about "unlinked kegs" or "outdated command line tools," follow its suggestions immediately. A clean "doctor" report prevents 90% of future installation errors.


---

## 3. Installing the Core Developer Toolkit

We don't just install tools; we install **performance multipliers**. These modern Rust-based tools replace slow, legacy Unix utilities.

```bash
brew install bat direnv eza fd fzf gh git-delta ripgrep rsync uv zoxide
brew install --cask font-hack-nerd-font
```

### Why these tools?
* **`ripgrep` (rg)**: 10x faster than `grep`. Essential for searching large monorepos.
* **`zoxide`**: A smarter `cd` that learns your habits.
* **`fzf`**: The "fuzzy finder" that makes searching history or files instantaneous.
* **`uv`**: The fastest Python package manager available today.

---

## 4. Reproducibility with Brewfile

The secret to a "disposable" workstation is the `Brewfile`. It acts like a `package.json` for your entire operating system.

### Creating Your First Brewfile
Generate a snapshot of your current system:

```bash
brew bundle dump --file="$HOME/Brewfile" --force
```

### Using Your Brewfile on a New Mac
When you get a new computer, simply run:

```bash
brew bundle install --file="$HOME/Brewfile"

❯ brew bundle check
The Brewfile's dependencies are satisfied.
```


---

## Best Practices
1. **Version Control Your Brewfile**: Keep it in your [dotfiles](/en/docs/dotfiles-and-reproducibility) repository.
2. **Audit Regularly**: Run `brew bundle cleanup` to remove tools you no longer use.
3. **Use Casks for Everything**: Even apps like Slack, VS Code, and Discord can be managed via Homebrew Cask.

## Summary
By mastering Homebrew and Brewfile, you've moved from "manual configuration" to "infrastructure as code" for your personal laptop. You are now ready to [configure your terminal](/en/docs/terminal-setup-macos).

