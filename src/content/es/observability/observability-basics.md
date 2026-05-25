---
title: "Fundamentos de observabilidad: métricas, logs, trazas y lecciones prácticas"
description: "Aprende los conceptos básicos de observabilidad, cómo se relacionan métricas, logs y trazas, y qué hábitos prácticos ayudan a entender mejor un sistema en producción."
date: "2026-05-25"
tags: ["observability", "monitoring", "metrics", "logs", "tracing"]
category: "observability"
language: "es"
slug: "observability/observability-basics"
---

Si estás empezando con observabilidad, la primera idea útil es ésta:

la observabilidad no consiste sólo en recopilar datos. Consiste en poder entender qué está haciendo tu sistema, por qué se comporta así y qué cambió cuando algo sale mal.

Esto importa porque los incidentes reales rara vez son limpios. Los usuarios reportan “la aplicación va lenta” o “a veces las peticiones fallan”, pero la respuesta suele estar repartida en varios sitios:

- una métrica que cambió
- una línea de log con contexto
- una traza que muestra dónde se gastó el tiempo
- un despliegue o cambio de configuración que ocurrió poco antes

La observabilidad te ayuda a conectar esas piezas más rápido.

## Observabilidad vs monitorización

Mucha gente usa ambas palabras como si fueran lo mismo, pero no son exactamente iguales.

- La monitorización te dice que algo va mal.
- La observabilidad te ayuda a investigar por qué va mal.

La monitorización suele construirse alrededor de fallos conocidos:

- CPU demasiado alta
- tasa de errores demasiado alta
- disco casi lleno

La observabilidad se vuelve importante cuando el problema es menos obvio:

- la latencia aumentó, pero sólo para un endpoint
- una dependencia va lenta sólo en una región
- la memoria crece con el tiempo, pero los reinicios ocultan el patrón

La monitorización levanta la mano. La observabilidad te ayuda a hacer mejores preguntas.

## Las tres señales principales

La mayoría de los sistemas de observabilidad se construyen alrededor de tres señales básicas:

### Métricas

Las métricas son valores numéricos recogidos a lo largo del tiempo.

Ejemplos:

- tasa de peticiones
- número de errores
- latencia de respuesta
- uso de CPU
- uso de memoria

Las métricas sirven bien para:

- paneles
- alertas
- análisis de tendencias
- planificación de capacidad

Suelen ser la forma más rápida de responder a “¿el sistema está sano ahora mismo?”

### Logs

Los logs son registros detallados de eventos discretos.

Ejemplos:

- una petición HTTP falló con estado `500`
- un pod se reinició
- una conexión a base de datos agotó el tiempo
- un token de autenticación fue rechazado

Los logs sirven bien para:

- mensajes de error exactos
- depurar casos límite
- capturar contexto local como IDs, tamaño de payload, reintentos o nombres de hosts aguas arriba

Los logs suelen ser el lugar donde confirmas el fallo concreto después de que una métrica te indique hacia dónde mirar.

### Trazas

Las trazas muestran el recorrido de una petición u operación a través de servicios y componentes.

Son especialmente útiles en sistemas distribuidos porque responden preguntas como:

- ¿dónde se fue el tiempo?
- ¿qué dependencia aguas abajo fue lenta?
- ¿qué servicio devolvió primero el error?

Si las métricas te dicen “la latencia del checkout está alta”, las trazas pueden mostrar si el tiempo se gastó en la API, la caché, la base de datos o un servicio externo.

## Una forma simple de entenderlas juntas

Cuando empieza un incidente:

- las métricas te dicen **que** algo cambió
- los logs te dicen **qué** pasó
- las trazas te dicen **dónde** pasó

Ninguna de estas señales basta por sí sola en todos los casos. El valor real aparece cuando puedes correlacionarlas.

> [!TIP]
> Si tu panel muestra un pico, el siguiente paso debería estar a uno o dos clics de los logs o trazas relacionadas. La navegación rápida importa más que un dashboard bonito.

## Conceptos que conviene aprender pronto

Si quieres una base sólida, céntrate primero en estos conceptos.

### Latencia, tráfico, errores, saturación

Un punto de partida práctico es el modelo de las “golden signals”:

- latencia: cuánto tarda el trabajo
- tráfico: cuánto trabajo está manejando el sistema
- errores: con qué frecuencia falla el trabajo
- saturación: lo cerca que está un recurso de su límite

Este modelo es útil porque evita que mires sólo la disponibilidad y pases por alto problemas de rendimiento o capacidad.

### SLI y SLO

