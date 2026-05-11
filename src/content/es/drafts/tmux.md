---
title: Cómo uso tmux en el trabajo diario
description: Una forma sencilla de gestionar múltiples sesiones de manera eficiente
date: 2026-04-18
tags: [tmux, productivity]
category: engineering
language: es
slug: tmux
draft: true
---

# Cómo uso tmux en el trabajo diario

Uso tmux para gestionar todo lo que ejecuto en local.

---

## Idea básica

En lugar de abrir varias terminales, uso:

- sesiones
- ventanas
- paneles

---

## Mi flujo de trabajo

- una sesión por proyecto
- una ventana por contexto (backend, logs, etc.)
- dividir paneles cuando hace falta

---

## Comandos útiles

Crear una sesión:

```bash
tmux new -s project
```

Conectarse:

```bash
tmux attach -t project
```

Dividir un panel:

```bash
Ctrl + b %
```

Por qué lo uso
- todo permanece organizado
- puedo desconectarme y volver más tarde
- no necesito múltiples ventanas de terminal

Lleva un poco de tiempo acostumbrarse, pero merece la pena.
