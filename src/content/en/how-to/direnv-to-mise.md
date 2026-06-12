---
title: "How I switched from `direnv` to `mise`"
description: "A practical comparison of `direnv`, `aqua`, `asdf`, `proto`, and `mise`, and why I moved my day-to-day setup to `mise`."
date: "2026-06-12"
tags: ["direnv", "mise", "tooling", "python", "devops"]
category: "engineering"
language: "en"
slug: "how-to/direnv-to-mise"
draft: false
---

I spent some time looking at tool managers for macOS with one very specific goal in mind:

- manage `kubectl` versions
- manage `talosctl` versions
- if possible, also handle `python`, `node`, or even `ansible`
- and, above all, figure out whether it still made sense to keep `direnv` around or replace it with something else

I don't have any complaints about `direnv`. It served me well for a long time. The problem was that I needed to manage several versions of `kubectl` and `talosctl`, and `direnv` is not really built for that. So I started looking for a tool that could do that job, with a simple rule in mind: if it could also replace what I was doing with `direnv`, even better.

I looked at a few options:

- `asdf`
- `proto`
- `aqua`
- `mise`

`asdf` is still perfectly valid, but it feels older now and depends heavily on plugins with mixed quality and lack of security means. `proto` looked interesting for runtimes, but less obvious for the kind of infrastructure CLIs I wanted to manage. That left me with two serious contenders:

- `aqua`
- `mise`

And the real question became less "which version manager do I like best?" and more:

**Do I want to keep `direnv`, or do I want another tool to cover the environment side too?**


## The short version

If you want something that is excellent for CLIs like `kubectl` and `talosctl`, with a strong security story and without getting too deep into shell behavior, `aqua` is a very solid choice.

If you want a more ambitious tool that can manage tools, environment variables, per-directory activation, Python, tasks, and part of the flow that `direnv` used to cover for me, `mise` makes a lot of sense.

I ended up choosing `mise`.

## Why `mise`

`mise` won me over for a few reasons:

- it can manage `kubectl` and `talosctl`
- it also fits `python` well
- it integrates nicely with `uv`
- it supports per-directory configuration with `mise.toml`
- it can replace a good chunk of `direnv` if your old `direnv` setup was mostly "set some variables, activate Python, and tweak `PATH`"

One important detail: `mise` does not really encourage running side by side with `direnv` in a heavy way. Not because they break each other, but because both want to do similar things:

- react when you enter a directory
- adjust `PATH`
- activate runtimes
- prepare the environment

If both tools are trying to steer at once, things get weird fast.

Two terms come up a lot when talking about this kind of tooling:

- **hook**: the bit you add to your shell so the tool can run automatically when something relevant changes, usually when you enter a directory or start the shell. For example, `eval "$(mise activate zsh)"` installs the `mise` hook in `zsh`.
- **shim**: a small intermediary executable that sits before the real tool on your `PATH`. Its job is to intercept the call, decide which version to use, and hand off to the correct binary. A lot of version managers use shims; `mise` can work with shell activation and, depending on the case, with that kind of mechanism too.

In other words:

- the **hook** prepares the environment
- the **shim** decides which binary actually runs

When several tools try to manage those same pieces, you start getting the strange behavior.

The practical conclusion for me was pretty straightforward:

- if you choose `mise`, let `mise` carry the weight
- if you keep `direnv`, then `aqua` probably makes more sense alongside it

## What `mise` replaces well

If you used `direnv` for things like this:

```sh
export AWS_PROFILE=deployer
export ANSIBLE_CONFIG=$PWD/ansible.cfg
source_env .env.local
PATH_add bin
layout python
```

that maps quite well to `mise.toml`.

For example:

```toml
[tools]
python = "3.13"

[settings]
python.uv_venv_auto = "create|source"

[env]
AWS_PROFILE = "deployer"
ANSIBLE_CONFIG = "{{config_root}}/ansible.cfg"
UV_PYTHON = { value = "{{ tools.python.path }}", tools = true }
_.file = ".env.local"
_.path = ["bin"]
```

That covers a lot of ground:

- it selects the Python version
- it creates and activates `.venv` automatically when you use `uv`
- it loads variables from `.env.local`
- it adds `bin/` to `PATH`

It is not identical to `direnv`, but for a lot of repos it is enough. In some cases, it is actually cleaner.

## What `mise` does not do as nicely as `direnv`

This is the part where it helps to be honest.

`mise` is excellent when the workflow is declarative, but it feels less elegant when you want shell logic that is a bit more "creative".

For example, with `direnv` it is very common to do things like:

- create a file with a default value if it does not exist
- validate that a specific path exists
- run more open-ended conditional logic

That feels natural in `direnv` because `.envrc` is just shell.

A real-world example might look like this:

