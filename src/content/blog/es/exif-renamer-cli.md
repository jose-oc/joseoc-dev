---
title: "De Software Propietario a Open Source: Vibe coding ExifRenamer"
description: "Cómo reemplacé una aplicación clásica de macOS para organizar fotos y creé una alternativa CLI de código abierto a mi medida usando Antigravity."
pubDate: 2026-06-07
tags: ["vibe-coding", "ai", "cli", "go", "photography", "open-source"]
category: "engineering"
author: "Jose"
slug: "exif-renamer-cli"
draft: false
---

Todos tenemos esa pequeña utilidad de software que lleva años con nosotros. En mi caso, para organizar mis fotos personales, utilizaba una aplicación clásica de macOS llamada **ExifRenamer** (puedes verla en [su web oficial](https://www.qdev.de/?location=mac%2Fexifrenamer)). 

Es una herramienta excelente que cumple su función: lee la información EXIF de las imágenes y las renombra estructuradamente según la fecha y hora en que fueron tomadas. Sin embargo, tiene dos grandes problemas: es código cerrado/propietario y su diseño se ha quedado congelado en la era Aqua de macOS, lo que hacía imposible modificarla o adaptarla a mis flujos de trabajo en la terminal.

![Interfaz clásica de ExifRenamer](../../../assets/exifrenamer/exifrenamer-screenshot-2023-08-03-194011.png)

## La motivación: El control total y la terminal

Además de tener una estética que desentona con los sistemas modernos, el principal inconveniente de depender de una aplicación de terceros y propietaria es la falta de flexibilidad. Si quería añadir una regla de renombrado específica, filtrar archivos de forma avanzada o integrar el proceso en mis scripts automatizados, estaba completamente de manos atadas.

Quería una herramienta que fuera:
1. **Código abierto**, para poder mantenerla yo mismo a lo largo del tiempo.
2. **Extensible**, permitiéndome modificarla y añadir características a mi antojo.
3. **Nativa de la terminal (CLI)**, fácil de integrar y extremadamente rápida.

## El proceso: Vibe coding con Antigravity

En lugar de sentarme a escribir toda la lógica de parsing de metadatos EXIF desde cero, decidí hacer un experimento de **vibe coding** usando **Antigravity**.

Le mostré al asistente de IA cómo utilizaba la herramienta original, le compartí capturas de pantalla de la interfaz y la configuración para que entendiera las opciones que consideraba esenciales (como los formatos de fecha, prefijos, sufijos y el manejo de colisiones de nombres) y le di instrucciones claras para generar una alternativa en línea de comandos.

Aquí puedes ver parte de la configuración original que tuvimos que replicar:

![Opciones de configuración de ExifRenamer](../../../assets/exifrenamer/exifrenamer-screenshot-2023-08-03-194021.png)
![Preferencias avanzadas de ExifRenamer](../../../assets/exifrenamer/exifrenamer-screenshot-2023-08-03-194819.png)

A partir de este contexto visual, mis explicaciones de comportamiento y el stack técnico que quería usar, Antigravity se encargó de estructurar y escribir todo el código de la nueva CLI.

## El resultado: exifRenamer CLI

El resultado de esta sesión de desarrollo es una herramienta moderna de terminal escrita en Go que replica las características que más valoraba de la aplicación clásica, pero con la potencia y flexibilidad de la línea de comandos.

Puedes encontrar el código fuente completo en el repositorio de GitHub:
👉 **[jose-oc/exifRenamer](https://github.com/jose-oc/exifRenamer)**

### Características clave:
* **Lectura nativa de EXIF**: Extrae la fecha y hora de captura exacta de las imágenes.
* **Formato altamente personalizable**: Permite estructurar nombres de archivo con el patrón temporal que desees (ej. `YYYY-MM-DD_HH-MM-SS`).
* **Soporte para prefijos y sufijos**: Añade contexto a tus tandas de fotos de manera sencilla.
* **Sin dependencias pesadas**: Compila en un binario único, rápido y multiplataforma.

Y lo mejor de todo: al ser código abierto, ahora tengo el control absoluto para modificarlo, añadir nuevos formatos de metadatos o adaptarlo a cualquier otro tipo de archivo multimedia en el futuro. El desarrollo asistido por IA nos permite pasar de la frustración por un software obsoleto a tener una solución personalizada en cuestión de minutos.

## Vibe Coding

Llevo tiempo usando la IA generativa apra ayudarme tanto en mi trabajo como en mis side projects, pero hasta ahora siempre controlaba lo que el LLM debía generar, le daba detalles, comprobaba y modificaba el código que me escribía.

En esta ocasión decidí hacer vibe coding puro. Al tratarse de una utilidad pequeña, me pareció el proyecto ideal para este experimento. 
No he mirado el código durante el proceso. Cuando me generó el código lo probé ejecutándolo como usuario final, para comprobar que el resultado se ajustaba a lo que quería, y le iba dando órdenes para modificarlo conforme a lo que quería tener finalmente. 
El resultado: me he divertido y tengo una aplicación que hace lo que quiero. 

Para hacer aplicaciones de este tipo sólo hay que tener claro lo que quieres tener, tener unos conocimientos suficientes como para darle unas buenas pautas a la IA, ¡y a disfrutar!
