---
title: "Networking Troubleshooting Commands by Problem"
description: "A concise lookup guide for common networking problems on Linux and macOS, organized by the problem you need to solve rather than by tool."
date: "2026-05-25"
tags: ["networking", "troubleshooting", "linux", "macos", "dns"]
category: "networking"
language: "en"
slug: "networking/troubleshooting-commands-by-problem"
---

This page is meant to answer one question fast:

what command do I run for the network problem I have right now?

It is organized by problem, not by tool.

## A port is already in use

Find the process using port `8080`:

```bash
sudo lsof -nP -iTCP:8080 -sTCP:LISTEN
```

On Linux, `ss` is also useful:

```bash
sudo ss -ltnp '( sport = :8080 )'
```

If you need to free the port, stop the service cleanly first. If that is not possible, kill the PID you found:

```bash
kill <pid>
```

Use `kill -9 <pid>` only as a last resort.

## I want to know whether a server is receiving my TCP or UDP packets

Watch packets arriving on port `9000`:

```bash
sudo tcpdump -i any port 9000
```

Only TCP:

```bash
sudo tcpdump -i any 'tcp port 9000'
```

Only UDP:

```bash
sudo tcpdump -i any 'udp port 9000'
```

This is the fastest way to answer “are packets reaching the machine at all?”

If you also want a simple listener for testing:

```bash
nc -l 9000
nc -u -l 9000
```

`nc` helps you verify the port is reachable. `tcpdump` helps you verify packets are really arriving.

## I want to check whether I can resolve a hostname

Basic lookup:

```bash
dig example.com
```

See the full DNS resolution path:

```bash
dig example.com +trace
```

Quick alternative:

```bash
host example.com
```

Use this when the question is “is DNS working?” before you debug the application itself.

## I want to know which DNS servers this machine is using

On macOS:

```bash
scutil --dns
```

On modern Linux with `systemd-resolved`:

```bash
resolvectl status
```

Fallback on Linux:

```bash
cat /etc/resolv.conf
```

This is useful when hostname resolution works on one machine but not on another.

## I want to know whether a network interface is up or down

On Linux:

```bash
ip address show
ip link show
```

On macOS:

```bash
ifconfig
```

If you already know the interface name:

```bash
ip link show dev eth0
ifconfig en0
```

Look for whether the interface is up and whether it has an IP address.

## I want to know which interface or source IP will be used to reach a host

On Linux:

```bash
ip route get 8.8.8.8
```

On macOS:

```bash
route get 8.8.8.8
```

This is very useful on hosts with multiple interfaces because it shows the route the kernel would actually choose.

## I want to test from a specific interface

On Linux, send `ping` through a specific interface:

```bash
ping -I eth0 8.8.8.8
```

Use `nc` with a specific source IP:

```bash
nc -s 192.168.1.10 example.com 443
```

This is useful when the machine has more than one NIC and you need to prove which path works.

## Quick rule of thumb

- Use `lsof` or `ss` to answer “what is using this port?”
- Use `tcpdump` to answer “are packets arriving?”
- Use `nc` to answer “can I connect or listen simply?”
- Use `dig` to answer “does DNS resolve?”
- Use `ip`, `ifconfig`, `route`, or `resolvectl` to answer “what network path is this machine actually using?”

If you are in a hurry, start with the question, not the tool name. That usually gets you to the right command faster.
