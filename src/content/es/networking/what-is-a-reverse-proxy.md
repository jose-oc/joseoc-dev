---
title: "Qué es un reverse proxy y por qué seguramente ya usas uno"
description: "Aprende qué hace un reverse proxy, cómo se coloca delante de las aplicaciones y por qué es útil para HTTPS, routing, balanceo y control de acceso."
date: "2026-06-03"
tags: ["networking", "reverse-proxy", "http", "nginx", "traefik"]
category: "networking"
language: "es"
slug: "networking/what-is-a-reverse-proxy"
draft: false
---

Un reverse proxy es un servidor que se coloca delante de una o varias aplicaciones backend y recibe las peticiones de los clientes antes de que lleguen a esas aplicaciones.

En vez de que el usuario hable directamente con la app, primero habla con el reverse proxy.

Luego el reverse proxy decide qué hacer:

- enviar la petición al backend correcto
- terminar HTTPS
- aplicar reglas de acceso
- añadir cabeceras
- repartir tráfico entre varios servidores

## La versión corta

Si esto te suena abstracto, piensa en un recepcionista delante de un edificio de oficinas.

El recepcionista no hace el trabajo de todos los equipos que hay dentro del edificio. Pero sí:

- recibe primero a la gente
- comprueba a dónde deben ir
- puede aplicar reglas de acceso
- puede proteger a los equipos internos de exposición directa

Eso es más o menos lo que hace un reverse proxy para las aplicaciones.

## Por qué se llama "reverse"

Mucha gente aprende antes lo que es un proxy normal.

Un forward proxy se coloca entre el cliente e internet. Representa al cliente.

Un reverse proxy se coloca entre el cliente y el servidor. Representa al lado servidor.

Así que:

- forward proxy: "estoy ayudando al cliente a llegar a servidores"
- reverse proxy: "estoy ayudando a los servidores a recibir y gestionar tráfico de clientes"

## Un flujo simple de tráfico

```text
Navegador del usuario -> Reverse proxy -> Aplicación
```

Si hay varias aplicaciones, puede verse así:

```text
Navegador del usuario -> Reverse proxy -> App A
                                     -> App B
                                     -> App C
```

Puede que el usuario solo vea un hostname público, mientras el reverse proxy enruta internamente las peticiones.

## Trabajos comunes de un reverse proxy

### 1. Terminación HTTPS

Uno de los trabajos más comunes es manejar certificados TLS y conexiones HTTPS cifradas.

En vez de configurar certificados por separado en cada aplicación, el reverse proxy puede:

- guardar el certificado
- terminar TLS
- reenviar HTTP en claro o tráfico recifrado al backend

Eso simplifica mucho la operación.

### 2. Routing de peticiones

Un reverse proxy puede enviar tráfico a distintos backends según:

- hostname
- path de URL
- cabeceras

Ejemplos:

- `grafana.example.com` -> Grafana
- `wiki.example.com` -> Wiki
- `example.com/api` -> backend API
- `example.com/app` -> aplicación frontend

### 3. Balanceo de carga

Si tienes varias instancias de la misma aplicación, el reverse proxy puede repartir peticiones entre ellas.

Eso ayuda con:

- más disponibilidad
- mejor capacidad
- escalado más simple

### 4. Control de acceso

Un reverse proxy puede aplicar reglas antes de que la petición llegue al backend.

Ejemplos:

- exigir autenticación
- permitir solo ciertos rangos IP
- bloquear peticiones sospechosas
- limitar tráfico abusivo

### 5. Manejo de cabeceras y propagación de identidad

Los reverse proxies suelen añadir o reenviar cabeceras útiles como:

- `X-Forwarded-For`
- `X-Forwarded-Proto`
- `X-Forwarded-Host`

Estas ayudan al backend a entender:

- la IP real del cliente
- si la petición original usó HTTPS
- qué hostname pidió el usuario

## Por qué ésto es útil en entornos reales

Sin un reverse proxy, cada aplicación podría tener que encargarse de:

- sus propios certificados TLS
- su propia exposición pública
- su propia lógica de routing
- sus propios filtros de acceso

Eso suele acabar siendo un lío.

Un reverse proxy te permite centralizar esas preocupaciones.

Por eso son tan comunes en:

- plataformas internas
- configuraciones de ingress en Kubernetes
- dashboards self-hosted
- entornos de microservicios
- webs públicas

## Un ejemplo práctico

Imagina que alojas tres servicios:

- Grafana
- Keycloak
- una app interna

Quieres que todos sean accesibles por HTTPS.

Con un reverse proxy:

- `grafana.example.com` va a Grafana
- `login.example.com` va a Keycloak
- `app.example.com` va a la app interna

El reverse proxy se convierte en el punto de entrada público, mientras las aplicaciones pueden quedarse en direcciones privadas detrás de él.

## Reverse proxy vs load balancer

Estos términos se solapan bastante.

Un reverse proxy puede hacer balanceo de carga, y un load balancer puede comportarse como reverse proxy.

La distinción útil es esta:

- reverse proxy suele enfatizar manejo de peticiones, routing, cabeceras, TLS y políticas
- load balancer suele enfatizar repartir tráfico entre varios backends

En productos reales, una misma herramienta muchas veces hace ambas cosas.

## Reverse proxy vs API gateway

Un API gateway suele ser más especializado.

Puede incluir:

- integración con autenticación
- rate limiting
- transformación de peticiones
- políticas específicas de API
- funciones para desarrolladores

Un reverse proxy puede ser simple y generalista. Un API gateway suele ser una capa más opinada para APIs.

## Ejemplos populares

Tecnologías comunes de reverse proxy:

- Nginx
- Traefik
- HAProxy
- Envoy
- Caddy

En Kubernetes, un ingress controller muchas veces actúa como reverse proxy para los servicios del cluster.

## Problemas comunes con los que la gente se encuentra

Los reverse proxies son muy útiles, pero también pueden ser una fuente de confusión.

Problemas típicos:

- la app backend no confía en las cabeceras reenviadas
- bucles de redirección HTTPS
- routing al hostname incorrecto
- la IP del cliente aparece como la IP del proxy
- los timeouts ocurren en la capa del proxy, no en la app

Al hacer troubleshooting, ayuda preguntar:

- ¿llegó la petición al proxy?
- ¿eligió el proxy el backend correcto?
- ¿devolvió error el backend?
- ¿reescribió o bloqueó algo el proxy por el camino?

## Idea final

Un reverse proxy es la puerta de entrada para una o varias aplicaciones.

Ayuda con:

- HTTPS
- routing
- balanceo
- control de acceso
- una exposición pública más limpia

Si gestionas servicios internos o públicos, es muy probable que ya estés usando uno, aunque todavía no lo llames así.
