---
title: "Qué es un reverse proxy y por qué seguramente ya usas uno"
description: "Aprende qué hace un reverse proxy, como se coloca delante de las aplicaciones y por que es útil para HTTPS, routing, balanceo y control de acceso."
date: "2026-06-03"
tags: ["networking", "reverse-proxy", "http", "nginx", "traefik"]
category: "networking"
language: "es"
slug: "networking/what-is-a-reverse-proxy"
draft: false
---

Un reverse proxy es un servidor que se coloca delante de una o varias aplicaciones backend y recibe las peticiones de los clientes antes de que lleguen a esas aplicaciones.

En vez de que el usuario hable directamente con la app, primero habla con el reverse proxy.

Luego el reverse proxy decide que hacer:

- enviar la peticion al backend correcto
- terminar HTTPS
- aplicar reglas de acceso
- anadir cabeceras
- repartir trafico entre varios servidores

## La version corta

Si esto te suena abstracto, piensa en un recepcionista delante de un edificio de oficinas.

El recepcionista no hace el trabajo de todos los equipos que hay dentro del edificio. Pero si:

- recibe primero a la gente
- comprueba a donde deben ir
- puede aplicar reglas de acceso
- puede proteger a los equipos internos de exposicion directa

Eso es mas o menos lo que hace un reverse proxy para las aplicaciones.

## Por que se llama "reverse"

Mucha gente aprende antes lo que es un proxy normal.

Un forward proxy se coloca entre el cliente y internet. Representa al cliente.

Un reverse proxy se coloca entre el cliente y el servidor. Representa al lado servidor.

Así que:

- forward proxy: "estoy ayudando al cliente a llegar a servidores"
- reverse proxy: "estoy ayudando a los servidores a recibir y gestionar trafico de clientes"

## Un flujo simple de trafico

```text
Navegador del usuario -> Reverse proxy -> Aplicacion
```

Si hay varias aplicaciones, puede verse así:

```text
Navegador del usuario -> Reverse proxy -> App A
                                     -> App B
                                     -> App C
```

Puede que el usuario solo vea un hostname publico, mientras el reverse proxy enruta internamente las peticiones.

## Trabajos comunes de un reverse proxy

### 1. Terminacion HTTPS

Uno de los trabajos mas comunes es manejar certificados TLS y conexiones HTTPS cifradas.

En vez de configurar certificados por separado en cada aplicacion, el reverse proxy puede:

- guardar el certificado
- terminar TLS
- reenviar HTTP en claro o trafico recifrado al backend

Eso simplifica mucho la operacion.

### 2. Routing de peticiones

Un reverse proxy puede enviar trafico a distintos backends según:

- hostname
- path de URL
- cabeceras

Ejemplos:

- `grafana.example.com` -> Grafana
- `wiki.example.com` -> Wiki
- `example.com/api` -> backend API
- `example.com/app` -> aplicacion frontend

### 3. Balanceo de carga

Si tienes varias instancias de la misma aplicacion, el reverse proxy puede repartir peticiones entre ellas.

Eso ayuda con:

- mas disponibilidad
- mejor capacidad
- escalado mas simple

### 4. Control de acceso

Un reverse proxy puede aplicar reglas antes de que la peticion llegue al backend.

Ejemplos:

- exigir autenticacion
- permitir solo ciertos rangos IP
- bloquear peticiones sospechosas
- limitar trafico abusivo

### 5. Manejo de cabeceras y propagacion de identidad

Los reverse proxies suelen anadir o reenviar cabeceras utiles como:

- `X-Forwarded-For`
- `X-Forwarded-Proto`
- `X-Forwarded-Host`

Estas ayudan al backend a entender:

- la IP real del cliente
- si la peticion original uso HTTPS
- que hostname pidio el usuario

## Por que esto es útil en entornos reales

Sin un reverse proxy, cada aplicacion podria tener que encargarse de:

- sus propios certificados TLS
- su propia exposicion publica
- su propia logica de routing
- sus propios filtros de acceso

Eso suele acabar siendo un lio.

Un reverse proxy te permite centralizar esas preocupaciones.

Por eso son tan comunes en:

- plataformas internas
- configuraciones de ingress en Kubernetes
- dashboards self-hosted
- entornos de microservicios
- webs publicas

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

El reverse proxy se convierte en el punto de entrada publico, mientras las aplicaciones pueden quedarse en direcciones privadas detras de el.

## Reverse proxy vs load balancer

Estos terminos se solapan bastante.

Un reverse proxy puede hacer balanceo de carga, y un load balancer puede comportarse como reverse proxy.

La distincion útil es esta:

- reverse proxy suele enfatizar manejo de peticiones, routing, cabeceras, TLS y politicas
- load balancer suele enfatizar repartir trafico entre varios backends

En productos reales, una misma herramienta muchas veces hace ambas cosas.

## Reverse proxy vs API gateway

Un API gateway suele ser mas especializado.

Puede incluir:

- integración con autenticacion
- rate limiting
- transformacion de peticiones
- politicas especificas de API
- funciones para desarrolladores

Un reverse proxy puede ser simple y generalista. Un API gateway suele ser una capa mas opinada para APIs.

## Ejemplos populares

Tecnologias comunes de reverse proxy:

- Nginx
- Traefik
- HAProxy
- Envoy
- Caddy

En Kubernetes, un ingress controller muchas veces actua como reverse proxy para los servicios del cluster.

## Problemas comunes con los que la gente se encuentra

Los reverse proxies son muy utiles, pero tambien pueden ser una fuente de confusion.

Problemas tipicos:

- la app backend no confía en las cabeceras reenviadas
- bucles de redireccion HTTPS
- routing al hostname incorrecto
- la IP del cliente aparece como la IP del proxy
- los timeouts ocurren en la capa del proxy, no en la app

Al hacer troubleshooting, ayuda preguntar:

- llego la peticion al proxy?
- eligio el proxy el backend correcto?
- devolvio error el backend?
- reescribio o bloqueo algo el proxy por el camino?

## Idea final

Un reverse proxy es la puerta de entrada para una o varias aplicaciones.

Ayuda con:

- HTTPS
- routing
- balanceo
- control de acceso
- una exposicion publica mas limpia

Si gestionas servicios internos o publicos, es muy probable que ya estes usando uno, aunque todavia no lo llames así.
