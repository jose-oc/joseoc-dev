---
title: "Desarrollo moderno con Python en macOS: rápido y aislado con UV"
description: "Deja de pelearte con los entornos Python en macOS. Aprende a usar UV para gestionar dependencias a gran velocidad, aislar entornos y automatizar scripts."
date: "2026-04-18"
tags: ["python", "uv", "ansible", "devops", "automation"]
category: "engineering"
language: "es"
slug: "macos-setup-guide/python-and-automation-tooling"
---

## Por qué importa

Python es la "cinta americana" de DevOps, pero gestionar sus entornos es famoso por ser complicado. macOS viene con un "System Python" que **nunca** deberías tocar, porque modificarlo puede romper funciones básicas del sistema operativo.

La forma tradicional de gestionar Python con `pyenv`, `pip` y `virtualenv` es lenta y a menudo termina en el infierno de dependencias. Usando **UV**, un gestor moderno de Python escrito en Rust, tienes una única herramienta que se encarga de todo: versiones de Python, entornos virtuales y herramientas CLI globales, a velocidades entre 10 y 100 veces superiores a los métodos tradicionales.

### Beneficios clave
* **Aislamiento**: mantén el sistema limpio. Cada proyecto y cada herramienta tienen su propio espacio.
* **Velocidad**: instala dependencias en milisegundos, no en minutos.
* **Simplicidad**: una sola herramienta (`uv`) sustituye a tres o cuatro antiguas.

---

## 1. Instalar UV: la única herramienta que necesitas

En vez de instalar Python directamente, instalamos `uv`, que será quien gestione Python por nosotros.

```bash
brew install uv
```

### ¿Por qué UV?
* Actúa como **instalador de Python** y reemplaza a `pyenv`.
* Actúa como **instalador de paquetes** y reemplaza a `pip`.
* Actúa como **gestor de herramientas** y reemplaza a `pipx`.

---

## 2. Gestionar versiones de Python

¿Necesitas una versión concreta para un proyecto? UV lo hace trivial.

```bash
# Install the latest Python
uv python install 3.14

# List all available and installed versions
uv python list
```

### Pro-tip: fijar tu versión por defecto
Si quieres que `python3` en tu terminal apunte siempre a una versión gestionada por UV, añade un symlink en `~/.local/bin`, que debería estar en tu `PATH`:

```bash
ln -sfn "$(uv python find 3.14)" ~/.local/bin/python3
```

---

## 3. Herramientas CLI aisladas (Ansible y más)

Una de las mejores funciones de UV es su capacidad para instalar herramientas CLI como Ansible o Ruff en sus propios entornos virtuales ocultos, de modo que nunca entren en conflicto entre sí.

### Instalar Ansible correctamente
```bash
uv tool install --with-executables-from ansible-core,ansible-lint ansible
```

### ¿Por qué es mejor así?
* **Ansible** queda disponible globalmente.
* Tiene su propio entorno Python privado.
* Puedes actualizarlo con `uv tool upgrade ansible` sin afectar a nada más.

```shell
❯ uv tool list
ansible v8.7.0
- ansible-community
basedpyright v1.39.3
- basedpyright
- basedpyright-langserver
ruff v0.15.11
- ruff
```

---

## 4. Entornos virtuales por proyecto

Cuando empiezas un proyecto nuevo, UV hace que crear el entorno sea instantáneo.

```bash
# Create a venv and sync dependencies from pyproject.toml
uv venv
source .venv/bin/activate
uv sync
```

### Activación automática con Direnv
Si has seguido la [guía de secretos y entorno](/es/docs/macos-setup-guide/secrets-and-environment-management), puedes automatizarlo todavía más. No necesitas hacer `source .venv/bin/activate` manualmente si usas `direnv`.

Simplemente añade esto al `.envrc` del proyecto:

```bash
# .envrc
layout uv
```

> [!TIP]
> Para que `layout uv` funcione, añade este fragmento a `~/.config/direnv/direnvrc`:
> ```bash
> layout_uv() {
>   export VIRTUAL_ENV=${VIRTUAL_ENV:-$(pwd)/.venv}
>   if [[ ! -d $VIRTUAL_ENV ]]; then
>     uv venv
>   fi
>   PATH_add "$VIRTUAL_ENV/bin"
> }
> ```

Ahora, cada vez que hagas `cd` dentro del proyecto, `direnv` creará automáticamente el entorno virtual si no existe y lo activará por ti. Es la forma más limpia de trabajar con varios proyectos Python.

---

## 5. Buenas prácticas para Python en macOS

1. **Regla cero**: nunca hagas `sudo pip install`.
2. **Usa `.python-version`**: coloca este archivo en la raíz de tu proyecto y `uv` usará automáticamente la versión correcta.
3. **Automatiza con `uv run`**: puedes ejecutar un script sin crear siquiera un venv con `uv run script.py`; gestionará las dependencias al vuelo.

---

## Resumen
Ahora tienes una instalación moderna y rapidísima de Python que mantiene macOS impecable. Tus herramientas de automatización están aisladas y tus proyectos son reproducibles. Ahora que ya podemos automatizar, vamos a ver el [toolkit cloud y de Kubernetes](/es/docs/macos-setup-guide/kubernetes-and-devops-tooling).
