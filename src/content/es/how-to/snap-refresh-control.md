---
title: "Snap en Ubuntu: cómo controlar (y frenar) las actualizaciones automáticas"
description: "snapd actualiza los snaps solo, varias veces al día. Cómo retener los refresh con snap refresh --hold, ajustar refresh.timer y refresh.hold, y qué opciones hay si quieres cero actualizaciones automáticas en una VM."
date: "2026-10-03"
tags: ["ubuntu", "snap", "snapd", "sysadmin", "unattended-upgrades"]
category: "engineering"
language: "es"
slug: "how-to/snap-refresh-control"
draft: false
---

Si en una máquina has apagado `unattended-upgrades` porque el parcheado lo controlas tú, queda un hueco: **los snaps se actualizan por su cuenta**, con un mecanismo que no tiene nada que ver con APT. Esta guía continúa la de [unattended-upgrades en Ubuntu](/es/docs/how-to/unattended-upgrades-control), y tiene el mismo objetivo: que la máquina no se actualice sin tu control.

---

## Cómo se actualizan los snaps

El demonio `snapd` comprueba por defecto si hay novedades **cuatro veces al día**. Cada comprobación se llama *refresh*. No usa `apt-daily` ni `unattended-upgrades`, así que ni la máscara ni el `0` de la guía anterior le afectan.

Primero mira qué snaps tienes, porque en Ubuntu Server suele haber alguno preinstalado:

```bash
snap list
```

Y cuándo ocurrió el último refresh y cuándo toca el siguiente:

```bash
snap refresh --time
```

```bash
# Qué se actualizaría en el próximo refresh
snap refresh --list
```

---

## Opción 1: retener los refresh con `--hold`

```bash
# Todos los snaps, indefinidamente
sudo snap refresh --hold=forever

# Solo uno, durante 72 horas
sudo snap refresh --hold=72h firefox
```

Sin duración, el valor por defecto es `forever`. Para quitar la retención:

```bash
sudo snap refresh --unhold
```

Ojo con la diferencia de alcance:

- `--hold` sin nombres (todos los snaps): frena solo los refresh automáticos. Un `snap refresh` manual sigue funcionando.
- `--hold <snap>` (snaps concretos): frena los refresh automáticos y también un `snap refresh` genérico.

En ambos casos, un `snap refresh <snap>` dirigido a un snap concreto sigue funcionando. Para una VM que actualizas tú, es justo lo que quieres: nada pasa solo, y tú decides cuándo y qué.

---

## Opción 2: ajustar la ventana con `refresh.timer`

Si prefieres que los refresh ocurran, pero en tu ventana de mantenimiento:

```bash
sudo snap set system refresh.timer=sat,03:00-04:00
```

Con `snap refresh --time` compruebas que se ha aplicado. Es control de *cuándo*, no de *si*.

---

## Opción 3: `refresh.hold` con fecha

```bash
sudo snap set system refresh.hold="$(date --date='+30 days' +%Y-%m-%dT%H:%M:%S%:z)"
```

Retiene el siguiente refresh hasta esa fecha y hora, en formato RFC 3339. El máximo es de **90 días**; pasado ese plazo, se hará el refresh aunque el valor siga puesto. Es válido para posponer, no para apagar.

---

## ¿Y un "disable" de verdad?

`snapd` no tiene un interruptor oficial para apagar los refresh. Lo más cercano son dos caminos:

1. **`snap refresh --hold=forever`**: el snap sigue funcionando y no se actualiza solo. Es lo que yo usaría en una VM con parcheado propio. Mejor aún si lo dejas en Ansible, idempotente, y lo compruebas con `snap refresh --time`.
2. **Quitar los snaps y `snapd`**, si no los necesitas: no hay nada que actualizar. Mira primero `snap list`: quitar un snap que usa tu sistema puede romper algo.

> [!WARNING]
> Con `--hold=forever` los snaps **no reciben parches de seguridad** hasta que los actualices tú. Es el mismo trato que con APT: si lo paras, el parcheado pasa a ser tu responsabilidad. Incluye `snap refresh --list` en tu proceso para ver qué hay pendiente.

---

## Resumen

- Los snaps se actualizan con `snapd`, no con APT: apagar `unattended-upgrades` no los toca.
- `sudo snap refresh --hold=forever` es la forma más directa de frenar los refresh automáticos y seguir actualizando a mano.
- `refresh.timer` mueve la ventana; `refresh.hold` solo pospone hasta 90 días.
- No hay un "disable" oficial; o retienes, o quitas `snapd`.

## Referencias

- [Gestionar actualizaciones de snaps (documentación oficial)](https://snapcraft.io/docs/how-to-guides/manage-snaps/manage-updates/)
- [unattended-upgrades en Ubuntu: cómo apagarlo de verdad](/es/docs/how-to/unattended-upgrades-control)
