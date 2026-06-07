---
title: "Quick Networking Commands"
description: "A short note with useful networking commands worth keeping close at hand."
date: "2026-06-05"
tags: ["networking", "kubernetes", "k3s", "ssh"]
category: "networking"
language: "en"
slug: "networking/networking-quick-commands"
---

This page keeps short commands I use from time to time so I do not have to look them up again.

## Fetch the kubeconfig from a remote K3S server

This command copies the `kubeconfig` from a remote K3S node, rewrites `127.0.0.1` to the server's real IP, and saves it locally ready to use:

```bash
HOST=10.188.222.30; ssh myuser@"$HOST" 'sudo cat /etc/rancher/k3s/k3s.yaml' | sed "s#https://127.0.0.1:6443#https://$HOST:6443#" > ~/.kube/k3s-kube-test-app-kube-config && chmod 600 ~/.kube/k3s-kube-test-app-kube-config
```

Replace the IP, SSH user, and output filename in `~/.kube/` as needed.
