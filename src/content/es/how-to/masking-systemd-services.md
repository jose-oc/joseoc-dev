---
title: "Cómo enmascarar servicios de systemd en Ubuntu (y por qué stop o disable no bastan)"
description: "Aprende la diferencia entre detener, deshabilitar y enmascarar servicios de systemd en Ubuntu para impedir de forma definitiva que se inicien."
date: "2026-10-01"
tags: ["ubuntu", "systemd", "linux", "sysadmin", "devops"]
category: "engineering"
language: "es"
slug: "how-to/masking-systemd-services"
draft: false
---

Al administrar servicios en segundo plano en Ubuntu y sistemas basados en Debian, es muy habitual necesitar que ciertos servicios no se ejecuten bajo ningún concepto. Ya sea para optimizar una imagen ligera para la nube, evitar que las actualizaciones automáticas en segundo plano de Ubuntu bloqueen la base de datos de APT en tareas de CI/CD, o solucionar conflictos de puertos entre demonios, controlar el ciclo de vida de los servicios es fundamental.

Sin embargo, los comandos habituales de systemd como `systemctl stop` y `systemctl disable` no garantizan que un servicio permanezca inactivo.

Para hacer que una unidad sea completamente imposible de iniciar—incluso si es invocada por temporizadores, sockets, dependencias de otros servicios o comandos manuales accidentales—es necesario **enmascarar** (*mask*) el servicio.

A continuación se explica cómo funciona el enmascaramiento en systemd, en qué se diferencia de `stop` y `disable`, y cómo utilizarlo con ejemplos prácticos.

---

## Los tres niveles de control: Stop vs. Disable vs. Mask

Es común confundir el alcance real de `stop`, `disable` y `mask`:

```mermaid
flowchart TD
    subgraph Eventos ["Eventos de activación"]
        T1["Arranque del sistema (Boot)"]
        T2["Comando manual<br/>(systemctl start)"]
        T3["Dependencia / Timer / Socket<br/>(Requires=, .timer, .socket)"]
    end

    subgraph Resolucion ["Evaluación de la unidad en Systemd"]
        C{"¿Está enmascarada?<br/>(/etc/systemd/system/unit -> /dev/null)"}
        D{"¿Está habilitada?<br/>(enlace en .wants/)"}
    end

    subgraph Resultado ["Resultado"]
        R1["❌ Bloqueado con error<br/>'Unit is masked'"]
        R2["⚡ El servicio se inicia"]
        R3["⏳ Permanece inactivo (espera)"]
    end

    T1 --> C
    T2 --> C
    T3 --> C

    C -- "Sí" --> R1
    C -- "No" --> D

    D -- "Habilitada" --> R2
    D -- "Deshabilitada" --> T2
    D -- "Deshabilitada en arranque" --> R3
    D -- "Deshabilitada + llamada por dependencia" --> R2
```

### 1. `systemctl stop` (Solo en tiempo de ejecución)
* **Qué hace**: Detiene el proceso en ejecución de forma inmediata.
* **Qué no hace**: No altera la configuración en disco ni los enlaces de inicio.
* **Por qué vuelve a iniciarse**: El servicio volverá a levantarse en el siguiente reinicio del sistema, o en cualquier momento si otro servicio, temporizador (`.timer`), socket o administrador lo invoca.

```bash
sudo systemctl stop apt-daily.service
```

### 2. `systemctl disable` (Eliminación del enlace de arranque)
* **Qué hace**: Elimina el enlace simbólico del destino de arranque (como `/etc/systemd/system/multi-user.target.wants/<unidad>.service`). El servicio ya no arrancará automáticamente al encender el equipo.
* **Qué no hace**: No detiene una instancia que ya esté corriendo en memoria, ni impide que se active bajo demanda.
* **Por qué vuelve a iniciarse**: Cualquier administrador puede ejecutar `systemctl start`, o un servicio activo con directiva `Wants=` o `Requires=` puede iniciarlo, o una unidad `.timer` / `.socket` asociada puede activarlo.

```bash
sudo systemctl disable apt-daily.service
```

### 3. `systemctl mask` (Bloqueo total)
* **Qué hace**: Crea un enlace simbólico de la unidad apuntando directamente a `/dev/null`.
* **Qué garantiza**: Systemd trata la unidad como inválida o permanentemente prohibida. Cualquier intento de inicio—manual, en el arranque, por temporizador o por dependencias—falla de inmediato arrojando un error explícito.
* **Cómo restaurarlo**: La única forma de volver a utilizarlo es mediante `systemctl unmask`.

