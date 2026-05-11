---
title: "Elegir y configurar el mejor terminal para macOS: Ghostty vs iTerm2"
description: "Optimiza tu flujo de trabajo en la terminal sobre macOS. Compara Ghostty e iTerm2, instala Nerd Fonts y configura atajos de teclado para una experiencia de desarrollo de alto rendimiento."
date: "2026-04-18"
tags: ["macos", "terminal", "ghostty", "iterm2", "productivity"]
category: "engineering"
language: "es"
slug: "macos-setup-guide/terminal-setup-macos"
---

## Por qué importa

La terminal es donde pasas el 90 % de tu tiempo como desarrollador. Una terminal lenta o mal configurada no es solo una molestia; es un cuello de botella. El input lag, el renderizado incorrecto de caracteres y los atajos rotos te sacan del flujo.

Una terminal de alto rendimiento garantiza que el sistema reaccione tan rápido como piensas, con tipografía clara y el feedback visual necesario para tareas DevOps complejas.

### Beneficios clave
* **Menor latencia**: renderizar más rápido implica menos fatiga visual y mejor sensación de uso.
* **Claridad visual**: las Nerd Fonts habilitan iconos que aportan contexto instantáneo (estado de Git, clústeres de K8s).
* **Eficiencia**: los key mappings correctos para navegar por palabras te ahorran miles de pulsaciones cada día.

---

## 1. Elegir tu emulador: Ghostty vs iTerm2

Aunque macOS incluye `Terminal.app`, carece de las funciones y del rendimiento necesarios para trabajo profesional.

### Ghostty: el demonio moderno de la velocidad (recomendado)
Ghostty es una terminal multiplataforma acelerada por GPU escrita en Zig. Está diseñada para ser minimalista, configurable por archivo y extremadamente rápida.

```bash
brew install --cask ghostty
```

### iTerm2: el veterano cargado de funciones
iTerm2 ha sido el estándar durante años. Ofrece capacidades avanzadas como restauración de sesiones, triggers y un gestor de contraseñas integrado, pero puede sentirse más "pesado" y es más difícil de gestionar con dotfiles basadas en texto.

```bash
brew install --cask iterm2
```

---

## 2. Tipografía esencial: instalar Nerd Fonts

Las herramientas CLI modernas (como `eza` o `starship`) usan iconos especiales para transmitir información. Sin una **Nerd Font**, aparecerán como cuadros rotos.

```bash
brew install --cask font-hack-nerd-font
```

### Configuración
* **Ghostty**: edita `~/.config/ghostty/config` y añade `font-family = Hack Nerd Font`.
* **iTerm2**: ve a `Profiles -> Text -> Font` y selecciona `Hack Nerd Font`.

![iTerm2 Font Selection](../../../assets/iterm2-font.png)

---

## 3. Configuración de Ghostty para power users

Ghostty se configura mediante un archivo de texto plano, lo que lo hace perfecto para [gestión con dotfiles](/es/docs/macos-setup-guide/dotfiles-and-reproducibility).

Puedes consultar los ajustes disponibles en la [documentación de Ghostty](https://ghostty.org/docs/config/reference).

También puedes consultar los valores por defecto con `ghostty +show-config --default --docs`.

Este es un ejemplo de `~/.config/ghostty/config`. Personalmente dejo este archivo vacío y uso los valores por defecto.

```ini
font-family = Hack Nerd Font
font-size = 13
theme = Deep
scrollback-limit = 100000
copy-on-select = true
window-padding-x = 8
window-padding-y = 8
```

> [!NOTE]
> `copy-on-select` es un gran acelerador de productividad. Solo con seleccionar texto con el ratón, ya lo tienes en el portapapeles.

Para algunos de estos ajustes puedes usar el comando `ghostty` para ver los valores disponibles.
Por ejemplo, para listar los temas:

```bash
ghostty +list-themes
```

![ghostty list themes](../../../assets/ghostty-list-themes.png)

---

## 4. Arreglar el comportamiento del teclado (navegación por palabras)

Una de las cosas más frustrantes al estrenar un Mac es que `Option + Left/Right` no navega por palabras en la terminal por defecto.

### El ajuste en la shell
Añade esto a tu `~/.zshrc` para que Zsh respete límites de palabra comunes (tratando `/` como separador) y para que `Alt+backspace` borre la palabra anterior:

```bash
# zsh completion
autoload -Uz compinit bashcompinit
compinit
bashcompinit

# Word style
autoload -U select-word-style
select-word-style bash

# Word navigation
bindkey "^[b" backward-word
bindkey "^[f" forward-word

# Alt + Left / Right for terminals that send CSI sequences
bindkey "^[[1;3D" backward-word
bindkey "^[[1;3C" forward-word

# Home / End
bindkey "^[[H" beginning-of-line
bindkey "^[[F" end-of-line
bindkey "^[[1~" beginning-of-line
bindkey "^[[4~" end-of-line
bindkey "^[[7~" beginning-of-line
bindkey "^[[8~" end-of-line

# Alt + Backspace
bindkey '^[^?' backward-kill-word
bindkey '^[\x7f' backward-kill-word
```

![ghostty-word-navigation](../../../assets/terminal-recording-20260425_204243.cast)

---

## 5. Rendimiento y renderizado

Tanto Ghostty como iTerm2 usan aceleración por GPU (Metal) en macOS. Esto descarga el renderizado de texto de la CPU, manteniendo el sistema fluido incluso cuando haces `tail` de logs enormes.

**Pro-tip**: evita el uso excesivo de transparencias o desenfoques si priorizas el rendimiento sobre la estética. Cada píxel desenfocado consume ciclos de GPU que podrían usarse para renderizar texto.

---

## Resumen
Ahora tienes una ventana de alto rendimiento hacia tu sistema. Con **Ghostty** y **Nerd Fonts**, tu entorno es rápido, legible y está listo para mostrar iconos. Lo siguiente es asegurar tu identidad [configurando SSH y autenticación](/es/docs/macos-setup-guide/ssh-and-authentication).
