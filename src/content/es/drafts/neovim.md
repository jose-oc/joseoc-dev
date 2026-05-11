---
title: "El valor de la configuración de Neovim en el trabajo diario"
description: "Entiende qué beneficios aporta el entorno configurado de Neovim durante una jornada típica de trabajo, incluyendo navegación, edición y flujos de automatización."
date: "2026-04-18"
tags: ["neovim", "editor", "productivity", "devops"]
category: "engineering"
language: "es"
slug: "neovim-value-in-daily-work"
draft: true
---

## Visión general

Este documento explica el valor práctico del entorno configurado de Neovim desde la perspectiva de alguien que normalmente no trabaja con Vim o Neovim.

El objetivo no es enseñar Vim, sino explicar:

* qué problemas resuelve esta configuración
* cómo mejora los flujos de trabajo diarios
* qué significan los atajos de teclado y cómo usarlos

En esta configuración, Neovim actúa como un editor rápido basado en terminal que se integra estrechamente con las herramientas CLI que ya usas.

---

## Entender la tecla `<leader>`

Muchos atajos de Neovim usan el concepto de **leader key**.

En esta configuración:

```lua
vim.g.mapleader = " "
```

Eso significa:

* `<leader>` = **barra espaciadora**

Así que cuando ves:

```text
<leader>ff
```

significa:

```text
pulsar Espacio, luego f y luego f
```

Esto es solo una forma de definir atajos personalizados sin entrar en conflicto con los integrados.

---

## Qué reemplaza Neovim

En una configuración típica podrías usar:

* VS Code u otro editor gráfico
* un explorador de archivos para navegar
* el ratón para seleccionar y moverte

Con esta configuración de Neovim:

* todo ocurre dentro de la terminal
* la navegación, edición y búsqueda se hacen con teclado
* no hay cambios de contexto entre herramientas

---

## Un día de trabajo típico

### 1. Abrir un proyecto

En lugar de abrir un editor y navegar a mano:

```bash
nvim .
```

Esto abre el directorio actual como workspace.

---

### 2. Encontrar archivos rápido

En lugar de navegar por carpetas manualmente:

```text
<leader>ff
```

* Pulsa `Space`, luego `f` y luego `f`
* Aparece una ventana de búsqueda
* Empieza a escribir parte del nombre del archivo
* Pulsa Enter para abrirlo

Ejemplo:

Si escribes:

```text
main.tf
```

encontrarás y abrirás rápidamente el archivo de Terraform.

Esto reemplaza:

* la navegación por el explorador de archivos
* el recorrido manual de directorios

---

### 3. Buscar dentro de los archivos

En lugar de usar herramientas de búsqueda separadas:

```text
<leader>fg
```

* Pulsa `Space`, luego `f` y luego `g`
* Busca en todos los archivos del proyecto
* Los resultados se actualizan mientras escribes

Ejemplo:

Buscar:

```text
resource "aws_instance"
```

Equivale a:

```bash
rg "resource \"aws_instance\""
```

pero integrado dentro del editor.

---

### 4. Entender el código (LSP)

Cuando trabajas con código o configuración:

```text
gd
```

* "go to definition"

Ejemplo:

Si el cursor está sobre una variable o función, salta al lugar donde está definida.

---

```text
K
```

* muestra documentación o detalles del símbolo actual

---

```text
gr
```

* muestra todas las referencias al símbolo actual

---

Esto reemplaza:

* la búsqueda manual de definiciones
* adivinar dónde se usa algo

---

### 5. Editar archivos de configuración

Al editar YAML, Terraform o scripts:

* el resaltado de sintaxis es preciso gracias a Treesitter
* la indentación se gestiona automáticamente

Ejemplo:

```yaml
apiVersion: v1
kind: Pod
```

Neovim entiende la estructura, no solo el texto.

---

### 6. Formatear archivos automáticamente

Al guardar un archivo:

```text
:w
```

* el archivo se formatea automáticamente, si está configurado

Ejemplo:

* Terraform → `terraform fmt`
* Python → `ruff format`

Esto garantiza un estilo consistente sin esfuerzo manual.

---

### 7. Trabajar con cambios de Git

Dentro de un archivo:

* las líneas modificadas aparecen marcadas
* puedes navegar entre cambios

Ejemplo:

```text
]h
```

* ir al siguiente cambio (`hunk`)

```text
[h
```

* ir al cambio anterior

```text
<leader>hp
```

* previsualizar el cambio

Esto reemplaza:

```bash
git diff
```

para inspecciones rápidas.

---

### 8. Navegar directorios

En lugar de usar un explorador de archivos:

```text
-
```

* abre el directorio padre

Puedes:

* renombrar archivos
* crear archivos
* navegar rápidamente

---

### 9. Trabajar sin ratón

Todas las operaciones:

* navegación
* edición
* búsqueda

se hacen con el teclado.

Beneficios:

* interacción más rápida
* menos cambios de contexto
* consistencia entre sistemas locales y remotos

---

## Por qué importa en trabajo DevOps

En flujos DevOps a menudo:

* editas YAML de Kubernetes o Ansible
* editas archivos Terraform
* inspeccionas logs
* saltas entre archivos rápidamente

Esta configuración te permite:

* permanecer en la terminal
* evitar cambiar entre herramientas
* moverte más rápido en repositorios grandes

---

## Beneficios de rendimiento

Neovim:

* arranca casi al instante
* usa muy pocos recursos
* funciona muy bien por SSH

Esto es importante cuando:

* trabajas en máquinas remotas
* usas la terminal de forma intensiva
* manejas repositorios grandes

---

## Curva de aprendizaje

Al principio, Neovim resulta poco familiar porque:

* usa navegación basada en teclado
* tiene modos, como normal e insert

Sin embargo, solo necesitas un subconjunto pequeño para ser productivo:

* `i` → insertar texto
* `Esc` → salir del modo insert
* `:w` → guardar
* `:q` → salir
* `<leader>ff` → buscar archivo
* `<leader>fg` → buscar texto
* `gd` → ir a la definición

---

## Buenas prácticas

* empieza con navegación y búsqueda básicas
* no intentes aprenderlo todo de golpe
* úsalo al principio junto con tu editor actual
* apóyate en la búsqueda (`<leader>ff`, `<leader>fg`) en lugar de navegar manualmente

---

## Resumen

Esta configuración de Neovim aporta:

* navegación rápida entre archivos
* potentes capacidades de búsqueda
* comprensión del código mediante LSP
* formateo automático
* inspección integrada de cambios Git

El beneficio principal es reducir fricción:

* menos herramientas
* menos cambios de contexto
* navegación más rápida

Con el tiempo, esto se traduce en un flujo de trabajo más eficiente, especialmente en entornos basados en terminal.
