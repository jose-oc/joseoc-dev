---
title: "Por qué necesitas un archivo security.txt en tu web"
description: "Una introducción práctica al estándar RFC 9116 security.txt, cómo ayuda a reportar vulnerabilidades y qué opciones de contacto puedes utilizar."
date: "2026-06-13"
tags: ["security", "web-standards", "github", "web-best-practices"]
category: "engineering"
language: "es"
slug: "how-to/security-txt"
draft: false
---

Hace unos días, estaba auditando mi sitio web con las especificaciones estándar de la web y me topé con una recomendación de la que nunca había oído hablar: añadir un archivo `security.txt` en `/.well-known/security.txt`. 

Mi primera reacción fue: *¿Qué es esto y para qué lo necesito?*

Si gestionas un sitio web sencillo —especialmente uno estático como un portfolio o un proyecto de documentación—, la seguridad puede parecer algo de lo que sólo debes preocuparte si tienes una base de datos o inicios de sesión de usuarios. Pero los estándares web evolucionan, y tener una forma estandarizada de recibir reportes sobre fallos de seguridad se ha convertido en una práctica muy recomendada.

Aquí tienes una guía en lenguaje sencillo sobre qué es `security.txt`, por qué es importante y cómo configurarlo sin exponer tu correo electrónico personal a los spammers.

---

## ¿Qué es `security.txt`?

En esencia, `security.txt` es un simple archivo de texto que se sirve en una ubicación predecible de tu sitio web: `https://tudominio.com/.well-known/security.txt`. 

Está definido por el estándar **RFC 9116** (un estándar oficial de internet) y su propósito es muy sencillo: indicar a los investigadores de seguridad, hackers éticos y usuarios exactamente cómo informarte de las vulnerabilidades de seguridad que encuentren en tu sitio.

En lugar de que un investigador tenga que buscar en tu web un formulario de contacto, buscarte en redes sociales o adivinar tu correo electrónico, simplemente puede consultar este archivo de texto y obtener tus datos de contacto preferidos al instante.

---

## Por qué es importante: El flujo de \"divulgación responsable\"

Cuando un investigador de seguridad encuentra una vulnerabilidad en tu sitio web, por lo general quiere informarte de ello de forma privada para que puedas solucionarlo. Ésto es lo que se conoce como **divulgación responsable** (o *responsible disclosure*).

Si no tienes una forma clara de recibir este contacto:
*   El investigador podría frustrarse y publicar el fallo en internet inmediatamente para obligarte a prestar atención.
*   Podrían intentar rastrear tu sitio en busca de cualquier dirección de correo que puedan encontrar.
*   O simplemente podrían rendirse, dejando tu sitio vulnerable a actores maliciosos.

Al tener un archivo `security.txt`, demuestras que te importa la seguridad y ofreces a los investigadores un camino claro y sin fricciones para informarte de los problemas en privado.

---

## El gran dilema: exponer tu correo electrónico personal

Cuando la gente lee la especificación de `security.txt`, la configuración más común que ve es algo como esto:

```txt
Contact: mailto:seguridad@ejemplo.com
```

Si eres una empresa con un equipo de seguridad dedicado y una bandeja de entrada como `seguridad@empresa.com`, ésto es perfecto. Pero si es un proyecto personal o un portfolio estático, lo más probable es que no tengas un correo con dominio propio.

Si pones tu correo electrónico personal en `security.txt`, te enfrentas a dos riesgos inmediatos:
1.  **Spam**: Los bots automáticos rastrean constantemente la web en busca de archivos `.well-known/security.txt` para recopilar direcciones de correo. Tu bandeja de entrada personal acabará muy probablemente en bases de datos de spam.
2.  **Privacidad**: Cualquier persona que visite tu sitio puede leer fácilmente tu dirección de correo electrónico personal.

Afortunadamente, la especificación no te obliga a usar un correo electrónico. Tienes otras opciones de contacto.

---

## Opciones de contacto: Correos, formularios y GitHub

El campo `Contact` en un archivo `security.txt` puede ser una dirección de correo electrónico (con el prefijo `mailto:`) o una URL web (con el prefijo `https://`). Así es como se comparan las diferentes opciones:

### 1. Alias de correo dedicado (Bueno)
Si quieres usar el correo electrónico pero mantener limpia tu bandeja de entrada personal, puedes usar un correo enmascarado o un alias de correo (por ejemplo, usando *Ocultar mi correo* de iCloud, Firefox Relay o un alias dedicado como `tu-seguridad@outlook.com`). Si el alias empieza a recibir spam, puedes simplemente borrarlo o filtrarlo sin que afecte a tu correo principal.

### 2. Un formulario de contacto web (Mejor)
Si ya tienes un formulario de contacto o un portal de soporte, puedes enlazar directamente a él:

```txt
Contact: https://tudominio.com/contacto
```

Ésto mantiene tu dirección de correo electrónico oculta de los rastreadores y permite que te contacten a través de tu web.

### 3. Reportes de vulnerabilidades privados de GitHub (El mejor para código abierto)
Si el código fuente de tu web está alojado en GitHub como un repositorio público, puedes activar una función integrada llamada **Private Vulnerability Reporting** (Reportes de vulnerabilidades privados) en los ajustes de seguridad de tu repositorio.

Ésto permite a los investigadores enviar reportes de seguridad de forma privada directamente a tu repositorio. Ellos describen el error y tú puedes colaborar con ellos en un borrador de aviso privado para solucionarlo antes de publicarlo.

Puedes enlazar directamente a esta página de reporte en tu `security.txt`:

```txt
Contact: https://github.com/tu-usuario/tu-repo/security/advisories/new
```

Ésta es la opción más limpia: no requiere configurar ninguna dirección de correo electrónico, mantiene tu bandeja de entrada libre de spam y gestiona los reportes de seguridad de forma estructurada y cómoda para los desarrolladores.

---

## Cómo implementar `security.txt`

Si decides añadir uno, aquí tienes cómo configurarlo:

1.  Crea una carpeta llamada `.well-known` dentro del directorio de archivos estáticos públicos de tu sitio (en Astro, esta es la carpeta `public/`).
2.  Dentro de ella, crea un archivo de texto llamado `security.txt`.
3.  Añade los campos estándar:

```txt
Contact: https://github.com/tu-usuario/tu-repo/security/advisories/new
Expires: 2027-06-12T23:59:59.000Z
Preferred-Languages: en, es
Canonical: https://www.tudominio.com/.well-known/security.txt
```

> [!IMPORTANT]
> El campo `Expires` es **obligatorio** según la especificación RFC. Indica a los rastreadores cuándo debe dejar de considerarse válida la información de contacto. Debes establecer una fecha futura (normalmente de hasta un año) y recordar actualizarla anualmente.

---

## ¿Qué pasa si no quieres publicar uno?

Si tu sitio web es sencillo, estático y no tiene una parte trasera dinámica, los riesgos de seguridad ya son muy bajos. Si no quieres configurar un alias ni hacer público tu repositorio, **es mejor omitir el archivo `security.txt` por completo** antes que publicar una dirección de correo falsa o que no funcione. 

Un enlace de contacto que no funciona es peor que no tener ninguno, ya que hace perder el tiempo a los investigadores y desvirtúa el propósito de la especificación.
