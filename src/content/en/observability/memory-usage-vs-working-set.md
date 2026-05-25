---
title: "memory_usage_bytes vs memory_working_set_bytes"
description: "A short practical guide to the difference between total container memory usage and working set memory, and when each metric is the better signal."
date: "2026-05-25"
tags: ["observability", "metrics", "kubernetes", "memory", "garage"]
category: "observability"
language: "en"
slug: "observability/memory-usage-vs-working-set"
---

These two metrics are both useful, but they answer different questions.

- `memory_usage_bytes`: total memory charged to the container cgroup, including reclaimable cache
- `memory_working_set_bytes`: memory the workload is actively keeping and is usually closer to what operators see in `kubectl top`

## When to use each one

Use `memory_usage_bytes` when the question is:

- how close is this pod to its memory limit?
- is cache growth leaving too little headroom?
- do I need a near-OOM risk alert?

This is the better metric for limit-risk alerts, because the kernel enforces the cgroup limit against total usage, not just active heap.

Use `memory_working_set_bytes` when the question is:

- is the application really memory-hungry right now?
- is sustained memory pressure likely real?
- does the process itself seem to be growing?

This is the better first signal for active memory pressure.

## Quick interpretation

- `memory_usage_bytes` high, `memory_working_set_bytes` low:
  likely cache-heavy; watch headroom, but active app pressure may still be modest
- both high:
  real memory pressure is much more likely
- both moderate:
  usage may be healthy even if the service is busy

Example from operations:

- total memory `500Mi`, working set `90Mi`: near-limit risk exists, but cache is probably a large part of the total
- total memory `500Mi`, working set `420Mi`: this is much more likely to be real pressure that deserves urgent attention

## Recommendation

- For alerts about “pod is very near its configured limit,” use `memory_usage_bytes`.
- For alerts about “the application is actively consuming a lot of memory,” use `memory_working_set_bytes`.
- In dashboards, keep both. Seeing them together makes the difference between cache growth and real working pressure much easier to interpret.

If you only choose one for day-to-day app pressure, start with `memory_working_set_bytes`. If you are protecting against OOM risk near a tight limit, `memory_usage_bytes` is the safer signal.