```bash
sudo systemctl mask apt-daily.service
```

---

## Tabla comparativa

| Característica / Comportamiento | `systemctl stop` | `systemctl disable` | `systemctl mask` |
| :--- | :---: | :---: | :---: |
| **¿Detiene el proceso en ejecución?** | ✅ Sí | ❌ No (requiere stop manual) | ❌ No (requiere stop manual) |
| **¿Evita el inicio automático en el arranque?** | ❌ No | ✅ Sí | ✅ Sí |
| **¿Impide el inicio manual con `systemctl start`?** | ❌ No | ❌ No | ✅ Sí (falla con error) |
| **¿Impide la activación por temporizador o socket?** | ❌ No | ❌ No | ✅ Sí |
| **¿Impide el inicio por dependencias (`Requires=`)?** | ❌ No | ❌ No | ✅ Sí |
| **¿Sobrevive a actualizaciones de paquetes?** | N/A | ⚠️ A veces se sobrescribe | ✅ Sí |

> [!NOTE]
> `systemctl mask` y `systemctl disable` modifican cómo systemd carga la configuración de la unidad. Para detener inmediatamente un servicio en ejecución al enmascararlo, añade el parámetro `--now`:
> ```bash
> sudo systemctl mask --now <nombre-servicio>
> ```

---

## Cómo funciona el enmascaramiento internamente

Systemd busca y resuelve las unidades siguiendo un orden de prioridad estricto en el sistema de archivos:

1. `/etc/systemd/system/` (Configuración local del administrador — **máxima prioridad**)
2. `/run/systemd/system/` (Unidades en tiempo de ejecución / efímeras generadas en el arranque)
3. `/lib/systemd/system/` o `/usr/lib/systemd/system/` (Unidades por defecto instaladas por paquetes — **mínima prioridad**)

Cuando ejecutas `sudo systemctl mask apt-daily.service`, systemd genera un enlace simbólico:

```bash
/etc/systemd/system/apt-daily.service -> /dev/null
```

```text
$ ls -l /etc/systemd/system/apt-daily.service
lrwxrwxrwx 1 root root 9 Oct  1 12:00 /etc/systemd/system/apt-daily.service -> /dev/null
```

Dado que `/etc/systemd/system/` tiene prioridad sobre `/lib/systemd/system/`, systemd lee el enlace a `/dev/null` en lugar del archivo original del paquete. Como resultado, systemd considera que la unidad está bloqueada y rechaza cualquier solicitud de arranque.

### Qué NO hace el enmascaramiento

El enmascaramiento opera exclusivamente dentro del gestor de servicios systemd:
* **No desinstala el paquete**: Los binarios en `/usr/bin/` y las configuraciones en `/etc/` siguen intactos.
* **No impide la ejecución directa por línea de comandos**: Si ejecutas el binario directamente (por ejemplo, ejecutando `sudo apt update` o arrancando un proceso manualmente en terminal), funcionará con normalidad porque no pasa a través de systemd.

---

## Ejemplos prácticos paso a paso

### Ejemplo 1: Silenciar las tareas automáticas de APT en Ubuntu

Los servidores Ubuntu ejecutan actualizaciones y comprobaciones de paquetes en segundo plano mediante dos servicios principales:
* `apt-daily.service` (descarga índices y listas de paquetes)
* `apt-daily-upgrade.service` (descarga e instala actualizaciones de seguridad desatendidas)

Estos servicios se activan mediante sus respectivos temporizadores: `apt-daily.timer` y `apt-daily-upgrade.timer`.

En entornos automatizados, pipelines de CI/CD o tareas de aprovisionamiento con Ansible, estas ejecuciones automáticas pueden dispararse en el momento menos oportuno, bloqueando `/var/lib/dpkg/lock-frontend` y provocando errores de despliegue.

#### Paso 1: Detener y enmascarar servicios y temporizadores

Para anular definitivamente tanto los temporizadores como los servicios:

```bash
# Detener instancias en ejecución y enmascarar todo simultáneamente
sudo systemctl mask --now apt-daily.service apt-daily.timer apt-daily-upgrade.service apt-daily-upgrade.timer
```

Systemd confirmará la creación de los enlaces:

```text
Created symlink /etc/systemd/system/apt-daily.service → /dev/null.
Created symlink /etc/systemd/system/apt-daily.timer → /dev/null.
Created symlink /etc/systemd/system/apt-daily-upgrade.service → /dev/null.
Created symlink /etc/systemd/system/apt-daily-upgrade.timer → /dev/null.
```

