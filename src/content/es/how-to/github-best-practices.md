---
title: "Buenas prácticas para repositorios públicos en GitHub"
description: "Una guía sobre rulesets de ramas, limpieza y reporte privado de vulnerabilidades con el CLI de GitHub."
date: "2026-06-13"
tags: ["github", "git", "devops", "security", "best-practices"]
category: "engineering"
language: "es"
slug: "how-to/github-best-practices"
draft: false
---

Cuando haces público un repositorio en GitHub, éste pasa de ser un entorno de pruebas privado a un escaparate público. Mantener una buena higiene en el repositorio es fundamental: protege tu código estable de subidas accidentales, asegura un historial limpio y proporciona un canal seguro para informar de vulnerabilidades de seguridad.

En lugar de navegar por la interfaz de ajustes de la web de GitHub, podemos automatizar estas configuraciones utilizando la herramienta **GitHub CLI (`gh`)**.

Aquí tienes una guía práctica sobre los mejores ajustes que puedes activar en un repositorio público de GitHub, cómo funcionan y los comandos exactos para configurarlos.

---

## 1. Limpieza automática de ramas al mezclar

Cada vez que mezclas un Pull Request, la rama de origen permanece en tu repositorio como una \"rama huérfana\". Con el tiempo, ésto acumula cientos de ramas muertas que dificultan la navegación y la búsqueda de trabajo activo.

Puedes configurar GitHub para que elimine la rama de origen automáticamente en cuanto se fusione el PR:

```bash
gh repo edit OWNER/REPO --delete-branch-on-merge
```

### Por qué es importante
*   **Cero mantenimiento**: Mantiene limpia la lista de ramas del repositorio sin tener que borrar ramas a mano.
*   **Estado claro**: Los desarrolladores ven de inmediato qué ramas se han integrado ya en el proyecto.

---

## 2. Actualización fluida de Pull Requests

Cuando hay varios Pull Requests abiertos a la vez, una rama puede quedarse desactualizada con respecto a la rama principal (`main`). Ésto a menudo obliga a los desarrolladores a descargar la rama localmente, hacer un merge o rebase y volver a subirla sólo para que sea apta para su fusión.

Al activar la actualización de ramas, GitHub añade un sencillo botón \"Update branch\" directamente en la interfaz del PR en la web:

```bash
gh repo edit OWNER/REPO --allow-update-branch
```

### Por qué es importante
*   **Fusión sin fricción**: Si `main` avanza, el autor puede actualizar la rama de su PR directamente desde la web.
*   **Consistencia en las pruebas**: Garantiza que el código se pruebe contra la versión más reciente de la rama base antes de fusionarse.

---

## 3. Proteger la rama principal con Rulesets

Históricamente, GitHub protegía las ramas mediante *Branch Protection Rules* (reglas de protección de ramas). Hoy en día, GitHub recomienda usar **Repository Rulesets** (conjuntos de reglas). Los Rulesets son más flexibles, se evalúan más rápido y se pueden aplicar a varias ramas a la vez de forma muy sencilla.

Queremos proteger la rama `main` para:
1.  Bloquear subidas directas (obligando a que todos los cambios pasen por un Pull Request).
2.  Bloquear la eliminación de la rama.
3.  Bloquear los force pushes (que reescriben el historial de git).
4.  Obligar a que todos los hilos de conversación de las revisiones estén resueltos antes de fusionar.

Para hacerlo a través de la consola, primero crea un archivo JSON local llamado `ruleset.json`:

```json
{
  "name": "Protect main branch",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/main"],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "deletion"
    },
    {
      "type": "non_fast_forward"
    },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true
      }
    }
  ]
}
```

A continuación, envíalo a la API de GitHub:

```bash
gh api -X POST /repos/OWNER/REPO/rulesets --input ruleset.json
```

---

## 4. Activar el reporte privado de vulnerabilidades

Si un investigador de seguridad encuentra un fallo en tu web o repositorio público, publicarlo como un Issue público es peligroso porque los atacantes podrían aprovecharlo antes de que tengas listo un parche.

GitHub ofrece **Private Vulnerability Reporting** (reporte privado de vulnerabilidades). Añade un botón seguro y privado en tu repositorio para que los investigadores puedan informarte de fallos directamente. Sólo los propietarios del repositorio pueden ver este reporte, y permite colaborar en privado en una solución antes de hacerla pública.

Para activarlo a través de la consola:

```bash
gh api -X PUT /repos/OWNER/REPO/private-vulnerability-reporting
```

Ésta es la funcionalidad que hace posible el flujo de trabajo de `security.txt`. Una vez activado, puedes dirigir de forma segura a los investigadores a:
`https://github.com/OWNER/REPO/security/advisories/new`

> [!TIP]
> Para más información, lee [Por qué necesitas un archivo security.txt](/es/docs/how-to/security-txt).

---

## Resumen de comandos útiles

Aquí tienes la lista rápida de comandos que deberías ejecutar en cualquier nuevo repositorio público para aplicar estas buenas prácticas:

```bash
# Ajustes de higiene del repositorio
gh repo edit OWNER/REPO --delete-branch-on-merge --allow-update-branch

# Activar reportes de seguridad privados
gh api -X PUT /repos/OWNER/REPO/private-vulnerability-reporting

# Proteger la rama principal con el ruleset configurado
gh api -X POST /repos/OWNER/REPO/rulesets --input ruleset.json
```
