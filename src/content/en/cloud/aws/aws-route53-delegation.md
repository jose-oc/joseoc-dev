---
title: "Splitting One Route 53 Hosted Zone into Delegated Subdomains"
description: "Learn how to split One Route 53 Hosted Zone into Delegated Subdomains."
date: "2026-05-04"
tags: ["aws", "route53", "cloud", "devops", "automation"]
category: "engineering"
language: "en"
slug: "splitting-aws-route53-hosted-zone-into-delegated-subdomains"
---

# Splitting One Route 53 Hosted Zone into Delegated Subdomains

If you already manage `xyz.com` in Amazon Route 53 and your records are starting to look like this:

- `a.abc.xyz.com`
- `b.abc.xyz.com`
- `c.abc.xyz.com`
- `a.def.xyz.com`
- `b.def.xyz.com`
- `c.def.xyz.com`
- `a.ghi.xyz.com`
- `b.ghi.xyz.com`
- `c.ghi.xyz.com`

you may want to break that single large hosted zone into smaller delegated subdomains:

- `abc.xyz.com`
- `def.xyz.com`
- `ghi.xyz.com`

This is a common and technically straightforward DNS pattern. The important part is doing the migration in the right order so DNS answers stay consistent.

This post explains the main DNS terms in simple language, shows the target structure, and gives a practical Route 53 runbook you can follow.

## Terms Used in This Post

Before the runbook, here are the DNS terms in plain language.

### Domain

A domain is a DNS name that people or systems use. In this post, `xyz.com` is the main domain.

Examples:

- `xyz.com`
- `abc.xyz.com`
- `a.abc.xyz.com`

### Subdomain

A subdomain is a name underneath another domain.

Examples:

- `abc.xyz.com` is a subdomain of `xyz.com`
- `a.abc.xyz.com` is a subdomain of `abc.xyz.com`

### Hosted Zone

A hosted zone in Route 53 is the container that holds DNS records for a domain or subdomain.

Examples:

- one hosted zone for `xyz.com`
- another hosted zone for `abc.xyz.com`

Think of a hosted zone as the place where Route 53 stores the DNS rules for that name.

### DNS Record

A DNS record is a single entry inside a hosted zone.

Examples:

- an `A` record mapping a name to an IPv4 address
- a `CNAME` record pointing one name to another
- an `MX` record for mail
- an `NS` record telling the world which name servers are authoritative

### Name Server

A name server is a DNS server that answers questions about a domain or subdomain.

When you create a public hosted zone in Route 53, AWS gives that zone four authoritative name servers.

### NS Record

An `NS` record is a DNS record that says, "for this domain or subdomain, ask these name servers."

This is the key to delegation.

Example:

If `xyz.com` contains an `NS` record for `abc.xyz.com`, resolvers learn that `abc.xyz.com` is managed somewhere else, using the name servers listed in that record.

### Delegation

Delegation is the act of handing responsibility for a subdomain from the parent zone to a child zone.

Example:

- parent zone: `xyz.com`
- child zone: `abc.xyz.com`

After delegation, records such as `a.abc.xyz.com` should be managed in the `abc.xyz.com` hosted zone, not in the `xyz.com` hosted zone.

### Parent Zone and Child Zone

The parent zone is the higher-level zone that delegates authority.
The child zone is the lower-level zone that receives authority.

Examples:

- parent: `xyz.com`
- child: `abc.xyz.com`

### TTL

TTL means "time to live." It tells DNS resolvers how long they may cache an answer before asking again.

Lower TTL values usually make changes visible sooner, but they also increase query traffic.

### Apex

The apex is the root name of a hosted zone itself.

Examples:

- the apex of the `xyz.com` zone is `xyz.com`
- the apex of the `abc.xyz.com` zone is `abc.xyz.com`

If you create a child zone for `abc.xyz.com`, records at `abc.xyz.com` itself must also move there.

## What We Are Trying to Achieve

We start with a single parent hosted zone:

```mermaid
graph TD
    A["Hosted Zone: xyz.com"] --> B["a.abc.xyz.com"]
    A --> C["b.abc.xyz.com"]
    A --> D["c.abc.xyz.com"]
    A --> E["a.def.xyz.com"]
    A --> F["b.def.xyz.com"]
    A --> G["c.def.xyz.com"]
    A --> H["a.ghi.xyz.com"]
    A --> I["b.ghi.xyz.com"]
    A --> J["c.ghi.xyz.com"]
```

We want to end up with this:

