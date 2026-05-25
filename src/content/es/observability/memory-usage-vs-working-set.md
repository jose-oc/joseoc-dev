---
title: "memory_usage_bytes vs memory_working_set_bytes"
description: "Guía corta y práctica sobre la diferencia entre el uso total de memoria del contenedor y la working set memory, y cuándo conviene usar cada métrica."
date: "2026-05-25"
tags: ["observability", "metrics", "kubernetes", "memory", "garage"]
category: "observability"
language: "es"
slug: "observability/memory-usage-vs-working-set"
---

Ambas métricas son útiles, pero responden preguntas diferentes.

- `memory_usage_bytes`: memoria total cargada al cgroup del contenedor, incluida la caché recuperable
- `memory_working_set_bytes`: memoria que la carga de trabajo mantiene activamente y que suele parecerse más a lo que ve un operador en `kubectl top`

## Cuándo usar cada una

Usa `memory_usage_bytes` cuando la pregunta sea:

- ¿qué tan cerca está este pod de su límite de memoria?
- ¿el crecimiento de caché está dejando poco margen?
- ¿necesito una alerta de riesgo cercano a OOM?

Ésta es la mejor métrica para alertas de riesgo por límite, porque el kernel aplica el límite del cgroup sobre el uso total, no sólo sobre el heap activo.

Usa `memory_working_set_bytes` cuando la pregunta sea:

- ¿la aplicación realmente está consumiendo mucha memoria ahora mismo?
- ¿la presión de memoria sostenida parece real?
- ¿el proceso en sí parece estar creciendo?

Ésta es la mejor primera señal de presión de memoria activa.

## Interpretación rápida

- `memory_usage_bytes` alta, `memory_working_set_bytes` baja:
  probablemente hay mucha caché; vigila el margen, pero la presión real de la aplicación puede seguir siendo moderada
- ambas altas:
  es mucho más probable que exista presión de memoria real
- ambas moderadas:
  no hay riesgo, el servicio puede estar funcionando con normalidad

Ejemplo operativo:

- memoria total `500Mi`, working set `90Mi`: existe riesgo por cercanía al límite, pero la caché probablemente representa buena parte del total
- memoria total `500Mi`, working set `420Mi`: esto se parece mucho más a presión real y merece atención urgente

## Recomendación

- Para alertas de “el pod está muy cerca de su límite configurado”, usa `memory_usage_bytes`.
- Para alertas de “la aplicación está consumiendo activamente mucha memoria”, usa `memory_working_set_bytes`.
- En dashboards, mantén ambas. Verlas juntas hace mucho más fácil distinguir entre crecimiento de caché y presión real de trabajo.

Si sólo vas a elegir una para seguir la presión diaria de la aplicación, empieza con `memory_working_set_bytes`. Si quieres protegerte frente al riesgo de OOM con límites ajustados, `memory_usage_bytes` es la señal más segura.
