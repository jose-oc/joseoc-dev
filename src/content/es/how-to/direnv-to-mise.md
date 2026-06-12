---
title: "Cómo me pasé de `direnv` a `mise`"
description: "Una comparación práctica entre `direnv`, `aqua`, `asdf`, `proto` y `mise`, y por qué ahora uso `mise` en mi día a día."
date: "2026-06-12"
tags: ["direnv", "mise", "tooling", "python", "devops"]
category: "engineering"
language: "es"
slug: "how-to/direnv-to-mise"
draft: false
---

Hace un tiempo me puse a revisar gestores de herramientas para macOS con una idea bastante concreta en la cabeza:

- gestionar versiones de `kubectl`
- gestionar versiones de `talosctl`
- si pudiera ser, también `python`, `node` o incluso `ansible`
- y, sobre todo, ver si seguía teniendo sentido mantener `direnv` o cambiarlo por otra cosa

No tengo quejas de `direnv`: para lo que yo necesitaba me ha servido bien durante bastante tiempo. El problema era que quería gestionar varias versiones de `kubectl` y `talosctl`, y ahí `direnv` no juega en esa liga. Así que empecé a buscar una herramienta para éso, con una regla muy simple: si además me servía para reemplazar lo que hacía `direnv`, mejor quedarme con una sola pieza en vez de dos.

Miré varias opciones:

- `asdf`
- `proto`
- `aqua`
- `mise`

`asdf` sigue siendo perfectamente válido, pero hoy se siente más antiguo y más dependiente de plugins desiguales donde no hay medidas de seguridad. `proto` me pareció interesante para runtimes, pero menos claro para el tipo de CLI de infraestructura que yo quería gestionar. Así que al final me quedé con dos candidatas serias:

- `aqua`
- `mise`

Y la pregunta de fondo pasó a ser menos "qué gestor de versiones me gusta más" y más bien:

**¿quiero seguir con `direnv`, o quiero que otra herramienta cubra también la parte de entorno?**

## La versión corta

Si quieres algo muy bueno para CLIs como `kubectl` y `talosctl`, con una historia de seguridad muy sólida y sin meterte demasiado en el comportamiento del shell, `aqua` es una opción muy buena.

Si quieres una herramienta más ambiciosa, que además de gestionar herramientas pueda ocuparse también de variables de entorno, activación por directorio, Python, tareas y parte del flujo que antes hacía `direnv` en mi caso, `mise` tiene mucho sentido.

Yo acabé eligiendo `mise`.

## Por qué `mise`

`mise` me convenció por varias cosas:

- puede gestionar `kubectl` y `talosctl`
- también encaja bien con `python`
- se integra bien con `uv`
- permite configuración por directorio con `mise.toml`
- puede sustituir bastante bien a `direnv` si tu uso de `direnv` era sobre todo "poner variables, activar Python y ajustar `PATH`"

Hay un detalle importante: `mise` no te anima demasiado a convivir con `direnv` de forma intensa. No porque se rompan entre ellos, sino porque los dos quieren hacer cosas parecidas:

- reaccionar al entrar en un directorio
- tocar `PATH`
- activar runtimes
- preparar el entorno

Si ambos intentan mandar a la vez, empiezan las sorpresas.

Aquí vienen dos términos que conviene aclarar, porque salen mucho al hablar de estas herramientas:

- **hook**: en este contexto, es el fragmento que añades al shell para que una herramienta se ejecute automáticamente cuando cambia algo relevante, normalmente al entrar en un directorio o al inicializar la shell. Por ejemplo, `eval "$(mise activate zsh)"` instala el hook de `mise` en `zsh`.
- **shim**: es un ejecutable pequeño e intermedio que se coloca antes que la herramienta real en el `PATH`. Su trabajo es interceptar la llamada, decidir qué versión toca usar y delegar en el binario correcto. Muchas herramientas de versionado usan shims; `mise` puede trabajar con activación de shell y también con ese tipo de mecanismo según el caso.

