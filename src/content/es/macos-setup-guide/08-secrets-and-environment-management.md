---
title: "Gestionar secretos y entornos en macOS: 1Password CLI y Direnv"
description: "Gestiona variables de entorno y API keys de forma segura en macOS. Aprende a usar Direnv para configuraciones por proyecto y 1Password CLI para inyectar secretos en tu flujo DevOps."
date: "2026-04-18"
tags: ["secrets", "1password", "direnv", "security", "devops"]
category: "engineering"
language: "es"
slug: "macos-setup-guide/secrets-and-environment-management"
---

## Por qué importa

Como desarrollador, gestionas a diario docenas de API keys, contraseñas de bases de datos y credenciales cloud. Guardarlas en `.zshrc` o en archivos `.env` en texto plano supone un riesgo importante. Si subes un secreto por accidente a GitHub, tu infraestructura puede quedar comprometida en cuestión de minutos.

Una configuración profesional resuelve esto con dos herramientas: **1Password CLI** (para almacenamiento seguro) y **direnv** (para carga automática y específica por proyecto). Así te aseguras de que los secretos solo están disponibles cuando estás dentro del directorio adecuado y nunca se filtran a tu shell global.

> [!NOTE]
> Antes apoyaba casi todo el setup de herramientas y entorno en `direnv`, pero ahora uso `mise` para gestionar versiones y preparar el entorno de cada proyecto. Sigo dejando `direnv` en los ejemplos de abajo porque encaja bien para cargar secretos, pero si quieres comparar ambos flujos, empieza por [Cómo me pasé de `direnv` a `mise`](/es/docs/how-to/direnv-to-mise).

### Beneficios clave
* **Aislamiento**: las variables de entorno del "Proyecto A" no interfieren con las del "Proyecto B".
* **Seguridad**: los secretos permanecen cifrados en 1Password hasta el momento exacto en que se necesitan.
* **Automatización**: se acabó teclear `export AWS_PROFILE=...` cada vez que cambias de tarea.

---

## 1. Entornos contextuales con Direnv

**direnv** es una extensión de shell que carga y descarga variables de entorno según el directorio actual. Busca un archivo llamado `.envrc`.

### Instalación
```bash
brew install direnv
```

### Activarlo en Zsh
Añade esto a tu `~/.zshrc`:
```bash
eval "$(direnv hook zsh)"
```

### Uso: el archivo `.envrc`
Crea un `.envrc` en la raíz de tu proyecto:
```bash
# ~/.envrc
export AWS_PROFILE="my-dev-profile"
export KUBECONFIG="$PWD/kubeconfig.yaml"
```
Cuando hagas `cd` dentro de esa carpeta, direnv te pedirá autorización:
```bash
direnv allow
```
![Terminal showing variables loading automatically when entering a folder and unloading when leaving](../../../assets/terminal-direnv-load-variables.png)

---

## 2. Inyección segura de secretos con 1Password CLI

La **1Password CLI (`op`)** te permite referenciar secretos almacenados en tu vault mediante un formato URI, por ejemplo `op://Vault/Item/Field`.

### Instalación
```bash
brew install --cask 1password-cli
```

### Flujo "sin secretos en disco"
En vez de guardar una API key real dentro de `.env`, guarda la referencia:
```bash
# .env file (Safe to have on disk, but don't commit it!)
STRIPE_API_KEY=op://Private/Stripe/api_key
```

### Ejecutar comandos con secretos
Usa `op run` para inyectar los valores reales dentro de un proceso sin exportarlos nunca a tu shell:
```bash
op run --env-file=.env -- npm run dev
```

> [!TIP]
> 1Password abrirá un prompt de Touch ID. Una vez aprobado, `npm run dev` recibirá la clave real, pero si ejecutas `echo $STRIPE_API_KEY` en otra pestaña de terminal, seguirá vacío.

---

## 3. Sinergia: combinar Direnv y 1Password

El flujo DevOps ideal usa `direnv` para definir configuración no sensible y `1Password` para manejar los secretos.

### Ejemplo de `.envrc` para un proyecto cloud
```bash
# Set non-sensitive cloud context
export AWS_PROFILE=production
export AWS_REGION=us-east-1

# Use op run for the actual deployment
alias deploy="op run --env-file=.env -- terraform apply"
```

---

## 4. Buenas prácticas para proteger secretos

1. **Gitignore global**: asegúrate de que `.env` y `.envrc` están en tu [gitignore global](/es/docs/macos-setup-guide/git-and-version-control#4-handling-global-ignores).
2. **Biometría**: activa siempre Touch ID para la 1Password CLI y evita escribir contraseñas.
3. **Usa perfiles**: utiliza `AWS_PROFILE` o `GOOGLE_CLOUD_PROJECT` en lugar de hardcodear access keys.
4. **Tokens de corta duración**: prioriza sesiones de `op signin` que expiran frente a variables de entorno de larga vida.

---

## Resumen
Ahora tienes una manera segura y automatizada de gestionar contextos de proyecto y credenciales sensibles. Tus secretos están protegidos y tu terminal es consciente del contexto. Lo siguiente es [preparar tu entorno de Python y automatización](/es/docs/macos-setup-guide/python-and-automation-tooling) usando estas nuevas bases de seguridad.
