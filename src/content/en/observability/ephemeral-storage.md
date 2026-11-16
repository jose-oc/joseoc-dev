---
title: "Ephemeral Storage in Kubernetes: What Counts and How the Kubelet Enforces It"
description: "What ephemeral-storage requests, limits and emptyDir sizeLimit actually do in Kubernetes: what the kubelet counts, how it measures, and why enforcement is eviction, not a hard quota."
date: "2026-11-13"
tags: ["kubernetes", "storage", "resources", "eviction", "observability"]
category: "observability"
language: "en"
slug: "observability/ephemeral-storage"
draft: false
---

Every pod gets ephemeral storage: space on the node's local disks that exists only while the pod does. "Ephemeral" is the key word: there is no long-term guarantee of durability. The data does not follow the pod: a recreated pod starts with empty storage, and a node failure can lose the data entirely. Pods use it for scratch space, caches and logs, and the kubelet uses the same storage for container images, writable container layers and node-level container logs.

One accounting nuance worth stating up front: the ephemeral-storage resource is local disk. A memory-backed (tmpfs) `emptyDir` counts as container **memory**, not as ephemeral storage.

This is the resource behind the `ephemeral-storage` requests and limits, and behind the `sizeLimit` of an `emptyDir` volume. It comes up the moment something on a node writes more than expected, for example in the [logrotate sidecar pattern](/docs/how-to/kubernetes-sidecar-log-rotation).

## What the kubelet counts

When the kubelet measures a pod's ephemeral storage, it adds up:

- The writable layer of each container (what the container writes on top of its image).
- Local `emptyDir` volumes. One exception: a memory-backed (`tmpfs`) `emptyDir` counts as container **memory**, not storage.
- The pod's own logs, the ones the kubelet writes under `/var/log/pods`.
- Small system files Kubernetes maps into the pod, such as `/etc/hosts`.

At node level, container images live on the same storage too, so pulling large images consumes the same disk the pods write to.

## What a request does, and what it does not

A request is a **scheduling input**, nothing more. When the pod is created, the scheduler sums the `ephemeral-storage` requests of its containers and only picks a node whose allocatable ephemeral storage can fit that sum.

A request does not reserve disk. Nothing sets those bytes aside, and another pod can fill the filesystem in the meantime.

## What a limit does, and what it does not

A limit is enforced by the kubelet, **after the fact**:

- Container level: if a container's writable layer plus its logs exceed its limit, the kubelet marks the pod for eviction.
- Pod level: the kubelet sums the limits of all containers. If the total usage of all containers plus the pod's `emptyDir` volumes exceeds that sum, it also marks the pod for eviction.

Two properties follow from how the kubelet works, and both matter:

- **Enforcement is measurement plus eviction, not a write-time quota.** The kubelet measures usage with periodic scans, and evaluates eviction thresholds on its housekeeping interval (10 seconds by default). A process writing fast can overshoot its limit between checks; nothing blocks the writes. The limit decides that the pod gets evicted, not that the write fails.
- **Eviction can be immediate.** With the default hard eviction thresholds there is no graceful period: the kubelet kills the pod with a 0s grace period to reclaim the resource.

And one caveat in the other direction: if the node's filesystem layout is not one of the supported ones, the kubelet cannot measure ephemeral storage at all, and then it does not evict pods for breaching these limits. The node only reacts when the filesystem actually fills, by tainting itself and evicting pods that do not tolerate the taint.

## Where emptyDir sizeLimit fits

A `sizeLimit` on an `emptyDir` bounds that one volume, and the volume's usage counts toward the pod-level total described above. In the official example, a pod whose two containers each have a 4Gi limit (8Gi summed) can have an `emptyDir` with `sizeLimit: 500Mi` inside that same budget. The sizeLimit is a net for one volume; the limits are a net for the whole pod. Neither stops a write mid-flight.

## Units: the `400m` trap

Quantities are bytes. The suffixes are case-sensitive: `400Mi` is 400 mebibytes, `400M` is 400 megabytes, and `400m` is 0.4 bytes. The lowercase `m` means milli, exactly like CPU. Nobody who writes `400m` of storage means 0.4 bytes, but that is what they get.

## Recommendation

Set `ephemeral-storage` requests and limits on containers that write (scratch files, caches, file-based logs), and a `sizeLimit` on every `emptyDir` that can grow. Treat the numbers as a sizing exercise with margin, not as a guarantee: the kubelet reacts after measuring, and the rest of the node shares the same disk. The signal to watch is disk usage and eviction events on the node, not just whether pods are Running.

## References

- [Kubernetes: Local ephemeral storage](https://kubernetes.io/docs/concepts/storage/ephemeral-storage/)
- [Kubernetes: Resource Management for Pods and Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
- [Kubernetes: Node-pressure Eviction](https://kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/)