En otras palabras:

- el **hook** prepara el entorno
- el **shim** decide qué binario acaba ejecutándose

Cuando mezclas varias herramientas que tocan esas dos cosas a la vez, es cuando aparecen los comportamientos raros.

La conclusión práctica para mí fue bastante clara:

- si eliges `mise`, mejor dejar que `mise` lleve el peso
- si te quedas con `direnv`, entonces probablemente `aqua` tiene más sentido como compañero

## Qué sustituye bien `mise`

Si en `direnv` hacías cosas como estas:

```sh
export AWS_PROFILE=deployer
export ANSIBLE_CONFIG=$PWD/ansible.cfg
source_env .env.local
PATH_add bin
layout python
```

todo eso encaja bastante bien en `mise.toml`.

Por ejemplo:

```toml
[tools]
python = "3.13"

[settings]
python.uv_venv_auto = "create|source"

[env]
AWS_PROFILE = "deployer"
ANSIBLE_CONFIG = "{{config_root}}/ansible.cfg"
UV_PYTHON = { value = "{{ tools.python.path }}", tools = true }
_.file = ".env.local"
_.path = ["bin"]
```

Eso ya cubre bastante terreno:

- selecciona la versión de Python
- crea y activa `.venv` automáticamente cuando usas `uv`
- carga variables desde `.env.local`
- añade `bin/` al `PATH`

No es idéntico a `direnv`, pero para muchos repos es suficiente. Y en algunos casos, incluso más limpio.

## Lo que `mise` no hace tan bonito como `direnv`

Aquí también conviene ser honesto.

`mise` es muy bueno en lo declarativo, pero menos elegante cuando tienes lógica shell algo más "creativa".

Por ejemplo, en `direnv` es muy típico hacer cosas como:

- crear un fichero con un valor por defecto si no existe
- validar que haya una ruta concreta
- ejecutar lógica condicional más libre

Eso en `direnv` sale natural porque `.envrc` al final es shell.

Un ejemplo real bastante típico sería algo así:

```sh
export ANSIBLE_CONFIG=$PWD/ansible.cfg

inventory_file="$PWD/.envrc.inventory"
if [[ ! -f "$inventory_file" ]]; then
  cat <<'EOF' > "$inventory_file"
export POC_DEPLOY_ENV=STAGING
EOF
fi

watch_file "$inventory_file"
source_env "$inventory_file"

if [[ -z "${POC_DEPLOY_ENV:-}" ]]; then
  echo "POC_DEPLOY_ENV must be set in .envrc.inventory" >&2
  exit 1
fi

inventory_hosts_file="$PWD/inventories/${POC_DEPLOY_ENV}/hosts.yml"
if [[ ! -f "$inventory_hosts_file" ]]; then
  echo "Inventory hosts file not found: $inventory_hosts_file" >&2
  exit 1
fi

export ANSIBLE_INVENTORY="$inventory_hosts_file"
```

En `direnv`, eso resulta muy cómodo porque:

- crea el fichero local si falta
- lo recarga cuando cambia
- valida variables obligatorias
- valida la ruta derivada
- y para con un error claro si algo falla

En `mise` parte de eso encaja bien, pero no todo queda igual de natural. Por ejemplo:

- cargar un fichero local, sí
- exigir que exista una variable, también
- derivar una ruta a partir de esa variable, también
- crear automáticamente un fichero local, ya no queda tan natural
- hacer validaciones shell algo más elaboradas tampoco es donde `mise` brilla más

Mi sensación aquí es que `mise` gana cuando simplificas el flujo. Por ejemplo:

- mover `POC_DEPLOY_ENV` a `mise.local.toml`
- usar `mise.toml` para las variables compartidas
- dejar la validación más compleja para una tarea o un script específico

Con `mise` se puede resolver, pero normalmente toca simplificar:

- mover los valores locales a `mise.local.toml`
- usar archivos `.env.local`
- evitar demasiada lógica shell dinámica

