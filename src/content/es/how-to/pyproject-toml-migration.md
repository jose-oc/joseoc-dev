---
title: "Cuándo merece la pena pasar a pyproject"
description: "Cómo decidir cuándo un repo Python debería pasar de archivos de requirements a pyproject, y qué ganas cuando lo haces."
date: "2026-06-12"
tags: ["python", "pyproject", "uv", "mise", "tooling"]
category: "engineering"
language: "es"
slug: "how-to/pyproject-toml-migration"
draft: false
---

Yo suelo ver `pyproject.toml` como el punto en el que un repo Python deja de parecer una bolsa de scripts sueltos y empieza a parecer un proyecto de verdad.

Eso no significa que todos los repos deban migrar ya. Si `requirements.in`, `requirements.txt`, `uv pip compile` y `uv pip sync` te funcionan bien, no hay premio por cambiarlos solo porque al ecosistema le guste `pyproject.toml`.

El cambio empieza a tener sentido cuando se alinean varias cosas:

- el repo va a vivir bastante tiempo
- más gente toca el código
- la gestión de dependencias ya es algo más que un simple archivo de requirements
- quieres que `uv` gestione el proyecto de forma más nativa
- quieres un `uv.lock` versionado
- quieres un sitio estándar para metadatos, dependencias y configuración de herramientas

## Qué te da `pyproject.toml`

La ventaja principal es que junta en un solo sitio las piezas importantes del proyecto:

- nombre y versión del proyecto
- versión mínima de Python
- dependencias
- extras opcionales
- backend de build
- configuración de herramientas

Eso viene bien tanto si usas `uv` como si alrededor del proyecto tienes `ruff`, `pytest` u otras herramientas.

Además, encaja muy bien con `uv`. En modo proyecto, `uv` usa `pyproject.toml` como raíz, mantiene `.venv` junto al repo y usa `uv.lock` para fijar el estado resuelto.

## Una forma razonable de hacer el cambio

Si yo migrara un repo, lo haría sin inventarme nada raro:

1. añadir un `pyproject.toml` mínimo
2. mover las dependencias a `project.dependencies`
3. dejar que `uv sync` cree o actualice el virtualenv
4. versionar `uv.lock`
5. dejar la configuración local del flujo en `mise.toml`

Un ejemplo sería este:

```toml
[project]
name = "mi-proyecto"
version = "0.1.0"
requires-python = ">=3.13"
dependencies = [
  "httpx",
  "pydantic",
]

[build-system]
requires = ["uv_build>=0.11.7,<0.12.0"]
build-backend = "uv_build"
```

Y con `mise`:

```toml
[tools]
python = "3.13"
uv = "latest"

[settings]
python.uv_venv_auto = "create|source"

[env]
UV_PYTHON = { value = "{{ tools.python.path }}", tools = true }
_.file = ".env.local"
_.path = ["bin"]

[tasks.sync]
description = "Sincroniza el entorno del proyecto"
run = "uv sync"
sources = ["pyproject.toml", "uv.lock"]
outputs = [".venv"]
```

Así separas bien cada cosa:

- `pyproject.toml` describe el proyecto
- `uv.lock` fija la resolución de dependencias
- `mise.toml` se encarga del flujo local

## Cuándo no migraría todavía

Yo lo dejaría como está si:

- el repo es pequeño y estable
- el flujo con requirements ya es predecible
- es un proyecto heredado que funciona bien así
- la migración va a meter más ruido que valor

La idea no es modernizar por modernizar. La idea es que el proyecto sea más fácil de entender y mantener.

## Flujo relacionado

Si además estás ajustando la configuración de herramientas por directorio, escribí eso aparte en [Cómo me pasé de `direnv` a `mise`](/es/docs/how-to/direnv-to-mise).
