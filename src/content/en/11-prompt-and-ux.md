---

title: "Prompt and UX"
description: "Configure a clean and informative shell prompt using Starship and improve overall command-line user experience."
date: "2026-04-18"
tags: ["shell", "starship", "ux", "prompt"]
category: "engineering"
language: "en"
slug: "prompt-and-ux"
---------------------

## Overview

This section describes how to configure the shell prompt and improve the overall command-line user experience.

The prompt is the main interface between the user and the system. It should be:

* fast to render
* easy to read
* informative without being noisy
* consistent across machines

This setup uses **Starship**, a cross-shell prompt written in Rust, designed to be fast and highly configurable.

---

## Installing Starship

Install Starship:

```bash id="q7t1vk"
brew install starship
```

---

## Enabling Starship

Add the following line to your `.zshrc`:

```bash id="k2m5fr"
eval "$(starship init zsh)"
```

Important:

* This line should be placed near the **end of the file**
* If placed earlier, it may be overridden by other prompt settings

Reload the shell:

```bash id="x8v4bz"
exec zsh --login
```

---

## Configuration File

Starship reads its configuration from:

```bash id="f3u9dx"
~/.config/starship.toml
```

Create the file if it does not exist.

---

## Minimal Configuration

Example configuration:

```toml id="p1g6nw"
add_newline = false

format = "$directory$git_branch$git_status$python$golang$terraform$kubernetes$character"

[directory]
truncate_to_repo = true

[git_branch]
symbol = "git:"

[python]
symbol = "py:"

[golang]
symbol = "go:"

[terraform]
symbol = "tf:"

[kubernetes]
disabled = false

[aws]
disabled = true

[gcloud]
disabled = true
```

---

## Explanation

* `format`: defines which modules appear in the prompt
* `directory`: shows current path, truncated to repository root
* `git_branch`: displays current Git branch
* `git_status`: shows changes in the working directory
* `python`, `golang`, `terraform`, `kubernetes`: display context for active environments

Disabling modules like `aws` and `gcloud` reduces noise.

---

## Behavior

With this configuration, the prompt displays:

* current directory
* Git branch and status
* active language/tool context

Example:

```text id="t3k7e2"
~/project git:main py:3.14 tf:default $
```

---

## Why Use Starship

Advantages:

* fast rendering
* consistent across shells and machines
* easy to configure and version
* integrates with many tools

Compared to traditional shell themes, Starship avoids complex frameworks and large configuration files.

---

## Interaction with Other Tools

Starship integrates well with:

* `zoxide`: directory navigation
* `direnv`: environment changes
* Kubernetes context (via `kubectl`)
* Python environments

The prompt updates automatically when context changes.

---

## Performance Considerations

* Keep the configuration minimal
* Avoid enabling too many modules
* Disable unused integrations

Starship is fast by design, but excessive modules can slow rendering.

---

## Common Issues

### Prompt not updating

Cause:

* `starship init` not loaded

Fix:

* ensure line is present in `.zshrc`
* reload shell

---

### Prompt overridden

Cause:

* another tool sets `PROMPT` after Starship

Fix:

* move `eval "$(starship init zsh)"` to the end of `.zshrc`

---

### Configuration not applied

Check:

```bash id="y5q9dx"
echo $STARSHIP_CONFIG
```

Ensure it points to `~/.config/starship.toml` or is unset.

---

## Best Practices

* Keep the prompt simple and readable
* Show only relevant context
* Avoid visual clutter
* Version the configuration using chezmoi

---

## Summary

At this point:

* Starship is installed and active
* The prompt provides useful contextual information
* Configuration is minimal and maintainable

This improves the overall user experience without adding unnecessary complexity.