```sh
export ANSIBLE_CONFIG=$PWD/ansible.cfg

inventory_file="$PWD/.envrc.inventory"
if [[ ! -f "$inventory_file" ]]; then
  cat <<'EOF' > "$inventory_file"
export POC_DEPLOY_ENV=STAGING
EOF
fi

watch_file "$inventory_file"
source_env "$inventory_file"

if [[ -z "${POC_DEPLOY_ENV:-}" ]]; then
  echo "POC_DEPLOY_ENV must be set in .envrc.inventory" >&2
  exit 1
fi

inventory_hosts_file="$PWD/inventories/${POC_DEPLOY_ENV}/hosts.yml"
if [[ ! -f "$inventory_hosts_file" ]]; then
  echo "Inventory hosts file not found: $inventory_hosts_file" >&2
  exit 1
fi

export ANSIBLE_INVENTORY="$inventory_hosts_file"
```

In `direnv`, that is very comfortable because:

- it creates the local file if it is missing
- it reloads when the file changes
- it validates required variables
- it validates the derived file path
- and it stops with a clear error if something is wrong

In `mise`, some of that works well, but not all of it feels equally natural. For example:

- loading a local file works
- requiring a variable works
- deriving a path from that variable works
- creating a local file automatically is less natural
- more elaborate shell validation is not really where `mise` shines

My take here is that `mise` wins when you simplify the flow. For example:

- move `POC_DEPLOY_ENV` into `mise.local.toml`
- use `mise.toml` for shared variables
- leave the more complex validation to a task or a dedicated script

You can make `mise` do it, but you usually end up simplifying the setup:

- move local values into `mise.local.toml`
- use `.env.local` files
- avoid too much dynamic shell logic

And honestly, that is often a good thing. Less magic usually means fewer surprises.

## Security: `aqua` vs `mise`

On security, `aqua` gave me a better default feeling.

Its model is very focused on:

- downloading binaries declaratively
- verifying checksums
- leaning on Cosign, SLSA, and attestations
- minimizing the amount of external logic that gets executed

That fits CLIs like `kubectl` and `talosctl` especially well.

`mise`, on the other hand, also has a good security story, but it is broader and more configurable:

- lockfiles
- trust settings
- `minimum_release_age`
- stricter modes like `paranoid`
- provenance checks across several backends

My summary would be:

- `aqua` is the safer default posture for CLIs
- `mise` covers more use cases, so you need to be a little more deliberate if you want to harden it well

Because I wanted one tool that could also help me with Python and replace part of `direnv`, `mise` still won.

If you want the reasoning behind moving a project to `pyproject.toml`, I split that into a separate article: [When to move to `pyproject.toml`](/docs/how-to/pyproject-toml-migration).

## Example `mise.toml` for a project with `pyproject.toml`

If the project already uses `pyproject.toml`, I would do something like this:

```toml
[tools]
python = "3.13"
uv = "latest"

[settings]
python.uv_venv_auto = "create|source"

[env]
UV_PYTHON = { value = "{{ tools.python.path }}", tools = true }
UV_CACHE_DIR = "{{config_root}}/.uv-cache"
_.file = ".env.local"
_.path = ["bin"]

[tasks.sync]
description = "Sync the project environment"
run = "uv sync"
sources = ["pyproject.toml", "uv.lock"]
outputs = [".venv"]
```

If you want to add a dependency in this workflow, run `uv add httpx`. 

And the flow would be:

```sh
mise install
mise run sync
```

The important part is separating responsibilities:

- `mise` activates Python and the environment
- `uv` manages the virtualenv and dependency syncing
- `mise` tasks give you a clean entry point

I would not have `uv pip sync` run automatically every time I `cd` into the repo. You can try to mimic that behavior, but it usually turns into a worse tradeoff:

- it slows down entering the directory
- it adds unexpected side effects
- it turns a read-only action into a write action

Keeping it explicit is better.

## Example `mise.toml` for a project with `requirements.txt`

If the repo still uses `requirements.in` and `requirements.txt`, this is the shape I would use instead:

```toml
[tools]
python = "3.13"
uv = "latest"

[settings]
python.uv_venv_auto = "create|source"

[env]
UV_PYTHON = { value = "{{ tools.python.path }}", tools = true }
UV_CACHE_DIR = "{{config_root}}/.uv-cache"
_.file = ".env.local"
_.path = ["bin"]

[tasks.sync-deps]
description = "Sync the virtualenv from requirements.txt"
run = "uv pip sync requirements.txt"
sources = ["requirements.txt"]
outputs = [".venv"]

[tasks.lock-deps]
description = "Regenerate requirements.txt"
run = "uv pip compile --output-file requirements.txt requirements.in"
sources = ["requirements.in"]
outputs = ["requirements.txt"]
```

That one fits the older workflow better:

- keep `requirements.in` as the source of truth
- regenerate `requirements.txt` when the inputs change
- sync the virtualenv from the pinned file
