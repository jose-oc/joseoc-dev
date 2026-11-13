---
title: "Almacenamiento efímero en Kubernetes: qué cuenta y cómo actúa el kubelet"
description: "Qué hacen de verdad los requests y limits de ephemeral-storage y el sizeLimit de un emptyDir en Kubernetes: qué mide el kubelet, cómo lo mide y por qué la aplicación del límite es desalojo, no una quota dura."
date: "2026-11-13"
tags: ["kubernetes", "storage", "resources", "eviction", "observability"]
category: "observability"
language: "es"
slug: "observability/ephemeral-storage"
draft: false
---

Todo pod recibe almacenamiento efímero: espacio en los discos locales del nodo que existe solo mientras exista el pod. «Efímero» es la palabra clave: no hay garantía de durabilidad a largo plazo. Los datos no siguen al pod: un pod recreado empieza con el almacenamiento vacío, y un fallo del nodo puede perder los datos por completo. Los pods lo usan para espacio temporal, cachés y logs, y el kubelet usa ese mismo almacenamiento para las imágenes de contenedor, las capas escribibles de los contenedores y los logs de contenedor a nivel de nodo.

Un matiz de contabilidad que conviene dejar claro desde el principio: el recurso `ephemeral-storage` es disco local. Un `emptyDir` en memoria (`tmpfs`) cuenta como **memoria** del contenedor, no como almacenamiento efímero.

Este es el recurso detrás de los requests y limits de `ephemeral-storage`, y detrás del `sizeLimit` de un volumen `emptyDir`. Aparece en cuanto algo en un nodo escribe más de lo esperado, por ejemplo en el [patrón del sidecar logrotate](/es/docs/how-to/kubernetes-sidecar-log-rotation).

## Qué cuenta el kubelet

Cuando el kubelet mide el almacenamiento efímero de un pod, suma:

- La capa escribible de cada contenedor (lo que el contenedor escribe sobre su imagen).
- Los volúmenes `emptyDir` locales. Una excepción: un `emptyDir` en memoria (`tmpfs`) cuenta como **memoria** del contenedor, no como almacenamiento.
- Los logs del propio pod, los que el kubelet escribe en `/var/log/pods`.
- Pequeños archivos de sistema que Kubernetes proyecta en el pod, como `/etc/hosts`.

A nivel de nodo, las imágenes de contenedor también viven en ese mismo almacenamiento, así que descargar imágenes grandes consume el mismo disco en el que escriben los pods.

## Qué hace un request, y qué no hace

Un request es una **entrada para el scheduler**, nada más. Cuando se crea el pod, el scheduler suma los requests de `ephemeral-storage` de sus contenedores y solo elige un nodo cuyo almacenamiento efímero asignable pueda alojar esa suma.

Un request no reserva disco. Nadie aparta esos bytes, y otro pod puede llenar el sistema de archivos mientras tanto.

## Qué hace un limit, y qué no hace

Un limit lo aplica el kubelet, **a posteriori**:

- A nivel de contenedor: si la capa escribible de un contenedor más sus logs superan su limit, el kubelet marca el pod para desalojo.
- A nivel de pod: el kubelet suma los limits de todos los contenedores. Si el uso total de todos los contenedores más los volúmenes `emptyDir` del pod supera esa suma, también marca el pod para desalojo.

De cómo funciona el kubelet se derivan dos propiedades, y ambas importan:

- **La aplicación del límite es medición más desalojo, no una quota en el momento de escribir.** El kubelet mide el uso con escaneos periódicos y evalúa los umbrales de desalojo en su intervalo de mantenimiento (10 segundos por defecto). Un proceso que escribe rápido puede pasarse de su límite entre dos comprobaciones; nada bloquea las escrituras. El límite decide que el pod se desaloja, no que la escritura falle.
- **El desalojo puede ser inmediato.** Con los umbrales duros por defecto no hay periodo de gracia: el kubelet mata el pod con un periodo de gracia de 0s para recuperar el recurso.

Y una advertencia en la otra dirección: si la organización de sistemas de archivos del nodo no es una de las soportadas, el kubelet no puede medir el almacenamiento efímero en absoluto, y entonces no desaloja pods por superar estos límites. El nodo solo reacciona cuando el sistema de archivos se llena de verdad, marcándose con un taint y desalojando los pods que no lo toleran.

## Dónde encaja el sizeLimit de emptyDir

Un `sizeLimit` en un `emptyDir` acota ese único volumen, y el uso del volumen cuenta dentro del total a nivel de pod descrito arriba. En el ejemplo oficial, un pod cuyos dos contenedores tienen cada uno un límite de 4Gi (8Gi sumados) puede tener un `emptyDir` con `sizeLimit: 500Mi` dentro de ese mismo presupuesto. El sizeLimit es una red para un volumen; los limits son una red para el pod entero. Ninguno detiene una escritura a mitad de camino.

## Unidades: la trampa de `400m`

Las cantidades son bytes. Los sufijos distinguen mayúsculas: `400Mi` son 400 mebibytes, `400M` son 400 megabytes, y `400m` son 0,4 bytes. La `m` minúscula significa mili, igual que en CPU. Nadie que escribe `400m` de almacenamiento quiere decir 0,4 bytes, pero eso es lo que obtiene.

## Recomendación

Pon requests y limits de `ephemeral-storage` en los contenedores que escriben (archivos temporales, cachés, logs en archivos), y un `sizeLimit` en cada `emptyDir` que pueda crecer. Trata los números como un ejercicio de dimensionado con margen, no como una garantía: el kubelet reacciona después de medir, y el resto del nodo comparte el mismo disco. La señal a vigilar es el uso de disco y los eventos de desalojo del nodo, no solo que los pods sigan en Running.

## Referencias

- [Kubernetes: Local ephemeral storage](https://kubernetes.io/docs/concepts/storage/ephemeral-storage/)
- [Kubernetes: Resource Management for Pods and Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
- [Kubernetes: Node-pressure Eviction](https://kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/)