#### Paso 2: Verificar el estado enmascarado

Comprueba el estado de cualquiera de los servicios:

```bash
systemctl status apt-daily.service
```

Salida:
```text
○ apt-daily.service
     Loaded: masked (Reason: Unit apt-daily.service is masked.)
     Active: inactive (dead)
```

#### Paso 3: Probar qué ocurre al intentar iniciarlo

Si otro proceso o administrador intenta iniciar el servicio:

```bash
sudo systemctl start apt-daily.service
```

Systemd rechazará la petición inmediatamente:

```text
Failed to start apt-daily.service: Unit apt-daily.service is masked.
```

#### Paso 4: Comprobar que los comandos manuales siguen funcionando

Enmascarar la unidad de systemd no afecta al uso interactivo de las herramientas. Puedes actualizar e instalar paquetes manualmente sin problemas:

```bash
sudo apt update && sudo apt upgrade -y
```

El comando se ejecuta sin trabas porque la llamada directa a `apt` no interactúa con `apt-daily.service`.

---

### Ejemplo 2: Listar todos los servicios enmascarados en el sistema

Para auditar qué unidades están actualmente enmascaradas en la máquina:

```bash
systemctl list-unit-files --state=masked
```

Salida de ejemplo:
```text
UNIT FILE                  STATE  PRESET 
apt-daily-upgrade.service  masked enabled
apt-daily-upgrade.timer    masked enabled
apt-daily.service          masked enabled
apt-daily.timer            masked enabled

4 unit files listed.
```

---

### Ejemplo 3: Enmascaramiento temporal para mantenimiento (`--runtime`)

Si necesitas evitar que un servicio se inicie durante una ventana de mantenimiento o pruebas de diagnóstico, pero quieres que el bloqueo desaparezca automáticamente en el próximo reinicio, utiliza el parámetro `--runtime`:

```bash
sudo systemctl mask --runtime nginx.service
```

Esto crea el enlace simbólico en `/run/systemd/system/nginx.service -> /dev/null`. Como `/run` es un sistema de archivos temporal en memoria (`tmpfs`), el bloqueo se descarta al reiniciar el servidor.

---

## Cómo desenmascarar y restaurar un servicio

Cuando quieras volver a habilitar el servicio, utiliza `systemctl unmask`:

```bash
# 1. Eliminar los enlaces a /dev/null
sudo systemctl unmask apt-daily.service apt-daily.timer apt-daily-upgrade.service apt-daily-upgrade.timer

# 2. Habilitar e iniciar los temporizadores si deseas que se ejecuten en el arranque
sudo systemctl enable --now apt-daily.timer apt-daily-upgrade.timer
```

Salida tras desenmascarar:
```text
Removed /etc/systemd/system/apt-daily.service.
Removed /etc/systemd/system/apt-daily.timer.
Removed /etc/systemd/system/apt-daily-upgrade.service.
Removed /etc/systemd/system/apt-daily-upgrade.timer.
```

> [!WARNING]
> Desenmascarar un servicio únicamente elimina el enlace a `/dev/null`; no habilita ni inicia la unidad automáticamente. Recuerda ejecutar `systemctl enable` o `systemctl start` tras el desenmascaramiento si necesitas que vuelva a estar activa.

---

## Buenas prácticas y recomendaciones

1. **Enmascara también los temporizadores y sockets asociados**: Si el servicio tiene un archivo `.timer` (como `apt-daily.timer`) o `.socket` (como `cups.socket`), enmascarar solo el `.service` provocará que el temporizador siga activándose y genere advertencias en los logs. Enmascara ambos.
2. **Utiliza `--now` para detener inmediatamente**: Por defecto, `systemctl mask` solo bloquea ejecuciones futuras. Combínalo con `systemctl mask --now <unidad>` para forzar la detención inmediata del proceso.
3. **No borres archivos en `/lib/systemd/system/`**: Nunca elimines manualmente las definiciones de paquetes del sistema. Las actualizaciones de paquetes volverán a crearlos. El enmascaramiento en `/etc/systemd/system/` es la vía oficial y limpia.
4. **Revisa unidades enmascaradas en auditorías**: Si un servicio no arranca y arroja `Unit is masked`, consulta `systemctl list-unit-files --state=masked` para verificar el motivo del bloqueo.
