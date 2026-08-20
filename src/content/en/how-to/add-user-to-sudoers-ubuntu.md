---
title: "How to Add a User to Sudoers in Ubuntu Server (The Clean Way)"
description: "A practical guide to granting sudo privileges on Ubuntu Server using modular drop-in files in /etc/sudoers.d/."
date: "2026-08-20"
tags: ["ubuntu", "linux", "sudo", "sysadmin", "security"]
category: "engineering"
language: "en"
slug: "how-to/add-user-to-sudoers-ubuntu"
draft: false
---

# How to Add a User to Sudoers in Ubuntu Server

When setting up a new Ubuntu Server instance or provisioning virtual machines, granting administrative (`sudo`) privileges to a regular user is one of the very first tasks.

While many tutorials recommend editing the monolithic `/etc/sudoers` file directly or appending users to the `sudo` group with `usermod`, the cleanest, most maintainable, and automation-friendly approach is using **modular drop-in configuration files** in `/etc/sudoers.d/`.

Here is a practical guide explaining why and how to configure user `sudo` access using this method.

---

## Why Use `/etc/sudoers.d/` Instead of `/etc/sudoers`?

Ubuntu and Debian-based systems include an `#includedir /etc/sudoers.d` directive in the primary `/etc/sudoers` file by default.

Using separate files inside `/etc/sudoers.d/` provides several distinct advantages:

* **Safe and Non-Destructive**: You never modify `/etc/sudoers` directly, eliminating the risk of corrupting core system defaults.
* **Modular and Easy to Clean**: Deleting a user's administrative access is as simple as removing their dedicated configuration file (`rm /etc/sudoers.d/<username>`).
* **Automation-Friendly**: Configuration management tools like Ansible, Terraform, Puppet, or `cloud-init` can deploy single, idempotent files without needing complex regex edits on `/etc/sudoers`.
* **Package Upgrade Safety**: Upgrades to the `sudo` package won't prompt you about conflicting changes in `/etc/sudoers`.

---

## Step-by-Step: Granting Sudo Access via `/etc/sudoers.d/`

You must run these commands as `root` or from an account that already has administrative rights.

### 1. Create the Drop-In Sudoers File

Create a file inside `/etc/sudoers.d/` named after the user.

#### Option A: Standard Sudo (Password Required)

```bash
echo "username ALL=(ALL:ALL) ALL" | sudo tee /etc/sudoers.d/username
```

#### Option B: Passwordless Sudo (For CI/CD or Automation Users)

If the user is dedicated to background jobs, deployments, or local development VMs and should not prompt for a password:

```bash
echo "username ALL=(ALL:ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/username
```

> [!NOTE]
> Replace `username` with the target user's actual username.

---

### 2. Set Secure File Permissions

Linux requires files in `/etc/sudoers.d/` to be read-only by `root` and unreadable by others. If the permissions are too open, `sudo` will reject the file for security reasons.

Set the permissions to `0440` (`r--r-----`):

```bash
sudo chmod 0440 /etc/sudoers.d/username
```

---

### 3. Validate Sudoers Syntax

Before logging out or testing, always validate your configuration syntax using `visudo -cf`:

```bash
sudo visudo -cf /etc/sudoers.d/username
```

If the file is valid, `visudo` will output:

```text
/etc/sudoers.d/username: parsed OK
```

> [!WARNING]
> If `visudo -cf` reports any syntax errors, remove or fix the file immediately. A corrupted file inside `/etc/sudoers.d/` can block all sudo access system-wide.

---

## 4. Verify Access

Switch to the user or log in as that user to verify privileges:

```bash
# Check privileges assigned to the user
sudo -l -U username

# Test execution
sudo whoami
```

If configured correctly, `sudo whoami` will return `root`.

---

## Important Rules for `/etc/sudoers.d/` Files

1. **No Dots in Filenames**: Files containing a period (`.`) or ending with a tilde (`~`) are silently ignored by `sudo`. For instance, `/etc/sudoers.d/user.conf` or `/etc/sudoers.d/username.bak` will not be loaded.
2. **Never Edit Directly Without Validation**: If you prefer an interactive editor, use `sudo visudo -f /etc/sudoers.d/username` rather than standard `nano` or `vim`. `visudo` automatically checks syntax before saving.

---

## Summary of Methods

| Method | Best For | Pros | Cons |
| :--- | :--- | :--- | :--- |
| **`/etc/sudoers.d/<file>`** | Automation, VMs, Production | Clean, modular, easy to script | Requires strict permissions (`0440`) |
| **`usermod -aG sudo <user>`** | Quick interactive desktop/server setups | Single command, simple | Group-based, less granular |
| **`sudo visudo` (Direct edit)** | Custom global defaults | Centralized | Risk of syntax errors in main file |