```mermaid
graph TD
    P["Hosted Zone: xyz.com"] --> NS1["NS for abc.xyz.com"]
    P --> NS2["NS for def.xyz.com"]
    P --> NS3["NS for ghi.xyz.com"]
    C1["Hosted Zone: abc.xyz.com"] --> A1["a.abc.xyz.com"]
    C1 --> A2["b.abc.xyz.com"]
    C1 --> A3["c.abc.xyz.com"]
    C2["Hosted Zone: def.xyz.com"] --> D1["a.def.xyz.com"]
    C2 --> D2["b.def.xyz.com"]
    C2 --> D3["c.def.xyz.com"]
    C3["Hosted Zone: ghi.xyz.com"] --> G1["a.ghi.xyz.com"]
    C3 --> G2["b.ghi.xyz.com"]
    C3 --> G3["c.ghi.xyz.com"]
```

The parent zone keeps control of `xyz.com`, but it delegates each subdomain to its own hosted zone.

## The One Rule That Matters Most

The safe migration order is:

1. Copy the records into the child hosted zone.
2. Add the delegation `NS` record in the parent zone.
3. Remove the old records from the parent zone.

Do not delete the old records first.

That would create a gap where the child zone is not yet authoritative and clients may get failures.

Also, do not leave duplicate records in both places for longer than necessary after delegation. Once the subdomain is delegated, Route 53 expects that subtree to be served by the child zone.

## Example Scenario

Assume the parent zone `xyz.com` currently contains:

- `abc.xyz.com A 192.0.2.10`
- `a.abc.xyz.com CNAME internal-lb-1.example.net`
- `b.abc.xyz.com A 192.0.2.11`
- `c.abc.xyz.com TXT "managed-by-team-abc"`

The goal is to create a dedicated hosted zone `abc.xyz.com` and move those records there.

## Runbook: Migrate `abc.xyz.com` into Its Own Hosted Zone

This runbook describes one subdomain migration. Repeat the same pattern for `def.xyz.com`, `ghi.xyz.com`, and any others.

### Step 1: Inventory the Records That Belong to the Child Zone

List every record that belongs under `abc.xyz.com`.

That means:

- records at the apex `abc.xyz.com`
- records below it, like `a.abc.xyz.com`, `b.abc.xyz.com`, and `c.abc.xyz.com`

Create a temporary checklist like this:

| Name | Type | Value |
| --- | --- | --- |
| `abc.xyz.com` | `A` | `192.0.2.10` |
| `a.abc.xyz.com` | `CNAME` | `internal-lb-1.example.net` |
| `b.abc.xyz.com` | `A` | `192.0.2.11` |
| `c.abc.xyz.com` | `TXT` | `"managed-by-team-abc"` |

Be careful not to miss the apex record at `abc.xyz.com` itself.

### Step 2: Lower TTLs Before the Migration Window

If the records currently have high TTLs, consider lowering them ahead of time.

Example:

- old TTL: `3600`
- temporary migration TTL: `300`

Do this early enough that caches have time to expire before the cutover window.

This step is optional, but it makes migrations easier to observe and easier to roll back.

### Step 3: Create the Child Hosted Zone

Create a new public hosted zone in Route 53 for:

- `abc.xyz.com`

Route 53 will automatically assign four authoritative name servers to this new hosted zone.

At this stage, the zone exists, but it is not yet delegated from the parent zone.

### Step 4: Recreate the Child Records in the New Hosted Zone

Add all `abc.xyz.com` records to the new `abc.xyz.com` hosted zone.

For our example, the child zone should contain:

- `abc.xyz.com A 192.0.2.10`
- `a.abc.xyz.com CNAME internal-lb-1.example.net`
- `b.abc.xyz.com A 192.0.2.11`
- `c.abc.xyz.com TXT "managed-by-team-abc"`

At the end of this step, the same functional records exist in both places:

- still present in the parent zone
- now also present in the child zone

That temporary duplication is expected before delegation.

### Step 5: Capture the Child Zone Name Servers

In the new `abc.xyz.com` hosted zone, find the `NS` record that Route 53 created automatically.

It will contain four name servers, something like:

- `ns-123.awsdns-45.com`
- `ns-678.awsdns-90.net`
- `ns-234.awsdns-56.org`
- `ns-789.awsdns-12.co.uk`

These are the authoritative name servers for the child hosted zone.

### Step 6: Delegate the Child Zone from the Parent Zone

In the parent hosted zone `xyz.com`, create an `NS` record for:

- name: `abc.xyz.com`

Its values must be the four Route 53 name servers assigned to the child hosted zone.

Conceptually, this says:

"For anything under `abc.xyz.com`, stop asking the `xyz.com` zone and start asking these child-zone name servers."

The delegation looks like this:

```mermaid
graph LR
    R["DNS Resolver"] --> P["Parent Zone: xyz.com"]
    P --> N["NS record for abc.xyz.com"]
    N --> C["Child Zone: abc.xyz.com"]
    C --> A["a.abc.xyz.com"]
```

### Step 7: Remove the Old Child Records from the Parent Zone

After the `NS` delegation record exists in `xyz.com`, delete the records that belong to the delegated child namespace from the parent zone.

Delete records such as:

