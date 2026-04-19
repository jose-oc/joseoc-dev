---

title: "Kubernetes and DevOps Tooling"
description: "Install and configure essential Kubernetes and DevOps tools, including kubectl, kubectx, k9s, and Lima."
date: "2026-04-18"
tags: ["kubernetes", "devops", "kubectl", "lima"]
category: "engineering"
language: "en"
slug: "kubernetes-and-devops-tooling"
-------------------------------------

## Overview

This section describes how to install and configure essential tools for working with Kubernetes and infrastructure systems.

The setup focuses on:

* interacting with Kubernetes clusters efficiently
* managing contexts and namespaces safely
* inspecting cluster state quickly
* providing a local Linux environment for testing and debugging

The tools are CLI-first, with optional graphical alternatives.

---

## Installing Kubernetes CLI Tools

Install the core tools:

```bash
brew install kubectl kubectx
brew install derailed/k9s/k9s
```

This installs:

* `kubectl`: the official Kubernetes CLI
* `kubectx`: tool to switch between Kubernetes contexts
* `kubens`: tool to switch namespaces (included with kubectx)
* `k9s`: terminal-based Kubernetes UI

---

## kubectl

`kubectl` is the primary interface to interact with Kubernetes clusters.

### Verify installation

```bash
kubectl version --client
```

### Basic usage

List pods:

```bash
kubectl get pods
```

List resources across all namespaces:

```bash
kubectl get pods --all-namespaces
```

Describe a resource:

```bash
kubectl describe pod <pod-name>
```

View logs:

```bash
kubectl logs <pod-name>
```

---

## kubectx and kubens

Switching contexts and namespaces with raw `kubectl` commands is verbose.

### kubectx

List contexts:

```bash
kubectx
```

Switch context:

```bash
kubectx my-cluster
```

Return to previous:

```bash
kubectx -
```

---

### kubens

List namespaces:

```bash
kubens
```

Switch namespace:

```bash
kubens my-namespace
```

---

## Shell Integration

Enable completion in `.zshrc`:

```bash
source <(kubectl completion zsh)
```

Add aliases:

```bash
alias k="kubectl"
alias kgp="kubectl get pods"
alias kgs="kubectl get services"
alias kgd="kubectl get deployments"
alias kgn="kubectl get nodes"
alias kd="kubectl describe"
alias kl="kubectl logs"
```

---

## Safety Practices

Before running any command, check the current context:

```bash
kubectl config current-context
```

Check the active namespace:

```bash
kubectl config view --minify --output 'jsonpath={..namespace}'; echo
```

This prevents accidental changes in the wrong cluster.

---

## k9s

`k9s` provides a terminal UI for Kubernetes.

Start:

```bash
k9s
```

### Key features

* real-time view of cluster resources
* navigation between namespaces and contexts
* log inspection
* resource description

### Useful commands inside k9s

* `:ns` → switch namespace
* `:ctx` → switch context
* `l` → view logs
* `d` → describe resource
* `y` → view YAML

---

## Freelens (optional)

Install:

```bash
brew install --cask freelens
```

Freelens is a graphical Kubernetes interface.

Use it when:

* visual overview is preferred
* inspecting complex resource relationships
* debugging cluster state interactively

CLI tools remain faster for routine tasks.

---

## Lima (Local Linux Environment)

Install:

```bash
brew install lima
```

Start default VM:

```bash
limactl start
```

Enter VM:

```bash
limactl shell default
```

---

## Why Use Lima

Lima provides a lightweight Linux virtual machine on macOS.

Use cases:

* test Ansible playbooks
* reproduce production issues
* run Linux-specific tooling
* isolate environments

This is especially useful when macOS behavior differs from Linux.

---

## Optional Container Workflow

Install:

```bash
brew install nerdctl
```

Use:

```bash
nerdctl ps
nerdctl run ...
```

This provides Docker-like commands without Docker Desktop.

---

## Best Practices

* Always verify context before applying changes
* Use kubectx/kubens instead of raw kubectl config commands
* Prefer CLI tools for speed and automation
* Use k9s for inspection, not automation
* Use Lima for Linux parity testing

---

## Common Issues

### Wrong cluster

Cause:

* incorrect context

Fix:

```bash
kubectl config current-context
kubectx <correct-context>
```

---

### Missing resources

Cause:

* wrong namespace

Fix:

```bash
kubens
kubens <namespace>
```

---

### Slow workflows

Cause:

* using kubectl manually for everything

Fix:

* use aliases
* use k9s
* use fzf where applicable

---

## Summary

At this point:

* Kubernetes CLI tools are installed and configured
* Context and namespace management is simplified
* Cluster inspection is efficient using k9s
* A local Linux environment is available via Lima

This setup provides a complete foundation for Kubernetes and DevOps workflows.
