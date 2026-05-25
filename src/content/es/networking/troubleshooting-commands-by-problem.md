---
title: "Comandos de troubleshooting de red"
description: "Guía corta de comandos para problemas habituales de red en Linux y macOS."
date: "2026-05-25"
tags: ["networking", "troubleshooting", "linux", "macos", "dns"]
category: "networking"
language: "es"
slug: "networking/troubleshooting-commands-by-problem"
---

Esta página está pensada para responder rápido a una sola pregunta:

qué comando tengo que ejecutar para el problema de red que tengo ahora mismo.

Está organizada por problema, no por herramienta.

## Un puerto ya está en uso

Encuentra el proceso que está usando el puerto `8080`:

```bash
sudo lsof -nP -iTCP:8080 -sTCP:LISTEN
```

En Linux, `ss` también es útil:

```bash
sudo ss -ltnp '( sport = :8080 )'
```

Si necesitas liberar el puerto, primero intenta detener el servicio de forma limpia. Si no es posible, mata el PID que encontraste:

```bash
kill <pid>
```

Usa `kill -9 <pid>` sólo como último recurso.

## Quiero saber si un servidor está recibiendo mis paquetes TCP o UDP

Mira los paquetes que llegan al puerto `9000`:

```bash
sudo tcpdump -i any port 9000
```

Sólo TCP:

```bash
sudo tcpdump -i any 'tcp port 9000'
```

Sólo UDP:

```bash
sudo tcpdump -i any 'udp port 9000'
```

Ésta es la forma más rápida de responder a “¿los paquetes están llegando a la máquina?”

Si además quieres un listener simple para probar:

```bash
nc -l 9000
nc -u -l 9000
```

`nc` (netcat) te ayuda a verificar que el puerto es alcanzable. `tcpdump` te ayuda a verificar que los paquetes realmente llegan.

## Quiero comprobar si puedo resolver un hostname

Búsqueda básica:

```bash
dig example.com
```

Ver todo el recorrido de resolución DNS:

```bash
dig example.com +trace
```

Alternativa rápida:

```bash
host example.com
```

Úsalo cuando la pregunta sea “¿funciona DNS?” antes de depurar la aplicación.

## Quiero saber qué servidores DNS está usando esta máquina

En macOS:

```bash
scutil --dns
```

En Linux moderno con `systemd-resolved`:

```bash
resolvectl status
```

Fallback en Linux:

```bash
cat /etc/resolv.conf
```

Esto es útil cuando la resolución funciona en una máquina pero no en otra.

## Quiero saber si una interfaz de red está levantada o caída

En Linux:

```bash
ip address show
ip link show
```

En macOS:

```bash
ifconfig
```

Si ya conoces el nombre de la interfaz:

```bash
ip link show dev eth0
ifconfig en0
```

Fíjate en si la interfaz está levantada y si tiene una dirección IP asignada.

## Quiero saber qué interfaz o IP origen se usará para llegar a un host

En Linux:

```bash
ip route get 8.8.8.8
```

En macOS:

```bash
route get 8.8.8.8
```

Esto es muy útil en hosts con varias interfaces porque muestra la ruta que el kernel elegiría de verdad.

## Quiero probar desde una interfaz concreta

En Linux, envía `ping` por una interfaz específica:

```bash
ping -I eth0 8.8.8.8
```

Usa `nc` con una IP origen concreta:

```bash
nc -s 192.168.1.10 example.com 443
```

Esto es útil cuando la máquina tiene más de una NIC y necesitas demostrar qué camino funciona.

## Regla rápida

- Usa `lsof` o `ss` para responder “¿qué está usando este puerto?”
- Usa `tcpdump` para responder “¿están llegando paquetes?”
- Usa `nc` para responder “¿puedo conectar o escuchar de forma simple?”
- Usa `dig` para responder “¿DNS resuelve?”
- Usa `ip`, `ifconfig`, `route` o `resolvectl` para responder “¿qué camino de red está usando realmente esta máquina?”

Si vas con prisa, empieza por la pregunta y no por el nombre de la herramienta. Eso suele llevarte al comando correcto más rápido.
