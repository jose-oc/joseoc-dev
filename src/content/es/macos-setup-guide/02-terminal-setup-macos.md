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
scrollback-limit = 50000000
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

### Cómo entender `scrollback-limit`: Ghostty vs iTerm2

Una diferencia importante entre **Ghostty** e **iTerm2** es cómo gestionan el historial de desplazamiento (*scrollback*).

En **Ghostty**, `scrollback-limit` se mide en **bytes**, no en líneas. Cubre tanto la **pantalla visible** como el **búfer de scrollback**, y una vez alcanzado el límite, se descarta el contenido más antiguo. El valor por defecto actual es de **10 000 000 de bytes por superficie de terminal**. Una "superficie" (*surface*) es, en la práctica, una pestaña, una división (*split*) o un panel de ventana.

Esto importa porque Ghostty mantiene el scrollback **en memoria**. Un valor más alto te proporciona más historial, pero también incrementa el consumo potencial de RAM del terminal, especialmente si mantienes muchas pestañas o splits abiertos. La buena noticia es que Ghostty asigna esta memoria de forma perezosa (*lazy allocation*), por lo que definir un límite mayor **no** reserva toda esa memoria de golpe por adelantado.

```ini
# Ejemplo: mantener más historial que el valor por defecto
scrollback-limit = 50000000
```

Por contra, **iTerm2** gestiona el scrollback en **líneas** y además ofrece una opción de **scrollback ilimitado** (*unlimited scrollback*). Esto suena cómodo, pero puede crecer indefinidamente y terminar consumiendo una gran cantidad de memoria durante lecturas largas de logs (`tail`), ejecuciones de tests con salida verbosa o sesiones intensas de Kubernetes.

En la práctica, el balance es sencillo:

* **Ghostty**: consumo de memoria más predecible, pero todavía sin un modo de scrollback verdaderamente ilimitado.
* **iTerm2**: retención de historial más flexible, incluyendo modo ilimitado, pero con menor control sobre el crecimiento de memoria en el peor de los casos.

Si pasas la mayor parte del día analizando logs extensos, `scrollback-limit` es uno de los pocos ajustes de Ghostty que merece la pena configurar explícitamente. Si sueles usar shells y editores de corta duración, el valor por defecto suele ser suficiente.

Fuentes: [Referencia de configuración de Ghostty](https://ghostty.org/docs/config/reference), [Preferencias de perfiles de terminal en iTerm2](https://iterm2.com/documentation-preferences-profiles-terminal.html)

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

### Mapeo de teclas en iTerm2

Los atajos de la shell anteriores esperan que `Option + Backspace` envíe `Escape` seguido de `Delete`. En iTerm2, mantén la tecla Option izquierda en **Normal** y añade este mapeo de teclas en tu perfil:

1. Abre **iTerm2 -> Settings -> Profiles -> Keys -> Key Mappings**.
2. Haz clic en **+**, pulsa `Option + Delete` y elige **Send Hex Code**.
3. Introduce `0x1b 0x7f` y guarda el mapeo.

Esto mantiene todos estos comportamientos:

* `Option + Left/Right` navega por palabras.
* `Option + Delete` borra la palabra anterior.
* En un teclado de macOS en español, `Option + ñ` escribe `~`. Si la distribución del teclado lo trata como tecla muerta (*dead key*), pulsa `Option + N` seguido de `Espacio`.

No cambies la tecla Option izquierda a **Esc+** si quieres que `Option + ñ` genere `~`; el mapeo de teclas dedicado permite que el borrado de palabras funcione sin alterar el uso de Option para la introducción de caracteres.

### Colores para modo claro y oscuro en iTerm2

iTerm2 puede seguir la apariencia de macOS usando paletas independientes para modo claro y modo oscuro:

1. Abre **Settings -> Profiles -> Colors**.
2. Activa **Use separate colors for light and dark mode**.
3. Selecciona **Light Mode** en **Editing**.
4. Cambia los colores ANSI del modo claro por variantes más oscuras. Por ejemplo:

   | Color ANSI | Valor hexadecimal (modo claro) |
   | --- | --- |
   | Rojo | `#B00020` |
   | Verde | `#006B3C` |
   | Amarillo | `#7A4F00` |
   | Azul | `#0057B8` |
   | Magenta | `#8F0075` |
   | Cian | `#006D77` |
   | Blanco / blanco brillante | `#333333` / `#1A1A1A` |

   Aplica los mismos valores más oscuros a los colores ANSI brillantes correspondientes cuando los utilice tu prompt o tus herramientas CLI.
5. Selecciona **Dark Mode** en **Editing** y deja la paleta de modo oscuro como está, o ajústala de forma independiente para un fondo oscuro.

Esto evita que el texto en amarillo brillante, verde, cian o blanco desaparezca sobre el fondo blanco durante el día, manteniendo al mismo tiempo la apariencia en el modo oscuro.

Estos ajustes y secuencias de teclas de iTerm2 se probaron en macOS `26.6.2` con iTerm2 `3.7.2`.

[Descargar la grabación de terminal sobre navegación por palabras en Ghostty](/assets/terminal-recording-20260425_204243.cast)

---

## 5. Rendimiento y renderizado

Tanto Ghostty como iTerm2 usan aceleración por GPU (Metal) en macOS. Esto descarga el renderizado de texto de la CPU, manteniendo el sistema fluido incluso cuando haces `tail` de logs enormes.

**Pro-tip**: evita el uso excesivo de transparencias o desenfoques si priorizas el rendimiento sobre la estética. Cada píxel desenfocado consume ciclos de GPU que podrían usarse para renderizar texto.

---

## Resumen
Ahora tienes una ventana de alto rendimiento hacia tu sistema. Con **Ghostty** y **Nerd Fonts**, tu entorno es rápido, legible y está listo para mostrar iconos. Lo siguiente es asegurar tu identidad [configurando SSH y autenticación](/es/docs/macos-setup-guide/ssh-and-authentication).
