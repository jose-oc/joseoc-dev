---
title: "Securing Your Identity: SSH Keys, GPG, and 1Password on macOS"
description: "Establish a secure development identity. Learn how to generate SSH keys, integrate with 1Password for SSH, and sign your Git commits for maximum security."
date: "2026-04-18"
tags: ["ssh", "git", "authentication", "security", "1password"]
category: "engineering"
language: "en"
slug: "ssh-and-authentication"
---

## Why This Matters

In the world of DevOps and software engineering, your identity is your most valuable asset. If your SSH keys are compromised, your infrastructure is at risk. Conversely, if your keys are messy, you'll waste hours debugging "Permission denied" errors when switching between personal and work repositories.

A modern, secure setup uses **biometric authentication** (via 1Password) so that private keys never live on your disk in plain text.

### Key Benefits
* **Maximum Security**: Private keys are stored in a secure enclave (1Password), not in `~/.ssh`.
* **Zero Friction**: Authenticate with Touch ID instead of typing long passphrases.
* **Organization**: Seamlessly handle multiple GitHub accounts without key collisions.

---

## 1. The Modern Way: 1Password SSH Agent

Stop managing `.pub` and private key files manually. 1Password can act as your SSH Agent, meaning your keys are encrypted and require biometric approval to be used.

### Enable the Agent
1. Open 1Password Settings.
2. Go to **Developer**.
3. Check **Use the SSH Agent**.

![SCREENSHOT: 1Password Developer settings showing the SSH Agent toggle enabled]

### Configure SSH to use 1Password
Add this to your `~/.ssh/config`:

```sshconfig
Host *
  IdentityAgent "~/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock"
```

---

## 2. Managing Multiple Identities

If you have a personal GitHub account and a work account, SSH needs to know which key to send to which host. 

### The Identity Collision Problem
By default, SSH tries the first key it finds. If that key is valid but belongs to the wrong account, GitHub will reject you.

### The Solution: Host Aliases
Use unique hostnames in your `~/.ssh/config`:

```sshconfig
# Personal Account
Host github.com-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal.pub
  IdentitiesOnly yes

# Work Account
Host github.com-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_work.pub
  IdentitiesOnly yes
```

### Updating Your Git Remotes
Once you have defined these aliases, you must update your Git remote URLs to use them. Instead of the standard `git@github.com:user/repo.git`, use your alias:

```bash
# For a personal project
git remote set-url origin git@github.com-personal:username/repo.git

# For a work project
git remote set-url origin git@github.com-work:company/repo.git
```

This tells Git to use the specific SSH configuration (and thus the specific key) defined for that alias.

> [!IMPORTANT]
> Always use `IdentitiesOnly yes`. This prevents SSH from "spamming" the server with every key in your agent, which can lead to getting temporarily banned from the server.

---

## 3. Verifying and Debugging Authentication

When things go wrong, don't guess. Use the built-in diagnostic tools.

### Test Your Connection
```bash
ssh -T git@github.com
```

### See the "Handshake"
If it fails, add the verbose flag to see exactly which keys are being offered:
```bash
ssh -vT git@github.com
```

### List Active Keys
Check what's currently available in your agent (including 1Password keys):
```bash
ssh-add -l
```

[RECORDING: asciinema - Demonstration of 'ssh-add -l' and a successful 'ssh -T' connection]

---

## 4. Best Practices for SSH Security

1. **Use Ed25519**: It is faster and more secure than RSA.
2. **Set a Passphrase**: If you *must* use local files, never leave them without a passphrase.
3. **Audit Your Keys**: Regularly check `github.com/settings/keys` and remove old machines.
4. **Biometrics First**: Whenever possible, use 1Password with Touch ID.

---

## Summary
You've now secured the "front door" of your development environment. Your keys are managed, your identities are separated, and your authentication is biometric. Now that we have identity, let's [configure Git](git-and-version-control) to use it properly.

