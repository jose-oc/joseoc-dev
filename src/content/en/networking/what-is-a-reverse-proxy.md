---
title: "What a Reverse Proxy Is and Why You Probably Use One"
description: "Learn what a reverse proxy does, how it sits in front of applications, and why it is useful for HTTPS, routing, load balancing, and access control."
date: "2026-06-03"
tags: ["networking", "reverse-proxy", "http", "nginx", "traefik"]
category: "networking"
language: "en"
slug: "networking/what-is-a-reverse-proxy"
draft: false
---

A reverse proxy is a server that sits in front of one or more backend applications and receives client requests before those applications do.

Instead of a user talking directly to the app, the user talks to the reverse proxy first.

The reverse proxy then decides what to do next:

- send the request to the right backend
- terminate HTTPS
- apply access rules
- add headers
- balance traffic across multiple servers

## The short version

If this feels abstract, think of it like a receptionist in front of an office building.

The receptionist does not do the work of every team inside the building. But the receptionist:

- receives people first
- checks where they should go
- may enforce access rules
- may protect the internal teams from direct exposure

That is roughly what a reverse proxy does for applications.

## Why it is called "reverse"

People often learn about a normal proxy first.

A normal forward proxy sits between the client and the internet. It represents the client.

A reverse proxy sits between the client and the server. It represents the server side.

So:

- forward proxy: "I am helping the client reach servers"
- reverse proxy: "I am helping servers receive and manage client traffic"

## A simple traffic flow

```text
User browser -> Reverse proxy -> Application
```

If there are multiple applications, it may look like this:

```text
User browser -> Reverse proxy -> App A
                             -> App B
                             -> App C
```

The user may only see one public hostname, while the reverse proxy routes requests internally.

## Common jobs of a reverse proxy

### 1. HTTPS termination

One of the most common jobs is handling TLS certificates and encrypted HTTPS connections.

Instead of configuring certificates separately in every application, the reverse proxy can:

- hold the certificate
- terminate TLS
- forward plain HTTP or re-encrypted traffic to the backend

This simplifies operations a lot.

### 2. Routing requests

A reverse proxy can send traffic to different backends depending on:

- hostname
- URL path
- headers

Examples:

- `grafana.example.com` -> Grafana
- `wiki.example.com` -> Wiki
- `example.com/api` -> API backend
- `example.com/app` -> frontend app

### 3. Load balancing

If you have several instances of the same application, the reverse proxy can spread requests between them.

That helps with:

- higher availability
- better capacity
- simpler scaling

### 4. Access control

A reverse proxy can enforce rules before the request reaches the backend.

Examples:

- require authentication
- allow only certain IP ranges
- block suspicious requests
- rate-limit abusive traffic

### 5. Header handling and identity propagation

Reverse proxies often add or forward useful headers such as:

- `X-Forwarded-For`
- `X-Forwarded-Proto`
- `X-Forwarded-Host`

These help the backend understand:

- the original client IP
- whether the original request used HTTPS
- which hostname the user requested

## Why this is useful in real environments

Without a reverse proxy, every application might need to handle:

- its own TLS certificates
- its own public exposure
- its own routing logic
- its own access filters

That often becomes messy.

A reverse proxy lets you centralize those concerns.

This is why they are common in:

- internal platforms
- Kubernetes ingress setups
- self-hosted dashboards
- microservice environments
- public websites

## A practical example

Imagine you host three services:

- Grafana
- Keycloak
- an internal app

You want all of them reachable over HTTPS.

With a reverse proxy:

- `grafana.example.com` goes to Grafana
- `login.example.com` goes to Keycloak
- `app.example.com` goes to the internal app

The reverse proxy becomes the public entry point, while the applications can stay on private addresses behind it.

## Reverse proxy vs load balancer

These terms overlap a lot.

A reverse proxy can do load balancing, and a load balancer can behave like a reverse proxy.

The useful distinction is:

- reverse proxy usually emphasizes request handling, routing, headers, TLS, and policy
- load balancer usually emphasizes spreading traffic across multiple backends

In real products, one tool often does both.

## Reverse proxy vs API gateway

An API gateway is usually more specialized.

It may include:

- authentication integration
- rate limiting
- request transformation
- API-specific policies
- developer portal features

A reverse proxy can be simple and general-purpose. An API gateway is often a more opinionated layer for APIs.

## Popular examples

Common reverse proxy technologies include:

- Nginx
- Traefik
- HAProxy
- Envoy
- Caddy

In Kubernetes, an ingress controller often acts as a reverse proxy for cluster services.

## Common problems people hit

Reverse proxies are useful, but they can also be the source of confusion.

Typical problems:

- backend app does not trust forwarded headers
- HTTPS redirects loop
- wrong hostname routing
- client IP appears as the proxy IP
- timeouts happen at the proxy layer, not the app

When troubleshooting, it helps to ask:

- did the request reach the proxy?
- did the proxy choose the right backend?
- did the backend return an error?
- did the proxy rewrite or block something on the way?

## Final takeaway

A reverse proxy is the front door for one or more applications.

It helps with:

- HTTPS
- routing
- load balancing
- access control
- cleaner public exposure

If you manage internal or public services, there is a good chance you are already using one, even if you did not call it that yet.
