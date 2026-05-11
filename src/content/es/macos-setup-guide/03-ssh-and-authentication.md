---
title: "Asegurar tu identidad: claves SSH, GPG y 1Password en macOS"
description: "Define una identidad de desarrollo segura. Aprende a generar claves SSH, integrarlas con 1Password y firmar tus commits de Git para obtener la máxima seguridad."
date: "2026-04-18"
tags: ["ssh", "git", "authentication", "security", "1password"]
category: "engineering"
language: "es"
slug: "macos-setup-guide/ssh-and-authentication"
---

## Por qué importa

En el mundo de DevOps y la ingeniería de software, tu identidad es uno de tus activos más valiosos. Si tus claves SSH se ven comprometidas, tu infraestructura también está en riesgo. Por otro lado, si tus claves están mal organizadas, perderás horas depurando errores de "Permission denied" al alternar entre repositorios personales y de trabajo.

Una configuración moderna y segura usa **autenticación biométrica** (mediante 1Password) para que las claves privadas nunca vivan en tu disco en texto plano.

### Beneficios clave
* **Máxima seguridad**: las claves privadas se guardan en un enclave seguro (1Password), no en `~/.ssh`.
* **Cero fricción**: autentícate con Touch ID en vez de teclear passphrases largas.
* **Organización**: gestiona varias cuentas de GitHub sin colisiones entre claves.

---

## 1. La forma moderna: 1Password SSH Agent

Deja de gestionar manualmente archivos `.pub` y claves privadas. 1Password puede actuar como tu SSH Agent, lo que significa que tus claves están cifradas y requieren aprobación biométrica para usarse.

### Activar el agente
1. Abre los ajustes de 1Password.
2. Ve a **Developer**.
3. Marca **Use the SSH Agent**.

![1Password SSH Agent](../../../assets/1password-ssh-agent.png)

### Configurar SSH para usar 1Password

En macOS, 1Password configura automáticamente el socket necesario. La app te pedirá permiso para añadir el `identity agent` en `~/.ssh/config`. Si no ves el aviso, puedes añadirlo a mano:

```sshconfig
Host *
  IdentityAgent "~/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock"
```

Ahora, cuando `git` necesite usar tu clave privada, utilizará el SSH agent de 1Password para firmar los datos. Se te pedirá tu contraseña maestra de 1Password o Touch ID para autorizar la operación SSH.

![1Password SSH Agent](../../../assets/1password-ssh-agent-use-key.png)

En mi caso, mantengo solo las claves públicas en `~/.ssh`, mientras que las privadas están en 1Password. Conservo las públicas para poder elegir qué clave usar según el proyecto.

```shell
~/.ssh
❯ la
Permissions Size User Date Modified Name
drwx------     - jose 25 Apr 21:09   agent
.rw-------@ 1.4k jose  1 May 20:40  󱁻 config
.rw-------@   99 jose 20 Mar 11:25  󰷖 id_ed25519_personal.pub
.rw-------@  101 jose 15 Apr 22:08  󰷖 id_ed25519_work.pub
.rw-------@ 5.5k jose 28 Apr 11:02  󰣀 known_hosts
```

---

## 2. Gestionar múltiples identidades

Si tienes una cuenta personal de GitHub y otra de trabajo, SSH necesita saber qué clave enviar a cada host.

### El problema de la colisión de identidades
Por defecto, SSH prueba la primera clave que encuentra. Si esa clave es válida pero pertenece a la cuenta equivocada, GitHub te rechazará.

### La solución: alias de host
Usa nombres de host únicos en tu `~/.ssh/config`:

```sshconfig
# Personal Account
Host github.com-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal.pub
  IdentitiesOnly yes

# Work Account
Host github.com-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_work.pub
  IdentitiesOnly yes
```

### Actualizar los remotes de Git
Una vez definidos estos alias, debes actualizar las URLs remotas de Git para usarlos. En lugar del típico `git@github.com:user/repo.git`, usa tu alias:

```bash
# For a personal project
git remote set-url origin git@github.com-personal:username/repo.git

# For a work project
git remote set-url origin git@github.com-work:company/repo.git
```

Esto le dice a Git que use la configuración SSH específica, y por tanto la clave concreta, definida para ese alias.

> [!IMPORTANT]
> Usa siempre `IdentitiesOnly yes`. Esto evita que SSH "bombardee" el servidor con todas las claves de tu agent, algo que puede acabar bloqueándote temporalmente.

---

## 3. Verificar y depurar la autenticación

Cuando algo falla, no adivines. Usa las herramientas de diagnóstico integradas.

### Probar la conexión
```bash
ssh -T git@github.com
```

También puedes probar los alias de host:
```bash
ssh -T git@github.com-personal
ssh -T git@github.com-work
```

Si ves un mensaje como `Hi username! You've successfully authenticated...`, todo va bien. Si no, toca depurar.

### Ver el "handshake"
Si falla, añade el flag verbose para ver exactamente qué claves se están ofreciendo:
```bash
ssh -vT git@github.com
```

### Listar claves activas
Comprueba qué claves tiene disponibles tu agent en ese momento, incluidas las de 1Password:
```bash
ssh-add -l
```

---

## 4. Buenas prácticas de seguridad con SSH

1. **Usa Ed25519**: es más rápido y más seguro que RSA.
2. **Pon passphrase**: si *tienes* que usar archivos locales, nunca los dejes sin passphrase.
3. **Audita tus claves**: revisa con frecuencia `github.com/settings/keys` y elimina máquinas antiguas.
4. **Biometría primero**: siempre que puedas, usa 1Password con Touch ID.

---

## Resumen
Ya has asegurado la "puerta de entrada" de tu entorno de desarrollo. Tus claves están gestionadas, tus identidades separadas y tu autenticación es biométrica. Ahora que la identidad está resuelta, vamos a [configurar Git](/es/docs/macos-setup-guide/git-and-version-control) para usarla correctamente.
