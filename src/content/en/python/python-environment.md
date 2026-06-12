---
title: "Setting up a Python environment with direnv"
description: "Learn how to automate your Python development environment using direnv. Create a reproducible Python environment with virtualenv and uv."
date: "2026-05-01"
tags: ["python", "direnv", "setup", "devops", "automation"]
category: "engineering"
language: "en"
slug: "python-environment-direnv"
---

When working on a Python or Ansible project, managing dependencies efficiently is crucial. The ideal setup involves having a dedicated virtual environment that automatically activates whenever you enter the project directory.

The best tool I've found for this workflow is `direnv`.

> [!NOTE]
> I used to set up this workflow with `direnv`, but I now prefer `mise` for version management and per-project environment setup. If you are comparing the two approaches, read [How I switched from `direnv` to `mise`](/docs/how-to/direnv-to-mise).

## Installing direnv

First, install `direnv` using Homebrew:

```shell
brew install direnv
```

Then, hook it into your shell by adding the following to your `.zshrc`:

```shell
if (( ${+commands[direnv]} )); then
  eval "$(direnv hook zsh)"
fi
```

This ensures `direnv` is automatically loaded in every new terminal session you open.

## Configuring the Environment

Now, navigate to your project directory and create an `.envrc` file. Here is the configuration I typically use for working with Ansible projects:

```shell
layout python python3

# To generate requirements-controller.txt run `uv pip compile --output-file requirements-controller.txt requirements-controller.in`
watch_file requirements-controller.txt
uv pip sync requirements-controller.txt
# less strict alternative:
# python3 -m pip install --requirement requirements-controller.txt

export ANSIBLE_CONFIG=$PWD/ansible.cfg
export ANSIBLE_PYTHON_INTERPRETER=$VIRTUAL_ENV/bin/python

# Put your secrets in .envrc.private file with the format `export MYSECRET="VALUE"`
source_env_if_exists .envrc.private
```

## Understanding the .envrc File

* `layout python python3`: Activates the Python virtual environment. The virtual environment is automatically created in a hidden `.direnv` directory.
* `watch_file requirements-controller.txt`: Monitors `requirements-controller.txt`. If the file changes, `direnv` automatically reloads the virtual environment, keeping dependencies up to date.
* `uv pip sync requirements-controller.txt`: Synchronizes the virtual environment with your requirements file, instantly installing or removing dependencies to match the exact state defined.
* `export ANSIBLE_CONFIG=$PWD/ansible.cfg`: Sets the `ANSIBLE_CONFIG` environment variable to point to your local configuration.
* `export ANSIBLE_PYTHON_INTERPRETER=$VIRTUAL_ENV/bin/python`: Points Ansible to use the Python interpreter from the active virtual environment.
* `source_env_if_exists .envrc.private`: Loads environment variables from a `.envrc.private` file if it exists. This is perfect for keeping secrets out of version control. Make sure to add `.envrc.private` to your `.gitignore`.

The alternative line `python3 -m pip install --requirement requirements-controller.txt` would replace the `uv pip sync` command. In that scenario, you would manually edit the `requirements-controller.txt` to add or remove dependencies without specifying transitive ones.

However, using `uv pip sync requirements-controller.txt` is much more robust. You only need to maintain a `requirements-controller.in` file, and `uv` takes care of resolving conflicts and generating the full `requirements-controller.txt` with all exact transitive dependencies. You can generate it by running `uv pip compile --output-file requirements-controller.txt requirements-controller.in`.

## How It Works in Practice

The entire process is automatic. When you `cd` into the directory, `direnv` executes the `.envrc` file, activates the Python virtual environment, and exports all defined environment variables. When you navigate away from the directory, `direnv` seamlessly unloads the virtual environment and removes the exported variables, leaving your global environment clean.

## Security with direnv

For security reasons, `direnv` will not run automatically when you create or modify an `.envrc` file. You must explicitly authorize it by running:

```shell
direnv allow
```

This ensures no malicious scripts are executed without your consent. 

By default, the environment variables defined in `.envrc` only affect the project directory and its subdirectories. If you want them to affect all directories globally, you can use the command `direnv export --all`.
