---
title: "Cómo grabar sesiones de terminal en SVG con termsvg"
description: "Aprende a usar termsvg para capturar sesiones de terminal y convertirlas en animaciones SVG escalables y de alta calidad para documentación y blogs."
date: "2026-05-09"
tags: ["terminal", "svg", "documentation", "productivity", "cli"]
category: "engineering"
language: "es"
slug: "how-to/recording-terminal-to-svg-with-termsvg"
---

# Grabar sesiones de terminal en SVG con termsvg

Cuando escribes documentación técnica, a veces una captura estática no basta para explicar un flujo CLI complejo, pero un vídeo es demasiado pesado o necesita un reproductor específico.

**termsvg** resuelve ese problema capturando tu sesión de terminal y convirtiéndola en una animación SVG ligera, escalable y visualmente atractiva que se reproduce directamente en cualquier navegador moderno.

## 1. Instalación

`termsvg` es una herramienta escrita en Go. Puedes instalarla usando `go install`:

```bash
go install github.com/mrmarble/termsvg/cmd/termsvg@latest
```

Asegúrate de que `$GOPATH/bin` está en tu `$PATH` para poder ejecutar el comando desde cualquier sitio.

O, si usas macOS, instalarla con brew:
```bash
brew install termsvg
```

## 2. Uso básico

### 2.1 Grabar una sesión

Grabar una sesión es muy sencillo. Ejecuta el comando indicando el nombre del archivo de salida:

```bash
termsvg rec terminal-recording-$(date +"%Y%m%d_%H%M%S").cast
```

Una vez lances este comando:
1. Se inicia una nueva sesión de shell.
2. Todo lo que escribas y toda la salida que se genere quedará grabado.
3. Para parar la grabación, escribe `exit` o pulsa `Ctrl+D`.

### 2.2 Reproducir

```bash
termsvg play terminal-recording-20260509_110827.cast
```

### 2.3 Convertir a SVG

```bash
termsvg export terminal-recording-20260509_110827.cast
```

Eso generará un archivo llamado `terminal-recording-20260509_110827.svg` en el directorio actual.

## 3. ¿Por qué usar termsvg?

* **Escalabilidad**: al ser un SVG, puedes hacer zoom infinito sin perder calidad.
* **Buscable**: el texto dentro del SVG suele poder seleccionarse y buscarse, según el visor.
* **Ligero**: mucho más pequeño que un GIF o un vídeo para fragmentos cortos de terminal.
* **Sin plugins**: funciona de forma nativa en HTML con una etiqueta `<img>` simple o con `<object>`.

---

## Conclusión

<a href="https://github.com/mrmarble/termsvg" target="_blank" rel="noopener noreferrer">termsvg</a> es una herramienta esencial para cualquier ingeniero DevOps o redactor técnico que quiera crear demostraciones de terminal claras, interactivas y de alto rendimiento. Pruébala en tu próximo artículo del blog o en el README de tu proyecto.
