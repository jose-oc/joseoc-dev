---
title: "Modern Python Development on macOS: Fast and Isolated with UV"
description: "Stop struggling with Python environments on macOS. Learn how to use UV for blazingly fast dependency management, environment isolation, and automated scripts."
date: "2026-04-18"
tags: ["python", "uv", "ansible", "devops", "automation"]
category: "engineering"
language: "en"
slug: "macos-setup-guide/python-and-automation-tooling"
---

## Why This Matters

Python is the "duct tape" of DevOps, but its environment management is notoriously complex. macOS comes with a "System Python" that you should **never** touch, as modifying it can break core OS functions. 

The traditional way to manage Python (using `pyenv`, `pip`, and `virtualenv`) is slow and often results in "dependency hell." By using **UV**, a modern Python manager written in Rust, you get a single tool that handles everything—Python versions, virtual environments, and global CLI tools—at speeds that are 10-100x faster than traditional methods.

### Key Benefits
* **Isolation**: Keep your system clean. Every project and tool gets its own space.
* **Speed**: Install dependencies in milliseconds, not minutes.
* **Simplicity**: One tool (`uv`) replaces three or four legacy ones.

---

## 1. Installing UV: The Only Tool You Need

Instead of installing Python directly, we install `uv`, which will then manage Python for us.

```bash
brew install uv
```

### Why UV?
* It acts as a **Python installer** (replaces `pyenv`).
* It acts as a **package installer** (replaces `pip`).
* It acts as a **tool manager** (replaces `pipx`).

---

## 2. Managing Python Versions

Need a specific version for a project? UV makes it trivial.

```bash
# Install the latest Python
uv python install 3.14

# List all available and installed versions
uv python list
```

### Pro-Tip: Setting Your Default
If you want `python3` in your terminal to always point to a UV-managed version, add a symlink in your `~/.local/bin` (which should be in your `PATH`):

```bash
ln -sfn "$(uv python find 3.14)" ~/.local/bin/python3
```

---

## 3. Isolated CLI Tools (Ansible & More)

One of UV's best features is its ability to install CLI tools (like Ansible or Ruff) in their own hidden virtual environments, so they never conflict with each other.

### Installing Ansible Correctly
```bash
uv tool install --with-executables-from ansible-core,ansible-lint ansible
```

### Why this is better?
* **Ansible** is now available globally.
* It has its own private Python environment.
* You can upgrade it with `uv tool upgrade ansible` without affecting anything else.

```shell
❯ uv tool list
ansible v8.7.0
- ansible-community
basedpyright v1.39.3
- basedpyright
- basedpyright-langserver
ruff v0.15.11
- ruff
```


---

## 4. Per-Project Virtual Environments

When you start a new project, UV makes environment creation instantaneous.

```bash
# Create a venv and sync dependencies from pyproject.toml
uv venv
source .venv/bin/activate
uv sync
```

### Automatic Activation with Direnv
If you followed the [Secrets and Environment guide](/docs/macos-setup-guide/secrets-and-environment-management), you can automate this even further. You don't need to manually `source .venv/bin/activate` if you use `direnv`.

Simply add this to your project's `.envrc`:

```bash
# .envrc
layout uv
```

> [!TIP]
> To make `layout uv` work, add this snippet to your `~/.config/direnv/direnvrc`:
> ```bash
> layout_uv() {
>   export VIRTUAL_ENV=${VIRTUAL_ENV:-$(pwd)/.venv}
>   if [[ ! -d $VIRTUAL_ENV ]]; then
>     uv venv
>   fi
>   PATH_add "$VIRTUAL_ENV/bin"
> }
> ```

Now, whenever you `cd` into the project, `direnv` will automatically create the virtual environment (if it doesn't exist) and activate it for you. This is the cleanest way to work across multiple Python projects.


---

## 5. Best Practices for Python on macOS

1. **Rule Zero**: Never `sudo pip install`.
2. **Use `.python-version`**: Place this file in your project root, and `uv` will automatically use the correct version.
3. **Automate with UV Run**: You can run a script without even creating a venv using `uv run script.py`. It will handle dependencies on the fly.

---

## Summary
You now have a blazingly fast, modern Python setup that keeps your macOS system pristine. Your automation tools are isolated, and your projects are reproducible. Now that we can automate, let's look at the [Cloud and Kubernetes toolkit](/docs/macos-setup-guide/kubernetes-and-devops-tooling).

