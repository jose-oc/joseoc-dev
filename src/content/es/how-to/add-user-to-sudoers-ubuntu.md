---
title: "Cómo añadir un usuario a sudoers en Ubuntu Server (de forma limpia)"
description: "Guía práctica para otorgar permisos sudo en Ubuntu Server utilizando archivos de configuración modulares en /etc/sudoers.d/."
date: "2026-08-20"
tags: ["ubuntu", "linux", "sudo", "sysadmin", "security"]
category: "engineering"
language: "es"
slug: "how-to/add-user-to-sudoers-ubuntu"
draft: false
---

# Cómo añadir un usuario a sudoers en Ubuntu Server

Al configurar una nueva instancia de Ubuntu Server o aprovisionar máquinas virtuales, otorgar privilegios administrativos (`sudo`) a un usuario habitual es una de las primeras tareas esenciales.

Aunque muchos tutoriales recomiendan editar directamente el archivo monolítico `/etc/sudoers` o añadir usuarios al grupo `sudo` con `usermod`, el enfoque más limpio, mantenible y preparado para automatización es el uso de **archivos de configuración modulares** en `/etc/sudoers.d/`.

A continuación se explica paso a paso por qué y cómo configurar el acceso `sudo` mediante este método.

---

## ¿Por qué usar `/etc/sudoers.d/` en lugar de `/etc/sudoers`?

Por defecto, Ubuntu y los sistemas basados en Debian incluyen la directiva `#includedir /etc/sudoers.d` en el archivo principal `/etc/sudoers`.

El uso de archivos independientes dentro de `/etc/sudoers.d/` aporta ventajas clave:

* **Seguro y no destructivo**: Nunca modificas `/etc/sudoers` directamente, eliminando el riesgo de corromper la configuración base del sistema.
* **Modular y fácil de limpiar**: Para revocar el acceso administrativo de un usuario basta con eliminar su archivo dedicado (`rm /etc/sudoers.d/<usuario>`).
* **Ideal para automatización**: Herramientas como Ansible, Terraform, Puppet o `cloud-init` pueden desplegar archivos atómicos e idempotentes sin necesidad de realizar reemplazos complejos en `/etc/sudoers`.
* **Actualizaciones de paquetes seguras**: Las actualizaciones del paquete `sudo` no generarán conflictos con cambios manuales en `/etc/sudoers`.

---

## Paso a paso: Otorgar privilegios sudo mediante `/etc/sudoers.d/`

Debes ejecutar estos comandos como `root` o desde una cuenta con privilegios administrativos existentes.

### 1. Crear el archivo de configuración en sudoers.d

Crea un archivo dentro de `/etc/sudoers.d/` con el nombre del usuario.

#### Opción A: Sudo estándar (requiere contraseña)

```bash
echo "usuario ALL=(ALL:ALL) ALL" | sudo tee /etc/sudoers.d/usuario
```

#### Opción B: Sudo sin contraseña (para CI/CD o cuentas de automatización)

Si la cuenta está destinada a procesos en segundo plano, despliegues o entornos de desarrollo local y no debe solicitar contraseña:

```bash
echo "usuario ALL=(ALL:ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/usuario
```

> [!NOTE]
> Sustituye `usuario` por el nombre de usuario real en el sistema.

---

### 2. Configurar permisos estrictos

Linux exige que los archivos dentro de `/etc/sudoers.d/` sean de solo lectura para `root` e inaccesibles para otros usuarios. Si los permisos son demasiado permisivos, `sudo` ignorará el archivo por motivos de seguridad.

Ajusta los permisos a `0440` (`r--r-----`):

```bash
sudo chmod 0440 /etc/sudoers.d/usuario
```

---

### 3. Validar la sintaxis de sudoers

Antes de cerrar la sesión o probar, valida siempre la sintaxis de la configuración con `visudo -cf`:

```bash
sudo visudo -cf /etc/sudoers.d/usuario
```

Si el archivo es correcto, `visudo` responderá:

```text
/etc/sudoers.d/usuario: parsed OK
```

> [!WARNING]
> Si `visudo -cf` detecta algún error de sintaxis, corrígelo o elimina el archivo de inmediato. Un archivo con sintaxis rota dentro de `/etc/sudoers.d/` puede bloquear el acceso a sudo en todo el sistema.

---

## 4. Verificar el acceso

Inicia sesión como el usuario o cambia a su contexto para comprobar los permisos:

```bash
# Comprobar privilegios asignados al usuario
sudo -l -U usuario

# Probar ejecución
sudo whoami
```

Si está configurado correctamente, `sudo whoami` devolverá `root`.

---

## Reglas importantes para los archivos en `/etc/sudoers.d/`

1. **Sin puntos en los nombres de archivo**: Los archivos que contengan un punto (`.`) o terminen con tilde (`~`) son ignorados silenciosamente por `sudo`. Por ejemplo, `/etc/sudoers.d/usuario.conf` o `/etc/sudoers.d/usuario.bak` no se cargarán.
2. **No editar sin validación**: Si prefieres un editor interactivo, utiliza `sudo visudo -f /etc/sudoers.d/usuario` en lugar de `nano` o `vim` directo. `visudo` comprueba automáticamente la sintaxis antes de guardar.

---

## Comparativa de métodos

| Método | Recomendado para | Ventajas | Desventajas |
| :--- | :--- | :--- | :--- |
| **`/etc/sudoers.d/<archivo>`** | Automatización, VMs, Producción | Limpio, modular, fácil de automatizar | Requiere permisos estrictos (`0440`) |
| **`usermod -aG sudo <usuario>`** | Servidores y escritorios interactivos | Comando único y simple | Basado en grupo, menos granular |
| **`sudo visudo` (Edición directa)** | Opciones globales del sistema | Centralizado | Riesgo de errores de sintaxis en archivo principal |