- `abc.xyz.com A 192.0.2.10`
- `a.abc.xyz.com CNAME internal-lb-1.example.net`
- `b.abc.xyz.com A 192.0.2.11`
- `c.abc.xyz.com TXT "managed-by-team-abc"`

Do not delete the delegation `NS` record you just added.

After cleanup, the parent zone should keep only:

- its own `xyz.com` records
- the `NS` delegation for `abc.xyz.com`

And the child zone should now be the only place that contains records for the `abc.xyz.com` subtree.

### Step 8: Validate Resolution

Check that DNS now resolves through the child hosted zone.

Validation goals:

- `abc.xyz.com` resolves correctly
- `a.abc.xyz.com` resolves correctly
- `b.abc.xyz.com` resolves correctly
- `c.abc.xyz.com` resolves correctly

You can verify both:

- functional answers, such as correct `A`, `CNAME`, or `TXT` responses
- delegation, by confirming that `abc.xyz.com` returns the expected `NS` answers

### Step 9: Observe for a Short Period

Watch the migrated names during the first cache window after cutover.

Look for:

- unexpected `NXDOMAIN`
- answers coming from stale caches
- missing records that were not copied into the child zone

If you lowered TTLs before migration, this observation window is shorter and easier to reason about.

## Visualizing the Cutover

### Before Migration

```mermaid
graph TD
    P["Hosted Zone: xyz.com"] --> R1["abc.xyz.com A 192.0.2.10"]
    P --> R2["a.abc.xyz.com CNAME internal-lb-1.example.net"]
    P --> R3["b.abc.xyz.com A 192.0.2.11"]
    P --> R4["c.abc.xyz.com TXT managed-by-team-abc"]
```

### During Migration, Before Delegation

```mermaid
graph TD
    P["Hosted Zone: xyz.com"] --> R1["abc.xyz.com and children still present"]
    C["Hosted Zone: abc.xyz.com"] --> R2["Same records copied here"]
```

### After Delegation and Cleanup

```mermaid
graph TD
    P["Hosted Zone: xyz.com"] --> NS["NS record for abc.xyz.com only"]
    C["Hosted Zone: abc.xyz.com"] --> R1["abc.xyz.com A 192.0.2.10"]
    C --> R2["a.abc.xyz.com CNAME internal-lb-1.example.net"]
    C --> R3["b.abc.xyz.com A 192.0.2.11"]
    C --> R4["c.abc.xyz.com TXT managed-by-team-abc"]
```

## Why the Order Matters

The order is important because DNS authority changes in stages.

If you delete the records from the parent zone before creating the child zone and its delegation:

- clients may get missing answers
- resolvers may cache failures

If you delegate the child zone before copying the records into it:

- the child zone becomes authoritative
- but the records may not exist there yet
- clients may get incomplete answers or `NXDOMAIN`

If you leave the same records in both parent and child zones after delegation:

- behavior can become inconsistent
- different resolvers may follow different cached paths

So the safe sequence is always:

1. prepare the child zone
2. delegate the child zone
3. clean up the parent zone

## Rollback Plan

If something goes wrong immediately after delegation, the rollback path is usually simple.

### Fast Rollback

1. Restore the moved records in the parent `xyz.com` hosted zone if they were deleted.
2. Remove the delegation `NS` record for `abc.xyz.com` from the parent zone.

This returns authority for `abc.xyz.com` to the parent zone.

### Important Rollback Note

Rollback is affected by TTL and DNS caches.

Even after you restore the old setup, some resolvers may continue using cached delegation or cached answers until their TTL expires.

That is another reason to lower TTLs ahead of the migration when possible.

## Repeating the Pattern for Other Subdomains

Once `abc.xyz.com` is complete, repeat the same process for:

- `def.xyz.com`
- `ghi.xyz.com`

Each one gets:

- its own hosted zone
- its own Route 53 name servers
- its own delegation `NS` record in the parent zone

## A Common Future Design Detail

If one day you also want to split `jkl.abc.xyz.com` into its own hosted zone, the parent for that delegation is no longer `xyz.com`.

Instead:

- parent zone: `abc.xyz.com`
- child zone: `jkl.abc.xyz.com`

That is because delegation always happens from the nearest authoritative parent.

## Final Checklist

Use this checklist for each subdomain migration:

1. Inventory all records for the child namespace.
2. Lower TTLs if needed.
3. Create the child hosted zone.
4. Copy all relevant records into the child hosted zone.
5. Capture the child zone name servers.
6. Add the child `NS` delegation record in the parent zone.
7. Delete the moved records from the parent zone.
8. Validate answers and delegation.
9. Observe until caches settle.

## Closing Thought

Splitting a large Route 53 hosted zone into delegated subdomains is a well-supported DNS design and a sensible way to separate ownership, reduce clutter, and isolate changes.

The migration is not difficult, but the sequence matters:

copy first, delegate second, clean up third.