Y, sinceramente, muchas veces eso termina siendo una mejora. Menos magia suele significar menos sorpresas.

## Seguridad: `aqua` frente a `mise`

En seguridad, `aqua` me dejó mejor sensación por defecto.

Su modelo está muy centrado en:

- descargar binarios de forma declarativa
- verificar checksums
- apoyarse en Cosign, SLSA y attestations
- reducir al mínimo la lógica externa que se ejecuta

Eso va especialmente bien a CLIs como `kubectl` y `talosctl`.

`mise`, por su parte, también tiene una historia de seguridad buena, pero más amplia y más configurable:

- lockfiles
- trust de configuración
- `minimum_release_age`
- modos más estrictos como `paranoid`
- verificación de procedencia en varios backends

Mi resumen sería:

- `aqua` tiene una postura más segura por defecto para CLIs
- `mise` cubre más casos de uso, así que conviene ser un poco más cuidadoso si quieres apretarlo bien en seguridad

Como yo quería que una sola herramienta me ayudara también con Python y sustituyera parte de `direnv`, `mise` seguía ganando.

Si quieres la explicación de cuándo merece la pena mover un proyecto a `pyproject.toml`, lo he separado en otro artículo: [Cuándo merece la pena pasar a `pyproject.toml`](/es/docs/how-to/pyproject-toml-migration).

## Ejemplo de `mise.toml` para un proyecto con `pyproject.toml`

Si el proyecto ya usa `pyproject.toml`, yo haría algo así:

```toml
[tools]
python = "3.13"
uv = "latest"

[settings]
python.uv_venv_auto = "create|source"

[env]
UV_PYTHON = { value = "{{ tools.python.path }}", tools = true }
UV_CACHE_DIR = "{{config_root}}/.uv-cache"
_.file = ".env.local"
_.path = ["bin"]

[tasks.sync]
description = "Sincroniza el entorno del proyecto"
run = "uv sync"
sources = ["pyproject.toml", "uv.lock"]
outputs = [".venv"]
```

Si quieres añadir una dependencia en este flujo, ejecuta `uv add httpx`. 

Y el flujo sería este:

```sh
mise install
mise run sync
```

Lo importante aquí es separar responsabilidades:

- `mise` activa Python y el entorno
- `uv` gestiona el virtualenv y sincroniza dependencias
- las tareas de `mise` te dan un punto de entrada cómodo

Yo no haría que `uv pip sync` se lance automáticamente cada vez que entras al repo con `cd`. Se puede intentar imitar ese comportamiento, pero suele ser peor idea:

  - hace más lento entrar en el directorio
  - añade efectos secundarios inesperados
  - convierte una acción de lectura en una acción de escritura

Mejor mantenerlo explícito.

## Ejemplo de `mise.toml` para un proyecto con `requirements.txt`

Si el repo todavía usa `requirements.in` y `requirements.txt`, yo lo montaría así:

```toml
[tools]
python = "3.13"
uv = "latest"

[settings]
python.uv_venv_auto = "create|source"

[env]
UV_PYTHON = { value = "{{ tools.python.path }}", tools = true }
UV_CACHE_DIR = "{{config_root}}/.uv-cache"
_.file = ".env.local"
_.path = ["bin"]

[tasks.sync-deps]
description = "Sincroniza el virtualenv desde requirements.txt"
run = "uv pip sync requirements.txt"
sources = ["requirements.txt"]
outputs = [".venv"]

[tasks.lock-deps]
description = "Regenera requirements.txt"
run = "uv pip compile --output-file requirements.txt requirements.in"
sources = ["requirements.in"]
outputs = ["requirements.txt"]
```

Ese flujo encaja mejor con el enfoque antiguo:

- mantener `requirements.in` como fuente de verdad
- regenerar `requirements.txt` cuando cambien las entradas
- sincronizar el virtualenv desde el fichero fijado
