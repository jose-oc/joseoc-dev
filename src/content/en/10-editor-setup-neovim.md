---

title: "Editor Setup (Neovim)"
description: "Install and configure Neovim as a modern, extensible editor with LSP, syntax highlighting, formatting, and fuzzy navigation."
date: "2026-04-18"
tags: ["neovim", "editor", "lsp", "devops"]
category: "engineering"
language: "en"
slug: "editor-setup-neovim"
---------------------------

## Overview

This section describes how to install and configure Neovim as the primary editor for development and operations work.

The goal is to provide a fast, minimal, and extensible environment with:

* syntax-aware highlighting
* language server integration (LSP)
* automatic formatting
* fuzzy file and text navigation
* Git integration

The configuration is intentionally simple and avoids large prebuilt distributions.

---

## Installing Neovim

Install Neovim using Homebrew:

```bash id="k4s9p1"
brew install neovim
```

Verify:

```bash id="m7x2q4"
nvim --version
```

---

## Setting Neovim as Default Editor

Configure the shell:

```bash id="r8d3t9"
export EDITOR="nvim"
export VISUAL="nvim"
```

Configure Git:

```bash id="v2n6q7"
git config --global core.editor nvim
```

This ensures that commit messages and interactive Git operations use Neovim.

---

## Configuration Directory

Neovim uses the following directory for configuration:

```bash id="f3y1k2"
~/.config/nvim
```

Create it:

```bash id="w9e4c6"
mkdir -p ~/.config/nvim
```

---

## Base Configuration

Create `init.lua`:

```bash id="z6k2t8"
~/.config/nvim/init.lua
```

Example:

```lua id="b4p1u7"
vim.g.mapleader = " "

vim.opt.number = true
vim.opt.relativenumber = false
vim.opt.mouse = "a"
vim.opt.clipboard = "unnamedplus"

vim.opt.expandtab = true
vim.opt.shiftwidth = 2
vim.opt.tabstop = 2
vim.opt.smartindent = true

vim.opt.ignorecase = true
vim.opt.smartcase = true

vim.opt.termguicolors = true
vim.opt.signcolumn = "yes"
vim.opt.updatetime = 250

vim.opt.splitright = true
vim.opt.splitbelow = true

vim.keymap.set("n", "<leader>w", "<cmd>write<cr>")
vim.keymap.set("n", "<leader>q", "<cmd>quit<cr>")
```

---

## Plugin Manager

Use `lazy.nvim`.

Install:

```bash
git clone https://github.com/folke/lazy.nvim.git ~/.local/share/nvim/lazy/lazy.nvim
```

Add to `init.lua`:

```lua id="o8r6x2"
vim.opt.rtp:prepend(vim.fn.expand("~/.local/share/nvim/lazy/lazy.nvim"))
require("lazy").setup("plugins")
```

---

## Plugin Structure

Create directory:

```bash id="p5t8w1"
mkdir -p ~/.config/nvim/lua/plugins
```

Create `~/.config/nvim/lua/plugins/core.lua`.

---

## Core Plugins

### Treesitter

```lua id="d3k1v9"
{
  "nvim-treesitter/nvim-treesitter",
  lazy = false,
  build = ":TSUpdate",
  config = function()
    require("nvim-treesitter").setup({
      ensure_installed = {
        "bash", "lua", "yaml", "json", "python", "go", "terraform", "hcl"
      },
      highlight = { enable = true },
      indent = { enable = true },
    })
  end,
},
```

Provides syntax-aware highlighting and indentation.

---

### LSP (Language Server Protocol)

```lua id="a9q3e5"
{
  "neovim/nvim-lspconfig",
  config = function()
    vim.lsp.enable("basedpyright")
    vim.lsp.enable("gopls")
    vim.lsp.enable("terraformls")
    vim.lsp.enable("yamlls")
    vim.lsp.enable("bashls")

    vim.keymap.set("n", "gd", vim.lsp.buf.definition)
    vim.keymap.set("n", "gr", vim.lsp.buf.references)
    vim.keymap.set("n", "K", vim.lsp.buf.hover)
  end,
},
```

Enables navigation, diagnostics, and code understanding.

---

### Formatting

```lua id="n2t6m4"
{
  "stevearc/conform.nvim",
  config = function()
    require("conform").setup({
      format_on_save = function()
        return { timeout_ms = 1000, lsp_format = "fallback" }
      end,
    })
  end,
},
```

Formats files automatically on save.

---

### Fuzzy Navigation

```lua id="q7v2r1"
{
  "ibhagwan/fzf-lua",
  config = function()
    vim.keymap.set("n", "<leader>ff", "<cmd>FzfLua files<cr>")
    vim.keymap.set("n", "<leader>fg", "<cmd>FzfLua live_grep<cr>")
  end,
},
```

Search files and text quickly.

---

### Git Integration

```lua id="z1c5p9"
{
  "lewis6991/gitsigns.nvim",
  config = function()
    require("gitsigns").setup()
  end,
},
```

Shows Git changes inline.

---

### File Explorer

```lua id="x6k3b8"
{
  "stevearc/oil.nvim",
  config = function()
    require("oil").setup()
    vim.keymap.set("n", "-", "<cmd>Oil<cr>")
  end,
},
```

Browse and edit files directly.

---

## Installing Language Servers

Install required tools:

```bash id="m8r5t2"
brew install lua-language-server gopls terraform-ls bash-language-server yaml-language-server
uv tool install basedpyright
uv tool install ruff
```

---

## Health Check

Open Neovim and run:

```vim id="k3z2p7"
:checkhealth
```

Check specific components:

```vim id="y5d9f8"
:checkhealth lazy
:checkhealth vim.lsp
```

---

## Common Workflow

Open project:

```bash id="h4p7k6"
nvim .
```

Navigate files:

```text id="z9x3n1"
<leader>ff
```

Search text:

```text id="q2w5l8"
<leader>fg
```

Format file:

```text id="b1v6e3"
:write
```

Jump to definition:

```text id="t8m2k4"
gd
```

---

## Best Practices

* Keep configuration minimal
* Avoid large prebuilt setups
* Add plugins only when needed
* Use LSP for navigation instead of manual searching
* Use formatting tools instead of manual formatting

---

## Summary

At this point:

* Neovim is installed and configured
* Syntax highlighting and LSP are enabled
* Formatting and navigation are integrated
* File browsing and Git features are available

This setup provides a fast and efficient editing environment for development and infrastructure work.
