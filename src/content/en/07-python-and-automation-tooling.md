---

title: "Python and Automation Tooling"
description: "Set up a modern Python environment using uv and install automation tools such as Ansible in an isolated and reproducible way."
date: "2026-04-18"
tags: ["python", "uv", "ansible", "devops"]
category: "engineering"
language: "en"
slug: "python-and-automation-tooling"
-------------------------------------

## Overview

This section describes how to set up Python in a clean and reproducible way, avoiding the system Python provided by macOS, and how to install automation tooling such as Ansible.

The approach is based on `uv`, a modern tool that manages Python versions and installs CLI tools in isolated environments.

---

## Why Not Use System Python

macOS includes a system Python:

```bash
which python3
```

Example output:

```text
/usr/bin/python3
```

This Python version is managed by the operating system and should not be modified.

Using it for development or installing packages globally can lead to conflicts and unpredictable behavior.

---

## Installing uv

Install `uv` with Homebrew:

```bash
brew install uv
```

`uv` is responsible for:

* installing Python versions
* managing virtual environments
* installing CLI tools in isolation

---

## Installing Python

Install a modern Python version:

```bash
uv python install 3.14
```

Verify:

```bash
uv python list
```

---

## Setting Python as Default

By default, `uv` installs Python under:

```bash
~/.local/bin/python3.14
```

Create a symlink so `python3` points to it:

```bash
ln -sfn "$HOME/.local/bin/python3.14" "$HOME/.local/bin/python3"
```

Verify:

```bash
which python3
python3 --version
```

Expected:

```text
/Users/<user>/.local/bin/python3
Python 3.14.x
```

---

## Installing Ansible

Install Ansible using `uv`:

```bash
uv tool install --python 3.14 --with-executables-from ansible-core,ansible-lint ansible
```

This installs:

* `ansible`
* `ansible-playbook`
* `ansible-vault`
* `ansible-lint`

Verify:

```bash
ansible --version
ansible-playbook --version
```

---

## Why Use uv for Ansible

Advantages:

* isolated environment for each tool
* no dependency conflicts with system Python
* easy upgrades and reproducibility

`uv` installs tools in:

```bash
~/.local/share/uv/tools/
```

and exposes binaries in:

```bash
~/.local/bin
```

---

## Managing Python-Based Tools

Install additional tools in the same way:

```bash
uv tool install ruff
uv tool install basedpyright
```

This keeps all tools isolated and avoids global package pollution.

---

## Path Configuration

Ensure `~/.local/bin` is in your `PATH`.

Check:

```bash
echo $PATH
```

If missing, add to `.zshrc`:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

---

## Common Issues

### python3 still points to system version

Fix:

```bash
ln -sfn "$HOME/.local/bin/python3.14" "$HOME/.local/bin/python3"
```

Then reload shell:

```bash
exec zsh --login
```

---

### Tool not found after installation

Check:

```bash
which ansible
```

If not found, ensure `~/.local/bin` is in `PATH`.

---

## Best Practices

* Never install packages into system Python
* Use `uv` for all Python tooling
* Keep CLI tools isolated
* Prefer upgrading tools via `uv` instead of pip

---

## Summary

At this point:

* Python is managed independently from macOS
* A modern Python version is installed and used by default
* Ansible and related tools are installed in isolated environments
* The system is clean, reproducible, and free of dependency conflicts

This setup provides a reliable foundation for automation and infrastructure tooling.
