---

title: "SSH and Authentication"
description: "Configure SSH for secure access to remote systems and Git repositories, including multi-key setups and 1Password integration."
date: "2026-04-18"
tags: ["ssh", "git", "authentication", "security"]
category: "engineering"
language: "en"
slug: "ssh-and-authentication"
------------------------------

## Overview

This section explains how to configure SSH for secure authentication when working with remote systems and Git repositories.

The setup supports:

* Standard OpenSSH with local private keys
* Integration with the 1Password SSH agent
* Multiple identities for different repositories or accounts

Understanding how SSH selects keys is critical to avoid authentication issues.

---

## How SSH Authentication Works

When connecting to a remote host, SSH:

1. Loads configuration from `~/.ssh/config`
2. Collects available identities (from files and agents)
3. Offers them to the server in order
4. Stops at the first key that is accepted

This means that **the first valid key wins**, even if it is not the one you intended to use.

---

## Basic SSH Configuration

The main configuration file is:

```bash
~/.ssh/config
```

A minimal example:

```sshconfig
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_nepgpe

Host *
  AddKeysToAgent yes
  UseKeychain yes
```

### Explanation

* `Host`: defines a rule for matching hosts
* `IdentityFile`: specifies which private key to use
* `AddKeysToAgent`: automatically loads keys into the agent
* `UseKeychain`: stores passphrases in macOS Keychain

---

## Managing Multiple SSH Keys

When using multiple identities, define host aliases.

Example:

```sshconfig
Host github-nepgpe
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_nepgpe
  IdentitiesOnly yes

Host github-jose
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_jose
  IdentitiesOnly yes
```

In a specific repo where you want to use the key `id_ed25519_jose` you can configure the remote host this way:

```shell
git remote set-url origin git@github-jose:jose-oc/dotfiles.git
```

Alternatively, you can use:

```shell
git config core.sshCommand 'ssh -i ~/.ssh/id_ed25519_jose'; \
git config user.email "jose@gmail.com"
```

### Important option

* `IdentitiesOnly yes`: forces SSH to use only the specified key and ignore others

Without this option, SSH may still try keys from agents or default locations.

---

## Using 1Password SSH Agent

1Password provides an SSH agent that stores private keys securely.

### Configure SSH to use 1Password

```sshconfig
Host github.com
  HostName github.com
  User git
  IdentityAgent ~/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock
```

### Behavior

* The private key never leaves 1Password
* SSH communicates with the 1Password agent
* Authentication may require biometric approval

---

## Controlling Which 1Password Key Is Used

If multiple keys exist in 1Password, SSH may offer them in the wrong order.

To force a specific key:

1. Export or download the **public key** from 1Password
2. Reference it in SSH config

Example:

```sshconfig
Host github.com
  HostName github.com
  User git
  IdentityAgent ~/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock
  IdentityFile ~/.ssh/id_ed25519_nepgpe_1password.pub
  IdentitiesOnly yes
```

### Why this works

* SSH uses the public key to select the correct identity
* The private key is still stored in 1Password
* `IdentitiesOnly yes` prevents other keys from being used

---

## Mixing 1Password and Local Keys

You can combine both approaches:

* Default identity via 1Password
* Specific repositories using local keys

Example:

```sshconfig
Host github.com
  HostName github.com
  User git
  IdentityAgent ~/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock

Host github-local
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_jose
  IdentitiesOnly yes
```

Clone using:

```bash
git clone git@github-local:your-user/your-repo.git
```

---

## Debugging SSH Issues

### Check which key is used

```bash
ssh -vT git@github.com
```

Look for lines like:

```text
Offering public key: ...
Server accepts key: ...
```

This shows which key is being used.

---

### Test authentication

```bash
ssh -T git@github.com
```

Expected output:

```text
Hi <username>! You've successfully authenticated...
```

If you see:

```text
Hi owner/repo!
```

You are using a deploy key, not your personal account.

---

### Check loaded keys

```bash
ssh-add -l
ssh-add -L
```

* Lists identities currently loaded in the agent
* Useful for debugging agent issues

---

## Common Issues

### Wrong key used

Cause:

* multiple keys available
* SSH selects the first valid one

Fix:

* use `IdentitiesOnly yes`
* define explicit `IdentityFile`

---

### Read-only key error

```text
ERROR: The key you are authenticating with has been marked as read only.
```

Cause:

* using a deploy key instead of personal key

Fix:

* select correct key explicitly

---

### ssh-agent not working

Symptoms:

* `ssh-add` hangs
* no identities listed

Cause:

* broken socket or permissions

Fix:

* check `~/.ssh` permissions
* remove invalid `~/.ssh/agent` directory
* restart session

---

## Best Practices

* Always use explicit `IdentityFile` when multiple keys exist
* Use `IdentitiesOnly yes` to avoid ambiguity
* Keep private keys secure (prefer 1Password where possible)
* Use host aliases for multiple identities
* Verify behavior with `ssh -v` when debugging

---

## Summary

At this point:

* SSH is configured for both local and 1Password-managed keys
* Multiple identities are supported and controlled explicitly
* Authentication issues can be diagnosed and resolved reliably

This setup provides a secure and predictable authentication workflow for development and operations tasks.
