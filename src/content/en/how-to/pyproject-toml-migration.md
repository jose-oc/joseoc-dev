---
title: "When to Move to pyproject"
description: "How to decide when a Python repo should move from requirements files to pyproject, and what you gain when you do."
date: "2026-06-12"
tags: ["python", "pyproject", "uv", "mise", "tooling"]
category: "engineering"
language: "en"
slug: "how-to/pyproject-toml-migration"
draft: false
---

I usually think about `pyproject.toml` as the point where a Python repo stops feeling like a loose pile of scripts and starts feeling like an actual project.

That does not mean every repo should move right away. If `requirements.in`, `requirements.txt`, `uv pip compile`, and `uv pip sync` are working well, there is no prize for changing them just because the ecosystem likes `pyproject.toml`.

The move starts to make sense when a few things line up:

- the repo is going to live for a while
- more people touch it
- dependency management is getting wider than a simple requirements file
- you want `uv` to manage the project more natively
- you want a versioned `uv.lock`
- you want one standard place for metadata, dependencies, and tooling config

## What `pyproject.toml` gives you

The main benefit is that it puts the important project bits in one place:

- project name and version
- minimum Python version
- dependencies
- optional extras
- build backend
- tool configuration

That is useful whether you use `uv`, `ruff`, `pytest`, or other tools around the project.

It also fits `uv` very naturally. In project mode, `uv` uses `pyproject.toml` as the root, keeps `.venv` next to the repo, and uses `uv.lock` to pin the resolved state.

## A practical cutover path

If I were moving a repo over, I would keep it boring:

1. add a minimal `pyproject.toml`
2. move dependencies into the `project.dependencies` section
3. let `uv sync` create or update the virtual environment
4. version `uv.lock`
5. keep any repo-specific environment setup in `mise.toml`

An example setup looks like this:

```toml
[project]
name = "my-project"
version = "0.1.0"
requires-python = ">=3.13"
dependencies = [
  "httpx",
  "pydantic",
]

[build-system]
requires = ["uv_build>=0.11.7,<0.12.0"]
build-backend = "uv_build"
```

And with `mise`:

```toml
[tools]
python = "3.13"
uv = "latest"

[settings]
python.uv_venv_auto = "create|source"

[env]
UV_PYTHON = { value = "{{ tools.python.path }}", tools = true }
_.file = ".env.local"
_.path = ["bin"]

[tasks.sync]
description = "Sync the project environment"
run = "uv sync"
sources = ["pyproject.toml", "uv.lock"]
outputs = [".venv"]
```

That gives you a clean split:

- `pyproject.toml` describes the project
- `uv.lock` freezes the dependency resolution
- `mise.toml` handles the local workflow

## When I would not migrate yet

I would leave it alone if:

- the repo is small and stable
- the requirements flow is already predictable
- the project is inherited and works fine as-is
- the migration would add more noise than value

The point is not to modernize for the sake of it. The point is to make the project easier to reason about.

## Related workflow

If you are also sorting out the per-directory tool setup around the project, I wrote about that separately in [How I switched from `direnv` to `mise`](/docs/how-to/direnv-to-mise).
