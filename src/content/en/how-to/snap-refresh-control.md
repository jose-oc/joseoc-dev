---
title: "Snap on Ubuntu: how to control (and stop) automatic updates"
description: "snapd updates snaps by itself, several times a day. How to hold refreshes with snap refresh --hold, tune refresh.timer and refresh.hold, and what your options are if you want zero automatic updates on a VM."
date: "2026-10-03"
tags: ["ubuntu", "snap", "snapd", "sysadmin", "unattended-upgrades"]
category: "engineering"
language: "en"
slug: "how-to/snap-refresh-control"
draft: false
---

If you turned off `unattended-upgrades` on a machine because you control patching yourself, there is a gap left: **snaps update on their own**, through a mechanism that has nothing to do with APT. This guide continues [unattended-upgrades on Ubuntu](/docs/how-to/unattended-upgrades-control) and has the same goal: the machine does not update without your control.

---

## How snaps get updated

The `snapd` daemon checks for updates **four times a day** by default. Each check is called a *refresh*. It uses neither `apt-daily` nor `unattended-upgrades`, so neither the mask nor the `0` from the previous guide affects it.

First see which snaps you have, because Ubuntu Server often ships with some preinstalled:

```bash
snap list
```

And when the last refresh happened and when the next one is due:

```bash
snap refresh --time
```

```bash
# What the next refresh would update
snap refresh --list
```

---

## Option 1: hold refreshes with `--hold`

```bash
# All snaps, indefinitely
sudo snap refresh --hold=forever

# One snap, for 72 hours
sudo snap refresh --hold=72h firefox
```

With no duration, the default is `forever`. To remove the hold:

```bash
sudo snap refresh --unhold
```

Mind the difference in scope:

- `--hold` with no names (all snaps): blocks automatic refreshes only. A manual `snap refresh` still works.
- `--hold <snap>` (specific snaps): blocks automatic refreshes and also a general `snap refresh`.

In both cases, a `snap refresh <snap>` aimed at one specific snap still goes through. For a VM you update yourself, that is what you want: nothing happens on its own, and you decide when and what.

---

## Option 2: set the window with `refresh.timer`

If you'd rather let refreshes happen, but inside your maintenance window:

```bash
sudo snap set system refresh.timer=sat,03:00-04:00
```

Check it with `snap refresh --time`. This controls *when*, not *whether*.

---

## Option 3: `refresh.hold` with a date

```bash
sudo snap set system refresh.hold="$(date --date='+30 days' +%Y-%m-%dT%H:%M:%S%:z)"
```

It holds the next refresh until that date and time, in RFC 3339 format. The maximum is **90 days**; after that, the refresh happens even if the value is still set. It postpones; it does not turn anything off.

---

## What about a real "disable"?

`snapd` has no official switch to turn refreshes off. The closest are two paths:

1. **`snap refresh --hold=forever`**: snaps keep working and never update by themselves. This is what I'd use on a VM with its own patching. Better still if you put it in Ansible, idempotent, and verify it with `snap refresh --time`.
2. **Remove the snaps and `snapd`**, if you don't need them: nothing left to update. Check `snap list` first: removing a snap your system uses can break something.

> [!WARNING]
> With `--hold=forever` snaps **get no security patches** until you update them yourself. It's the same deal as with APT: if you stop it, patching becomes your job. Add `snap refresh --list` to your process to see what is pending.

---

## Summary

- Snaps update through `snapd`, not APT: turning off `unattended-upgrades` doesn't touch them.
- `sudo snap refresh --hold=forever` is the most direct way to stop automatic refreshes and keep updating by hand.
- `refresh.timer` moves the window; `refresh.hold` only postpones, up to 90 days.
- There is no official "disable"; either you hold, or you remove `snapd`.

## References

- [Manage updates for snaps (official documentation)](https://snapcraft.io/docs/how-to-guides/manage-snaps/manage-updates/)
- [unattended-upgrades on Ubuntu: how to really turn it off](/docs/how-to/unattended-upgrades-control)
