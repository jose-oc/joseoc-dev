---
title: "Automatizar la configuración de macOS: Homebrew, Brewfile y herramientas CLI esenciales"
description: "Aprende a automatizar tu entorno de desarrollo en macOS con Homebrew y Brewfile. Instala herramientas CLI esenciales para una workstation DevOps rápida y reproducible."
date: "2026-04-18"
tags: ["macos", "homebrew", "setup", "devops", "automation"]
category: "engineering"
language: "es"
slug: "macos-setup-guide/base-system-setup-macos"
---

## Por qué importa

Configurar un Mac nuevo a mano es un proceso lento y propenso a errores. Olvidas qué herramientas necesitas, qué versiones eran estables y cómo habías dejado configurado todo.

Usando **Homebrew** y un **Brewfile**, conviertes una "configuración manual" en un "script documentado y reproducible". Así te aseguras de que, tanto en una máquina nueva como ayudando a otra persona del equipo, el entorno sea idéntico cada vez.

### Beneficios clave
* **Velocidad**: instala más de 50 herramientas con un solo comando.
* **Consistencia**: evita el síndrome de "en mi máquina funciona".
* **Mantenimiento**: actualiza todas tus herramientas de una sola vez.

---

## 1. Instalar Homebrew: el gestor de paquetes de macOS

Homebrew es la base de cualquier entorno moderno de desarrollo en macOS. Te permite gestionar tanto herramientas de línea de comandos como aplicaciones gráficas (mediante Casks) desde la terminal.

### Cómo instalarlo
Ejecuta el script oficial de instalación:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Configuración posterior a la instalación
En los Mac con Apple Silicon debes añadir Homebrew a tu `PATH`. Ejecuta estos comandos en tu terminal:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

---

## 2. Verificar la salud del sistema

Antes de instalar paquetes, asegúrate de que tu sistema está en buen estado.

```bash
brew doctor
Your system is ready to brew.
```

> [!TIP]
> Si `brew doctor` devuelve avisos sobre "unlinked kegs" o "outdated command line tools", sigue sus sugerencias de inmediato. Un informe limpio de `doctor` evita el 90 % de los errores futuros de instalación.

---

## 3. Instalar el toolkit base para desarrollo

No instalamos solo herramientas; instalamos **multiplicadores de rendimiento**. Estas utilidades modernas, muchas escritas en Rust, sustituyen a herramientas Unix clásicas más lentas.

```bash
brew install bat eza fd fzf gh git-delta mise ripgrep rsync uv zoxide
brew install --cask font-hack-nerd-font
```

### ¿Por qué estas herramientas?
* **`ripgrep` (`rg`)**: 10 veces más rápido que `grep`. Esencial para buscar en monorepos grandes.
* **`zoxide`**: un `cd` más inteligente que aprende tus hábitos.
* **`fzf`**: el "fuzzy finder" que hace instantánea la búsqueda en historial o archivos.
* **`uv`**: el gestor de paquetes Python más rápido disponible hoy.

---

## 4. Reproducibilidad con Brewfile

El secreto de una workstation "desechable" es el `Brewfile`. Actúa como un `package.json` para todo tu sistema operativo.

### Crear tu primer Brewfile
Genera una instantánea de tu sistema actual:

```bash
brew bundle dump --file="$HOME/Brewfile" --force
```

### Usar tu Brewfile en un Mac nuevo
Cuando tengas un ordenador nuevo, simplemente ejecuta:

```bash
brew bundle install --file="$HOME/Brewfile"

❯ brew bundle check
The Brewfile's dependencies are satisfied.
```

---

## Buenas prácticas
1. **Versiona tu Brewfile**: guárdalo en tu repositorio de [dotfiles](/es/docs/macos-setup-guide/dotfiles-and-reproducibility).
2. **Audítalo con frecuencia**: ejecuta `brew bundle cleanup` para eliminar herramientas que ya no uses.
3. **Usa Casks para todo**: incluso apps como Slack, VS Code o Discord pueden gestionarse con Homebrew Cask.

## Resumen
Al dominar Homebrew y Brewfile, pasas de la "configuración manual" a la "infraestructura como código" para tu portátil personal. Ya estás listo para [configurar tu terminal](/es/docs/macos-setup-guide/terminal-setup-macos).
