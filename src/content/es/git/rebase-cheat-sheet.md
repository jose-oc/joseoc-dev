---
title: "Hoja de referencia de Git Rebase"
description: "Una referencia breve para hacer rebase con seguridad, resolver conflictos y saber cuándo usar `--force-with-lease`."
tags: ["git", "rebase", "control-de-versiones"]
category: "engineering"
slug: "git/rebase-cheat-sheet"
draft: false
---

# Hoja de referencia de Git Rebase

Si quieres la explicación completa, lee [Git Rebase sin miedo](/es/docs/git/rebase-without-fear).

## Flujo normal y seguro

```bash
git fetch origin
git checkout <your-branch>
git rebase origin/main
git push --force-with-lease
```

## Si hay conflictos

Edita los archivos con conflictos para resolverlos y luego:

```bash
git add <resolved-files>
git rebase --continue
```

## Si quieres cancelar el rebase

```bash
git rebase --abort
```

## Reglas de oro

- Rebase reescribe los IDs de los commits.
- Si la rama ya existe en GitHub, normalmente necesitas `git push --force-with-lease`.
- No hagas rebase y luego mezcles la rama remota antigua de vuelta.
- No uses `git push` normal después de un rebase y luego intentes arreglarlo con un merge.
- Si la rama se comparte, coordínate con el equipo antes de hacer rebase.

## mal patrón

```bash
git fetch origin
git checkout <your-branch>
git rebase origin/main
git pull
```

o:

```bash
git merge origin/<your-branch>
```

Éso puede reintroducir el historial antiguo y dejar el PR desordenado.