- SLI: service level indicator, la métrica que usas para medir un comportamiento
- SLO: service level objective, el objetivo que quieres que ese comportamiento cumpla

Ejemplo:

- SLI: porcentaje de peticiones servidas por debajo de 300 ms
- SLO: 99% de peticiones por debajo de 300 ms durante 30 días

Ésto es útil porque te obliga a definir qué significa “suficientemente bueno” para los usuarios en lugar de perseguir cualquier gráfico ruidoso.

### Cardinalidad

La cardinalidad indica cuántas combinaciones únicas de etiquetas produce una métrica.

Por ejemplo, una métrica etiquetada por:

- servicio
- endpoint
- región
- pod

puede seguir siendo razonable. Una métrica etiquetada por `user_id`, `session_id` o URLs sin normalizar puede volverse cara y difícil de consultar muy rápido.

Ésta es una de las primeras lecciones prácticas que muchos equipos aprenden por las malas.

## Lecciones prácticas por experiencia

Los fundamentos importan, pero unos pocos hábitos suelen marcar la mayor diferencia en sistemas reales.

### 1. Empieza por el comportamiento que ve el usuario

No empieces sólo con gráficos de infraestructura.

Empieza respondiendo:

- ¿los usuarios pueden iniciar sesión?
- ¿pueden completar el flujo principal?
- ¿los endpoints clave son suficientemente rápidos?

Las métricas de infraestructura importan, pero las señales orientadas al usuario te ayudan a priorizar el problema correcto.

### 2. Las alertas deben ser accionables

Una alerta que sólo dice “memoria alta” es floja.

Una alerta mejor incluye:

- qué carga de trabajo está afectada
- cuánto tiempo lleva el problema
- qué umbral se superó
- dónde investigar después

Las buenas alertas reducen el tiempo de diagnóstico. Las malas alertas enseñan a ignorar notificaciones.

### 3. El contexto vale más que el volumen

Recopilar más logs no hace automáticamente que un sistema sea más fácil de entender.

Los logs bien estructurados con campos útiles valen más que un volumen enorme de mensajes vagos. Incluye identificadores, nombres de operación, códigos de estado, número de reintentos y nombres de dependencias cuando ayuden a explicar el comportamiento.

### 4. Nombra las cosas de forma consistente

La consistencia en nombres de métricas, etiquetas, títulos de dashboards y textos de alertas reduce la confusión durante un incidente.

Si distintos equipos usan palabras diferentes para lo mismo, el troubleshooting será más lento de lo necesario.

### 5. Registra los cambios cerca de los incidentes

Los despliegues, feature flags, cambios de configuración y cambios de infraestructura a menudo explican cambios repentinos en el comportamiento.

Uno de los hábitos más útiles de observabilidad es hacer visibles los eventos de cambio junto a los gráficos del sistema.

### 6. Los dashboards sirven para comunicar, no para decorar

Un dashboard debe ayudar a responder una pregunta real:

- ¿el servicio está sano?
- ¿qué dependencia va lenta?
- ¿esto está empeorando?
- ¿el último despliegue cambió la tasa de errores?

Si un gráfico no ayuda a responder una pregunta, quizá no necesita existir.

## Una configuración práctica para empezar

Si estás montando tu primer sistema de observabilidad, mantenlo simple:

1. Crea un dashboard para un servicio con tasa de peticiones, tasa de errores, latencia, CPU y memoria.
2. Añade logs estructurados con request IDs, códigos de estado y errores de dependencias.
3. Instrumenta trazas para el flujo principal de peticiones.
4. Añade unas pocas alertas sobre síntomas reales, no sobre cada métrica posible.
5. Revisa los incidentes y mejora la instrumentación después de cada uno.

Esto basta para aprender mucho sin ahogarte en herramientas.

## Errores comunes al principio

- Construir dashboards antes de definir qué preguntas deben responder.
- Alertar por todo y entrenar a la gente a ignorar alertas.
- Usar etiquetas con cardinalidad no acotada.
- Tratar los logs como texto sin estructura cuando campos estructurados ayudarían.
- Mirar sólo la infraestructura y perder de vista lo que realmente experimentan los usuarios.

## Idea final

La observabilidad no es un lujo para empresas grandes. Es una de las formas más prácticas de reducir el tiempo que pasas adivinando en producción.

Empieza con lo básico:

- unas pocas métricas buenas
- logs útiles
- trazas en los caminos importantes
- alertas conectadas con el impacto en usuarios

Después mejora a partir de incidentes reales, sesiones reales de depuración y dolor operativo real. Ahí es donde suelen nacer las mejores prácticas de observabilidad.
