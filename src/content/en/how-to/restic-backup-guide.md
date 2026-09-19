---
title: "Secure and Deduplicated Backups with Restic"
description: "A complete guide to fast, encrypted, and deduplicated backups using Restic across local drives, SFTP, and cloud storage backends."
date: "2026-09-16"
tags: ["restic", "backup", "security", "cli", "devops"]
category: "engineering"
language: "en"
slug: "how-to/restic-backup-guide"
draft: false
---

Backups are one of those things everyone knows they need, but many implementations end up fragile, slow, or cumbersome to verify. Traditional tools like `rsync` or `tar` either lack built-in client-side encryption, transfer redundant data across runs, or make point-in-time restores tedious.

[Restic](https://restic.net) is an open-source backup program written in Go. It encrypts repository data by default, reduces duplicate storage through content-defined deduplication, and supports local storage plus remote backends such as SFTP, Amazon S3, MinIO, and Backblaze B2.

```mermaid
flowchart LR
    subgraph Client ["Client Machine"]
        A["Local Files & Directories"] --> B["Content Chunking (Rabin Fingerprints)"]
        B --> C["Client-Side Encryption (AES-256)"]
    end
    subgraph Repo ["Encrypted Repository (Local / SFTP / S3 / B2)"]
        C --> D["Pack Files (Deduplicated Blobs)"]
        C --> E["Snapshots (Point-in-Time Trees)"]
        C --> F["Index & Keys"]
    end
```

---

## 1. Why Choose Restic?

Restic stands out for several key design choices:

- **Encrypted by default**: Every piece of data, metadata, snapshot index, and directory structure is encrypted using AES-256 (in CTR mode) and authenticated with Poly1305. The storage backend never sees plaintext data or file names.
- **Content-defined deduplication**: Files are split into dynamic chunks based on content rather than fixed blocks. If you rename a file, move it to another folder, or slightly modify a large file, only the modified chunks are uploaded.
- **Snapshot-based restores**: Each backup run generates an immutable snapshot. Restoring a directory to its exact state from two weeks ago is just as easy as restoring the latest backup.
- **Single static binary**: No daemons, background agents, database engines, or complex dependencies required.
- **Versatile backends**: Native support for Local disks, SFTP, REST Server, AWS S3, MinIO, Backblaze B2, Google Cloud Storage, and Microsoft Azure Blob Storage.

---

## 2. Installation

Restic is distributed as a single standalone executable and is packaged for all major operating systems.

### macOS
```bash
brew install restic
```

### Linux (Debian / Ubuntu)
```bash
sudo apt update && sudo apt install restic
```

### Linux (Fedora)
```bash
sudo dnf install restic
```

### Linux (RHEL / CentOS Stream)
```bash
sudo dnf install epel-release
sudo dnf install restic
```

### Linux (Alpine)
```bash
apk add restic
```

### Direct Download & Self-Update
You can download pre-compiled binaries directly from the [Restic GitHub Releases](https://github.com/restic/restic/releases). Once installed, Restic can update itself:

```bash
sudo restic self-update
```

---

## 3. Initializing a Repository

A **repository** is the encrypted directory or bucket where Restic stores all snapshots and deduplicated data packs. Before you can back up anything, you must initialize the repository.

### Local or External Drive
```bash
restic init --repo /Volumes/BackupDrive/restic-repo
```

When prompted, enter a secure password.

> [!CAUTION]
> If you lose your repository password, your data is **unrecoverable**. Restic uses strong cryptography with no backdoors or recovery master keys. Store your repository password in a password manager.

### Using Environment Variables
Passing `--repo` and entering a password on every command quickly becomes repetitive. You can streamline your shell session by setting environment variables:

```bash
export RESTIC_REPOSITORY="/Volumes/BackupDrive/restic-repo"
export RESTIC_PASSWORD="YourStrongPasswordHere"
```

> [!TIP]
> For scripts or automated workflows, point `RESTIC_PASSWORD_FILE` to a secure file with restricted permissions (`chmod 600`) or use `RESTIC_PASSWORD_COMMAND` to retrieve the secret dynamically from tools like `pass`, 1Password CLI (`op`), or macOS Keychain.

---

## 4. Creating Backups

Once the repository is initialized, backing up a file or directory is a single command:

```bash
restic backup ~/projects
```

Restic scans the target path, splits files into blobs, computes cryptographic hashes, compares them against the repository index, and uploads only new or modified data.

```console
Files:           1 new,     0 changed,     0 unmodified
Dirs:            2 new,     0 changed,     0 unmodified
Added to the repository: 1.117 KiB (988 B stored)

processed 1 files, 6 B in 0:00
snapshot c7273d18 saved

### Backing Up Multiple Targets with Tags
You can pass multiple directories in one backup command and attach tags to make searching and retention easier:

```bash
restic backup ~/projects ~/Documents ~/.config --tag workstation --tag dev
```

### Excluding Files and Directories
Use `--exclude` patterns or an exclude file to skip build artifacts, caches, and virtual environments:

```bash
restic backup ~/projects \
  --exclude "node_modules" \
  --exclude ".venv" \
  --exclude "*.log" \
  --exclude-caches
```

- `--exclude-caches`: Automatically skips any directory containing a `CACHEDIR.TAG` marker file (standard cache specification).
- `--exclude-file=excludes.txt`: Loads glob patterns line-by-line from a text file.
- `--one-file-system`: Prevents Restic from crossing filesystem boundaries (e.g., mounted network drives or external volumes).

---

## 5. Inspecting Snapshots and Changes

### List All Snapshots
```bash
restic snapshots
```

Output:
```console
ID        Time                 Host        Tags        Paths
-------------------------------------------------------------------------------
a8f419c2  2026-09-15 10:00:00  laptop      workstation /home/user/projects
b92c43e1  2026-09-16 09:30:00  laptop      workstation /home/user/projects
-------------------------------------------------------------------------------
2 snapshots
```

You can filter snapshots by tag or host:
```bash
restic snapshots --tag workstation --host laptop
```

### Inspecting Changes Between Two Snapshots
Restic includes a built-in diff tool to see what changed between backup points:

```bash
restic diff a8f419c2 b92c43e1
```

### Finding Specific Files Across Snapshots
To locate where a specific file exists within your repository:

```bash
restic find config.json
```

---

## 6. Restoring Data

### Full Snapshot Restore
To restore an entire snapshot to a destination directory:

```bash
restic restore a8f419c2 --target /tmp/restore-folder
```

You can also use the special alias `latest` instead of a snapshot ID:
```bash
restic restore latest --target /tmp/restore-folder
```

### Restoring Specific Files or Subdirectories
To extract only a specific folder or file from a snapshot without downloading the whole repository:

```bash
restic restore latest \
  --target /tmp/restore-folder \
  --include "/home/user/projects/website/src"
```

### Browsing Backups via FUSE Mount
One of Restic's most powerful capabilities is mounting the entire repository as a read-only virtual filesystem using FUSE:

```bash
mkdir /mnt/restic
restic mount /mnt/restic
```

While mounted, you can navigate your snapshots like regular directories:
- `/mnt/restic/snapshots/` contains every snapshot organized by date.
- `/mnt/restic/tags/` groups snapshots by tag.
- `/mnt/restic/hosts/` groups snapshots by hostname.

You can copy individual files out with standard tools (`cp`, `rsync`, or file managers) without running a full restore.

> [!NOTE]
> Mounting requires FUSE support (such as `macFUSE` on macOS or `fuse3` on Linux).

---

## 7. Retention Policy: Understanding `forget` vs `prune`

Managing snapshot lifecycle in Restic is split into two distinct steps:

1. **`restic forget`**: Removes snapshot metadata records according to your retention policy. The underlying data blobs remain in the repository pack files until pruned.
2. **`restic prune`**: Scans the entire repository, identifies unreferenced data blobs that no remaining snapshot points to, repacks active data, and deletes obsolete packs from storage.

```mermaid
flowchart TD
    A["Run restic forget --keep-daily 7 --keep-weekly 4"] --> B["Snapshot records unlinked from index"]
    B --> C["Data blobs still take up disk space"]
    C --> D["Run restic prune (or --prune flag)"]
    D --> E["Unreferenced blobs removed & space reclaimed"]
```

### Setting a Retention Policy
You can combine policy flags to keep a tiered set of snapshots:

```bash
restic forget \
  --keep-daily 7 \
  --keep-weekly 4 \
  --keep-monthly 12 \
  --keep-yearly 2 \
  --prune
```

### Safe Testing with `--dry-run`
Always test your retention policy before applying it:

```bash
restic forget --keep-daily 7 --keep-weekly 4 --dry-run
```

### Checking Repository Integrity
To verify that all snapshot trees, pack indexes, and cryptographic checksums match:

```bash
restic check
```

To also download and verify the payload of every data blob (recommended on a periodic schedule):

```bash
restic check --read-data
```

---

## 8. Working with Remote Storage Backends

Restic supports local directories as well as a wide variety of remote and cloud backends without requiring extra plugins.

### SFTP (Remote Linux Server / NAS)
```bash
export RESTIC_REPOSITORY="sftp:backupuser@nas.local:/srv/restic-backups"
restic init
```

### Amazon S3 / MinIO / Ceph
```bash
export RESTIC_REPOSITORY="s3:s3.eu-west-1.amazonaws.com/my-backup-bucket"
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export RESTIC_PASSWORD="RepositoryPassword"

restic init
```

For S3-compatible self-hosted servers like **MinIO**:
```bash
export RESTIC_REPOSITORY="s3:https://minio.internal.example.com/backups"
export AWS_ACCESS_KEY_ID="minioadmin"
export AWS_SECRET_ACCESS_KEY="miniopassword"
```

### Backblaze B2 (S3-compatible API)
```bash
export RESTIC_REPOSITORY="s3:https://s3.<region>.backblazeb2.com/my-backup-bucket/restic-data"
export AWS_ACCESS_KEY_ID="your-key-id"
export AWS_SECRET_ACCESS_KEY="your-application-key"
export RESTIC_PASSWORD="RepositoryPassword"

restic init
```

### Restic REST Server (Append-Only Protection)
The [rest-server](https://github.com/restic/rest-server) is a lightweight HTTP server designed specifically for Restic.

When run with the `--append-only` flag, backup clients can upload new snapshots and pack files, but **cannot delete or overwrite existing data**. Even if a client machine is fully compromised by ransomware, the attacker cannot delete previous backups stored on the server.

```bash
export RESTIC_REPOSITORY="rest:https://user:password@backup.example.com/repo-name"
restic backup ~/projects
```

---

## 9. Automation Example

Below is a Bash automation example suitable as a starting point for a cron job or systemd timer:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Repository location and credentials
export RESTIC_REPOSITORY="s3:s3.eu-west-1.amazonaws.com/prod-backups-bucket"
export RESTIC_PASSWORD_FILE="/etc/restic/password"
export AWS_SHARED_CREDENTIALS_FILE="/etc/restic/aws-credentials"

# Run backup
echo "[$(date)] Starting backup..."
restic backup \
  --tag automated \
  --tag daily \
  --exclude-caches \
  --exclude-file="/etc/restic/excludes.txt" \
  /var/www /etc /home

# Apply retention policy and prune
echo "[$(date)] Applying retention policy..."
restic forget \
  --tag automated \
  --keep-daily 7 \
  --keep-weekly 4 \
  --keep-monthly 6 \
  --prune

# Integrity check
echo "[$(date)] Running repository check..."
restic check

echo "[$(date)] Backup completed successfully."
```

---

## 10. CLI Quick Reference

| Task | Command |
| :--- | :--- |
| **Initialize Repo** | `restic init` |
| **Create Backup** | `restic backup /path/to/data` |
| **Backup with Excludes** | `restic backup /data --exclude "node_modules" --exclude-caches` |
| **List Snapshots** | `restic snapshots` |
| **Compare Snapshots** | `restic diff <ID_1> <ID_2>` |
| **Restore All Files** | `restic restore latest --target /restore/dir` |
| **Restore Single Path** | `restic restore latest --target /dir --include "/data/subfolder"` |
| **Mount as Filesystem** | `restic mount /mnt/restic` |
| **Apply Retention & Prune** | `restic forget --keep-daily 7 --keep-weekly 4 --prune` |
| **Verify Integrity** | `restic check --read-data` |
| **Check Repo Stats** | `restic stats` |

---

## Conclusion

Restic strikes an ideal balance between cryptographic security, storage efficiency, and simplicity. By handling deduplication, encryption, and remote backends out of the box without requiring specialized servers, it turns disaster recovery into a deterministic and verifiable routine.

For official documentation and deep dives into internal specifications, visit [restic.net](https://restic.net) and the [Restic GitHub Repository](https://github.com/restic/restic).
