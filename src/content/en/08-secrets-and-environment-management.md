---

title: "Secrets and Environment Management"
description: "Manage secrets securely using 1Password and control environment variables per project with direnv."
date: "2026-04-18"
tags: ["secrets", "1password", "direnv", "security"]
category: "engineering"
language: "en"
slug: "secrets-and-environment-management"
------------------------------------------

## Overview

This section describes how to manage secrets securely and how to handle environment variables in a controlled and reproducible way.

The setup combines:

* 1Password for secure storage of secrets
* direnv for loading environment variables per project

The goal is to avoid storing sensitive information in shell configuration files or committing secrets to repositories.

---

## Installing 1Password CLI

Install 1Password and its CLI:

```bash id="m6r1tj"
brew install --cask 1password
brew install --cask 1password-cli
```

Sign in:

```bash id="r7w3od"
op signin
```

This connects the CLI to the desktop application.

---

## Why Use 1Password

1Password provides:

* encrypted storage of secrets
* secure access from the terminal
* integration with SSH and CLI tools

Secrets stored in 1Password never need to be written to disk in plain text.

---

## Accessing Secrets

Retrieve a secret:

```bash id="v0i3gm"
op read "op://Private/MyService/API_KEY"
```

Use it in a command:

```bash id="6d3tqk"
export API_KEY="$(op read 'op://Private/MyService/API_KEY')"
```

However, exporting secrets globally is not recommended.

---

## Running Commands with Secrets

Use `op run` to inject environment variables for a single command:

```bash id="o8h1vn"
op run --env-file=.env -- command
```

Example:

```bash id="m3g5pu"
op run --env-file=.env -- ansible-playbook site.yml
```

### Benefits

* secrets are only available to the process
* nothing persists in the shell environment
* reduces risk of accidental exposure

---

## Managing Environment Variables with direnv

Install direnv:

```bash id="h2g9ds"
brew install direnv
```

Enable it in `.zshrc`:

```bash id="8o6y7h"
eval "$(direnv hook zsh)"
```

---

## Using direnv

Each project can define its own environment variables in a `.envrc` file.

Example:

```bash id="d5w7q1"
layout python python3

export AWS_PROFILE=dev
export CLOUDSDK_CORE_PROJECT=my-project
export ANSIBLE_CONFIG=$PWD/ansible.cfg
```

Allow the file:

```bash id="c1q8p3"
direnv allow
```

When entering the directory, variables are loaded automatically. When leaving, they are unloaded.

---

## Combining direnv and 1Password

A common pattern is:

* `.envrc` defines non-secret variables
* `.env` contains references to secrets

Example `.env`:

```bash id="p7g2l0"
JIRA_API_TOKEN=op://Private/Jira/api_token
```

Run commands with:

```bash id="q4j9zn"
op run --env-file=.env -- command
```

This keeps secrets out of `.envrc` and avoids exporting them globally.

---

## AWS Configuration

Prefer SSO instead of static credentials:

```bash id="q2c6pj"
aws configure sso
```

Then:

```bash id="w8j4xk"
aws sso login --profile dev
```

Use profiles in `.envrc`:

```bash id="e3z5ti"
export AWS_PROFILE=dev
```

---

## GCP Configuration

Initialize:

```bash id="p9r2sl"
gcloud init
```

Set Application Default Credentials:

```bash id="n7x1kw"
gcloud auth application-default login
```

Use project configuration in `.envrc`:

```bash id="c8m6qw"
export CLOUDSDK_CORE_PROJECT=my-project
```

---

## Best Practices

* Never store secrets in `.zshrc`
* Avoid committing `.env` files with real secrets
* Use `op run` instead of exporting secrets globally
* Keep `.envrc` focused on non-sensitive configuration
* Prefer short-lived credentials (SSO) over static keys

---

## Common Issues

### direnv not loading variables

Check:

```bash id="v5z8jm"
direnv status
```

Ensure `.envrc` is allowed:

```bash id="l0p3yt"
direnv allow
```

---

### Secrets visible in shell history

Avoid commands like:

```bash id="t4g2xo"
export API_KEY=secret
```

Use `op run` instead.

---

### 1Password CLI not working

Check:

```bash id="z1x6pq"
op account list
```

Ensure:

* 1Password app is unlocked
* CLI is signed in

---

## Summary

At this point:

* Secrets are stored securely in 1Password
* Environment variables are scoped per project using direnv
* Sensitive data is not stored in shell configuration or repositories

This setup provides a secure and flexible foundation for working with credentials and environment-specific configuration.
