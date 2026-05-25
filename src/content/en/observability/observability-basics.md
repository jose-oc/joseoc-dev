---
title: "Observability Basics: Metrics, Logs, Traces, and Practical Lessons"
description: "Learn the core concepts of observability, how metrics, logs, and traces fit together, and the practical habits that make systems easier to understand in production."
date: "2026-05-25"
tags: ["observability", "monitoring", "metrics", "logs", "tracing"]
category: "observability"
language: "en"
slug: "observability/observability-basics"
---

If you are starting with observability, the first useful idea is this:

observability is not only about collecting data. It is about being able to understand what your system is doing, why it is behaving that way, and what changed when something goes wrong.

That matters because real incidents are rarely clean. Users report “the app is slow” or “sometimes requests fail,” but the answer is usually spread across several places:

- a metric that moved
- a log line with context
- a trace that shows where time was spent
- a deployment or configuration change that happened shortly before

Observability helps you connect those pieces faster.

## Observability vs monitoring

People often use both words as if they were the same thing, but they are not exactly the same.

- Monitoring tells you that something is wrong.
- Observability helps you investigate why it is wrong.

Monitoring is usually built around known failure modes:

- CPU too high
- error rate too high
- disk almost full

Observability becomes important when the problem is less obvious:

- latency increased, but only for one endpoint
- one dependency is slow only in one region
- memory grows over time, but restarts hide the pattern

Monitoring raises the hand. Observability helps you ask better questions.

## The three main signals

Most observability systems are built around three core signals:

### Metrics

Metrics are numeric values collected over time.

Examples:

- request rate
- error count
- response latency
- CPU usage
- memory usage

Metrics are good for:

- dashboards
- alerts
- trend analysis
- capacity planning

They are usually the fastest way to answer “is the system healthy right now?”

### Logs

Logs are detailed records of discrete events.

Examples:

- an HTTP request failed with status `500`
- a pod restarted
- a database connection timed out
- an authentication token was rejected

Logs are good for:

- exact error messages
- debugging edge cases
- capturing local context such as IDs, payload size, retries, or upstream hostnames

Logs are often where you confirm the specific failure after a metric tells you where to look.

### Traces

Traces show the path of a request or operation across services and components.

They are especially useful in distributed systems because they answer questions like:

- where did the time go?
- which downstream dependency was slow?
- which service returned the error first?

If metrics tell you “checkout latency is high,” traces can show whether the time was spent in the API, the cache, the database, or an external service.

## A simple way to think about them together

When an incident starts:

- metrics tell you **that** something changed
- logs tell you **what** happened
- traces tell you **where** it happened

None of these signals is enough on its own all the time. The real value comes from correlation.

> [!TIP]
> If your dashboard shows a spike, your next step should be only one or two clicks away from related logs or traces. Fast navigation matters more than pretty dashboards.

## The concepts worth learning early

If you want a strong foundation, focus on these concepts first.

### Latency, traffic, errors, saturation

A practical starting point is the “golden signals” model:

- latency: how long work takes
- traffic: how much work the system is handling
- errors: how often work fails
- saturation: how close a resource is to its limit

This model is useful because it keeps you from looking only at availability while missing performance and capacity problems.

### SLIs and SLOs

- SLI: a service level indicator, the metric you use to measure behavior
- SLO: a service level objective, the target you want that behavior to meet

Example:

- SLI: percentage of requests served under 300 ms
- SLO: 99% of requests under 300 ms over 30 days

These are useful because they force you to define what “good enough” means for users instead of chasing every noisy graph.

### Cardinality

Cardinality means how many unique label combinations a metric produces.

For example, a metric labeled by:

- service
- endpoint
- region
- pod

can still be reasonable. A metric labeled by `user_id`, `session_id`, or raw URLs can become expensive and hard to query very quickly.

This is one of the first practical lessons most teams learn the hard way.

## Practical lessons from experience

The basics matter, but a few habits usually make the biggest difference in real systems.

### 1. Start with user-facing behavior

Do not begin only with infrastructure graphs.

Start by answering:

- can users log in?
- can they complete the main workflow?
- are key endpoints fast enough?

Infrastructure metrics matter, but user-facing signals help you prioritize the right problem.

### 2. Alerts should be actionable

An alert that only says “memory high” is weak.

A better alert includes:

- which workload is affected
- how long the problem has lasted
- which threshold was crossed
- where to investigate next

Good alerts shorten diagnosis time. Bad alerts teach people to ignore notifications.

### 3. Context beats volume

Collecting more logs does not automatically make a system easier to understand.

Well-structured logs with useful fields are more valuable than a huge volume of vague messages. Include identifiers, operation names, status codes, retry counts, and dependency names when they help explain behavior.

### 4. Name things consistently

Consistent metric names, labels, dashboard titles, and alert wording reduce confusion during incidents.

If different teams use different words for the same thing, troubleshooting gets slower than it should.

### 5. Record changes near incidents

Deployments, feature flags, config changes, and infrastructure updates often explain sudden behavior changes.

One of the most useful observability habits is simply making change events visible next to system graphs.

### 6. Dashboards are for communication, not decoration

A dashboard should help someone answer a real question:

- Is the service healthy?
- Which dependency is slow?
- Is this getting worse?
- Did the last deployment change the error rate?

If a graph does not help answer a question, it may not need to exist.

## A practical first setup

If you are building your first observability setup, keep it simple:

1. Create a dashboard for one service with request rate, error rate, latency, CPU, and memory.
2. Add structured logs with request IDs, status codes, and dependency errors.
3. Instrument traces for the main request path.
4. Add a few alerts for real symptoms, not every possible metric.
5. Review incidents and improve instrumentation after each one.

This is enough to learn a lot without drowning in tooling.

## Common mistakes at the beginning

- Building dashboards before defining the questions they should answer.
- Alerting on everything and training people to ignore alerts.
- Using labels with unbounded cardinality.
- Treating logs as unstructured text when structured fields would help.
- Looking only at infrastructure and missing what users actually experience.

## Final takeaway

Observability is not a luxury for large companies. It is one of the most practical ways to reduce time spent guessing in production.

Start with the basics:

- a few strong metrics
- useful logs
- traces on important paths
- alerts tied to user impact

Then improve from real incidents, real debugging sessions, and real operational pain. That is usually where the best observability practices come from.
