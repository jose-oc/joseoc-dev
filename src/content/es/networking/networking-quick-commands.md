---
title: "Comandos rápidos de red"
description: "Una nota corta con comandos útiles para tareas de red que conviene tener a mano."
date: "2026-06-05"
tags: ["networking", "kubernetes", "k3s", "ssh"]
category: "networking"
language: "es"
slug: "networking/networking-quick-commands"
---

Esta página guarda comandos cortos que uso de vez en cuando y no quiero volver a buscar.

## Traer el kubeconfig de un servidor K3S remoto

Este comando copia el `kubeconfig` de un nodo K3S remoto, cambia `127.0.0.1` por la IP real del servidor y lo deja listo para usar en local:

```bash
HOST=10.188.222.30; ssh myuser@"$HOST" 'sudo cat /etc/rancher/k3s/k3s.yaml' | sed "s#https://127.0.0.1:6443#https://$HOST:6443#" > ~/.kube/k3s-kube-test-app-kube-config && chmod 600 ~/.kube/k3s-kube-test-app-kube-config
```

Cámbialo por tu IP, tu usuario SSH y el nombre del fichero que quieras guardar en `~/.kube/`.
