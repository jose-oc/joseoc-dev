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

Todo pod recibe almacenamiento efímero: espacio en los discos locales del nodo que existe solo mientras exista el pod. «Efímero» es la palabra clave: no hay garantía de durabilidad a largo plazo. Los datos no están vinculados al ciclo de vida del pod: un pod recreado empieza con el almacenamiento vacío, y ante un fallo del nodo los datos pueden perderse por completo. Los pods lo usan para espacio temporal, cachés y logs, y el kubelet usa ese mismo almacenamiento para las imágenes de contenedor, las capas escribibles de los contenedores y los logs de contenedor a nivel de nodo.

Un matiz importante sobre el cómputo de recursos que conviene aclarar de entrada: el recurso `ephemeral-storage` es disco local. Un `emptyDir` en memoria (`tmpfs`) cuenta como **memoria** del contenedor, no como almacenamiento efímero.

Este almacenamiento local es lo que respalda los `requests` y `limits` de `ephemeral-storage` como el campo `sizeLimit` de un volumen `emptyDir`. Aparece en cuanto algo en un nodo escribe más de lo esperado, por ejemplo en el [patrón del sidecar logrotate](/es/docs/how-to/kubernetes-sidecar-log-rotation).

## Qué cuenta el kubelet

Cuando el kubelet mide el almacenamiento efímero de un pod, suma:

- La capa escribible de cada contenedor (lo que el contenedor escribe sobre su imagen).
- Los volúmenes `emptyDir` locales. Una excepción: un `emptyDir` en memoria (`tmpfs`) cuenta como **memoria** del contenedor, no como almacenamiento.
- Los logs del propio pod, los que el kubelet escribe en `/var/log/pods`.
- Pequeños archivos de sistema que Kubernetes proyecta en el pod, como `/etc/hosts`.

A nivel de nodo, las imágenes de contenedor también viven en ese mismo almacenamiento, así que descargar imágenes grandes consume el mismo disco en el que escriben los pods.

## Qué hace un request, y qué no hace

Un request es simplemente un **dato de entrada para el scheduler**, nada más. Cuando se crea el pod, el scheduler suma los requests de `ephemeral-storage` de sus contenedores y solo elige un nodo cuyo almacenamiento efímero asignable pueda alojar esa suma.

Un request no reserva disco. Nadie aparta esos bytes, y otro pod puede llenar el sistema de archivos mientras tanto.

## Qué hace un limit, y qué no hace

Un limit lo aplica el kubelet, **a posteriori**:

- A nivel de contenedor: si la capa escribible de un contenedor más sus logs superan su limit, el kubelet marca el pod para desalojo.
- A nivel de pod: el kubelet suma los limits de todos los contenedores. Si el uso total de todos los contenedores más los volúmenes `emptyDir` del pod supera esa suma, también marca el pod para desalojo.

De cómo funciona el kubelet se derivan dos consecuencias importantes:

- **El control se basa en medir y desalojar, no en cuotas de escritura en tiempo real.** El kubelet mide el uso con escaneos periódicos y evalúa los umbrales de desalojo en su intervalo de mantenimiento (10 segundos por defecto). Un proceso que escribe rápido puede pasarse de su límite entre dos comprobaciones; nada bloquea las escrituras. El límite decide que el pod se desaloja, no que la escritura falle.
- **El desalojo puede ser inmediato.** Con los umbrales duros por defecto no hay periodo de gracia: el kubelet mata el pod con un periodo de gracia de 0s para recuperar el recurso.

Y una advertencia en el sentido opuesto: si la distribución de particiones del nodo (filesystem layout) no sigue uno de los esquemas soportados por Kubernetes (por ejemplo, si `/var/log/pods` o el runtime están montados en particiones separadas no estándar), el kubelet no puede medir el consumo por pod e ignora por completo estos límites. En ese escenario, el nodo solo reacciona cuando el disco físico está a punto de llenarse, aplicándose el taint `disk-pressure` y desalojando pods para sobrevivir.

## Dónde encaja el sizeLimit de emptyDir

El campo `sizeLimit` de un `emptyDir` acota ese único volumen, cuyo consumo computa dentro del total del pod que acabamos de ver. En el ejemplo oficial, un pod cuyos dos contenedores tienen cada uno un límite de 4Gi (8Gi sumados) puede tener un `emptyDir` con `sizeLimit: 500Mi` dentro de ese mismo presupuesto. El sizeLimit actúa como tope para un volumen concreto; los limits como tope para todo el pod. Ninguno detiene una escritura a mitad de camino.

## Unidades: la trampa de `400m`

Las cantidades se expresan en bytes. Los sufijos distinguen entre mayúsculas y minúsculas: `400Mi` son 400 mebibytes, `400M` son 400 megabytes, y `400m` son 0,4 bytes. La `m` minúscula significa mili, igual que en CPU. Nadie que escribe `400m` de almacenamiento quiere decir 0,4 bytes, pero eso es lo que obtiene.

## Recomendación

Pon requests y limits de `ephemeral-storage` en los contenedores que escriben (archivos temporales, cachés, logs en archivos), y un `sizeLimit` en cada `emptyDir` que pueda crecer. Trata los números como un ejercicio de dimensionado con margen, no como una garantía: el kubelet reacciona después de medir, y el resto del nodo comparte el mismo disco. Lo que hay que vigilar son el uso de disco y los eventos de desalojo (eviction) del nodo, no solo que los pods sigan en estado _Running_.

## Referencias

- [Kubernetes: Local ephemeral storage](https://kubernetes.io/docs/concepts/storage/ephemeral-storage/)
- [Kubernetes: Resource Management for Pods and Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
- [Kubernetes: Node-pressure Eviction](https://kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/)
