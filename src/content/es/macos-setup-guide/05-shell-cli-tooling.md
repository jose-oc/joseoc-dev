---
title: "El toolkit moderno de DevOps: herramientas CLI esenciales para macOS"
description: "Mejora tu terminal con herramientas CLI modernas basadas en Rust. Aprende a usar Ripgrep, FD, Bat y Eza para buscar y navegar por tu sistema macOS 10 veces más rápido."
date: "2026-04-18"
tags: ["zsh", "cli", "ripgrep", "fzf", "devops"]
category: "engineering"
language: "es"
slug: "macos-setup-guide/shell-cli-tooling"
---

## Por qué importa

Las herramientas Unix clásicas como `ls`, `grep` y `find` fueron diseñadas hace décadas para otra era de la computación. Siguen siendo fiables, pero son lentas y no ofrecen las ayudas visuales que hoy necesitan los desarrolladores.

Al cambiar a un **toolkit moderno** (en gran parte escrito en Rust), obtienes herramientas más rápidas y con mejores valores por defecto, como ignorar automáticamente directorios `.git`, aplicar resaltado de sintaxis y ofrecer una experiencia mucho más intuitiva.

### Beneficios clave
* **Rendimiento**: `ripgrep` puede buscar millones de líneas en milisegundos.
* **Valores por defecto inteligentes**: `fd` y `rg` respetan tu `.gitignore` automáticamente.
* **Ayuda visual**: `eza` y `bat` usan colores e iconos para ayudarte a procesar la información más rápido.

---

## 1. Guía de reemplazo: clásico vs moderno

Este es el mapa de herramientas que deberías empezar a usar hoy para mejorar tu productividad.

| Herramienta clásica | Reemplazo moderno | ¿Por qué? |
| :--- | :--- | :--- |
| `ls` | `eza` | Añade colores, iconos y estado de Git al listado de archivos. |
| `cat` | `bat` | Añade resaltado de sintaxis y números de línea. |
| `grep` | `ripgrep` (`rg`) | Mucho más rápido; respeta `.gitignore`. |
| `find` | `fd` | Sintaxis simplificada y mucho mejor rendimiento. |
| `cd` | `zoxide` (`z`) | Recuerda tus carpetas frecuentes; navega con 1 o 2 letras. |

---

## 2. Preparar las herramientas

Si has seguido la [configuración del sistema base](/es/docs/macos-setup-guide/base-system-setup-macos), ya las tienes instaladas con Homebrew. Si no:

```bash
brew install bat eza fd ripgrep zoxide
```

### Configurar alias
Para que la transición sea transparente, añade estos alias a tu `~/.zshrc`:

```bash
alias ls="eza --icons --group-directories-first"
alias ll="eza -lh --icons --git"
alias cat="bat"
alias grep="rg"
alias find="fd"
```

Ejemplo de salida de `eza`:
![A 'eza' output showing file listings with icons and colors](../../../assets/eza-example.png)

Ejemplo de salida de `bat`:
![A 'bat' output showing syntax highlighting](../../../assets/bat-example.png)

---

## 3. Navegación inteligente con Zoxide

`zoxide` es un `cd` más inteligente. Va registrando qué directorios visitas con mayor frecuencia.

### Uso
En vez de escribir `cd ~/code/projects/my-awesome-app`, puedes escribir:
```bash
z awesome
```
Zoxide encontrará la mejor coincidencia y te llevará allí al instante.

Selección interactiva:

```bash
zi
```

Reemplazar `cd`:

```bash
alias cd="z"
```

![Terminal showing fast navigation between deep directories using zoxide](../../../assets/terminal-using-zoxide.svg)

---

## 4. Búsquedas ultrarrápidas con Ripgrep (`rg`)

`ripgrep` es la herramienta definitiva para buscar texto. Es tan rápida que VS Code la usa como motor de búsqueda interno.

### Comandos habituales
```bash
# Search for "TODO" in all files, ignoring node_modules and .git
rg "TODO"

# Search for "TODO" only in the current directory
rg "TODO" .

# Search for "TODO" in all files, including hidden files
rg --hidden "TODO"


# Search only in Markdown files
rg -t md "DevOps"

# Search and replace (pipe to sed or use a tool like fastmod)
rg "OldName" --replace "NewName"

# Combine with fzf to search in files
rg "TODO" | fzf
```

---

## 5. Inspección de archivos mejorada con Bat

`bat` es `cat` con esteroides. Detecta extensiones de archivo y aplica resaltado de sintaxis automáticamente.

### Pro-tip: integración con Git
`bat` puede mostrarte exactamente qué líneas han cambiado en un archivo respecto a tu último commit de Git.

```bash
bat src/main.rs
```

## 6. Buscar mejor con `fd`

`fd` es un reemplazo de `find`, pero con mejores valores por defecto y mejor rendimiento.

### Uso
```bash
# Find all files in the current directory
fd

# Find all files in the current directory, including hidden files
fd --hidden

# Find all files in the current directory, ignoring node_modules and .git
fd --exclude node_modules --exclude .git

# Find all files in the current directory, ignoring node_modules and .git
fd --exclude node_modules --exclude .git

# Find by extension
fd -e yaml

# Combine with fzf
fd | fzf
```

## 7. Glow

Glow es un visor de Markdown que renderiza Markdown con colores ANSI y estilos atractivos directamente en la terminal.

![Glow rendering a Markdown file in the terminal with proper formatting and colors](../../../assets/glow-example.png)

### ¿Por qué usar Glow?

Los visores normales de Markdown suelen mostrar texto plano, que puede ser más difícil de leer. Glow transforma Markdown en un documento rico y bien formateado dentro de la terminal, perfecto para revisar README rápido o consultar documentación sobre la marcha.

#### Comandos habituales

```bash
# View a Markdown file
glow README.md

# View multiple Markdown files
glow README.md CHANGES.md

# View all Markdown files in a directory
glow my-dir/

# Enable pager (scrollable view for large files)
glow -p README.md

# Disable line wrapping
glow --width 100 README.md
```

---

## Resumen
Al sustituir herramientas Unix clásicas por equivalentes modernos, has eliminado fricción de tu uso diario de la terminal. Tus búsquedas son más rápidas, tu navegación más inteligente y tus archivos más fáciles de leer. Lo siguiente es llevar estas herramientas al siguiente nivel con [mejoras de usabilidad de la shell](/es/docs/macos-setup-guide/shell-usability-improvements).
