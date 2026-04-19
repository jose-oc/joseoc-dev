---
title: "Terminal Setup on macOS"
description: "Install and configure a modern terminal emulator with proper fonts, key behavior, and performance settings."
date: "2026-04-18"
tags: ["macos", "terminal", "ghostty", "iterm2"]
category: "engineering"
language: "en"
slug: "terminal-setup-macos"
----------------------------

## Overview

This section describes how to install and configure a terminal emulator on macOS, including font setup, key behavior, and performance considerations.

The terminal is the primary interface for interacting with the system, so responsiveness, clarity, and correct keyboard behavior are essential.

Two terminal emulators were evaluated:

* iTerm2: mature, feature-rich, widely used
* Ghostty: modern, fast, minimal, configuration-driven

The recommended default for this setup is Ghostty.

---

## Installing a Terminal Emulator

### Option 1: Ghostty (recommended)

Install Ghostty:

```bash
brew install --cask ghostty
```

Ghostty is designed to be fast, simple, and configuration-driven. It integrates well with a CLI-focused workflow and is easy to manage with dotfiles tools like chezmoi.

---

### Option 2: iTerm2 (alternative)

Install iTerm2:

```bash
brew install --cask iterm2
```

iTerm2 provides many advanced features such as triggers, profiles, and session replay, but requires more manual configuration and is less reproducible.

---

## Installing and Configuring Fonts

Install a Nerd Font:

```bash
brew install --cask font-hack-nerd-font
```

Nerd Fonts provide additional glyphs required by modern CLI tools (e.g., Git status icons, prompt symbols).

In Ghostty, the font is configured via the config file. In iTerm2, it is configured through the GUI.

---

## Ghostty Configuration

Ghostty uses a simple configuration file:

```bash
~/.config/ghostty/config
```

You can create the file if it does not exist, I didn't as the defaults were fine for me.

### Minimal configuration

```ini
font-family = Hack Nerd Font
font-size = 13

scrollback-limit = 100000

copy-on-select = true

window-padding-x = 6
window-padding-y = 6
```

### Explanation

* `font-family`: ensures correct rendering of icons and symbols
* `font-size`: adjust for readability depending on display
* `scrollback-limit`: increases retained terminal history for logs and debugging
* `copy-on-select`: automatically copies selected text to clipboard
* `window-padding`: improves readability and aesthetics

Ghostty is designed to work well with minimal configuration. Avoid adding unnecessary options unless required.

---

## Keyboard Behavior

Correct keyboard behavior is essential for efficient shell usage.

### Option key (Alt behavior)

Ghostty maps the macOS Option key to Alt behavior automatically for common layouts.

This enables:

* `Alt + ← / →` for word navigation
* `Alt + Backspace` for deleting words

If behavior is incorrect, it is usually a shell configuration issue rather than a terminal issue.

---

## Word Navigation and Deletion

By default, zsh treats `/` as part of a word, which leads to unintuitive behavior when editing paths.

Example:

```bash
la .config/chezmoi/chezmoistate.boltdb
```

Pressing `Alt + Backspace` deletes the entire path instead of stopping at `/`.

Fix this in the shell:

```bash
autoload -U select-word-style
select-word-style bash
```

This changes word boundaries so that `/` is treated as a separator.

---

## Performance Considerations

Ghostty is optimized for performance out of the box.

No explicit renderer configuration is required; on macOS it uses Metal internally.

Key factors for performance:

* avoid excessive transparency or visual effects
* use a reasonable scrollback limit
* prefer lightweight prompt and shell configuration

---

## Splits and Limitations

Ghostty supports splitting the terminal window into multiple panes.

However, unlike iTerm2, it does not currently provide a built-in feature to broadcast input to all panes simultaneously.

If this behavior is required, it is recommended to use `tmux`, which provides synchronized panes.

---

## Summary

At this point:

* A terminal emulator is installed (Ghostty recommended)
* Fonts are correctly configured for CLI tools
* Keyboard behavior is consistent and predictable
* Scrollback and usability settings are optimized

This provides a fast and reliable terminal foundation for the rest of the environment.
