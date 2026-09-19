---
title: "Copias de seguridad seguras y deduplicadas con Restic"
description: "Guía completa para realizar backups rápidos, cifrados y deduplicados con Restic en discos locales, servidores SFTP y almacenamiento en la nube."
date: "2026-09-16"
tags: ["restic", "backup", "security", "cli", "devops"]
category: "engineering"
language: "es"
slug: "how-to/restic-backup-guide"
draft: false
---

Todo el mundo sabe que necesita copias de seguridad, pero muchas implementaciones acaban siendo frágiles, lentas o difíciles de restaurar y comprobar. Herramientas tradicionales como `rsync` o `tar` no incluyen cifrado de cliente por defecto, transfieren datos redundantes entre ejecuciones o hacen que restaurar a un punto exacto en el tiempo sea tedioso.

[Restic](https://restic.net) es un programa de copias de seguridad de código abierto escrito en Go. Cifra los datos del repositorio por defecto, reduce el almacenamiento duplicado mediante deduplicación basada en contenido y admite almacenamiento local y backends remotos como SFTP, Amazon S3, MinIO y Backblaze B2.

```mermaid
flowchart LR
    subgraph Client ["Equipo Cliente"]
        A["Archivos y Directorios Locales"] --> B["División en bloques (Rabin Fingerprints)"]
        B --> C["Cifrado en Cliente (AES-256)"]
    end
    subgraph Repo ["Repositorio Cifrado (Local / SFTP / S3 / B2)"]
        C --> D["Pack Files (Blobs deduplicados)"]
        C --> E["Snapshots (Árboles puntuales)"]
        C --> F["Índice y Claves"]
    end
```

---

## 1. ¿Por qué elegir Restic?

Restic destaca por varias decisiones de diseño clave:

- **Cifrado por defecto**: cada dato, metadato, índice de snapshots y estructura de directorios se cifra mediante AES-256 (en modo CTR) y se autentica con Poly1305. El servidor de almacenamiento nunca ve los nombres de archivo ni el contenido en texto plano.
- **Deduplicación por contenido**: los archivos se dividen en bloques dinámicos según su contenido real y no por bloques de tamaño fijo. Si renombras un archivo, lo mueves de carpeta o modificas unas pocas líneas de un archivo enorme, solo se subirán los fragmentos modificados.
- **Restauraciones basadas en snapshots**: cada copia genera una instantánea inmutable. Restaurar un directorio a su estado exacto de hace dos semanas es tan sencillo e inmediato como restaurar la última copia.
- **Binario estático único**: sin demonios en segundo plano, bases de datos auxiliares ni dependencias complejas.
- **Variedad de backends**: soporte nativo para discos locales, SFTP, REST Server, AWS S3, MinIO, Backblaze B2, Google Cloud Storage y Azure Blob Storage.

---

## 2. Instalación

Restic se distribuye como un único binario ejecutable y está empaquetado para los principales sistemas operativos.

### macOS
```bash
brew install restic
```

### Linux (Debian / Ubuntu)
```bash
sudo apt update && sudo apt install restic
```

### Linux (Fedora)
```bash
sudo dnf install restic
```

### Linux (RHEL / CentOS Stream)
```bash
sudo dnf install epel-release
sudo dnf install restic
```

### Linux (Alpine)
```bash
apk add restic
```

### Descarga directa y actualización automática
Puedes descargar binarios precompilados directamente desde la página de [Releases de Restic en GitHub](https://github.com/restic/restic/releases). Una vez instalado, Restic puede actualizarse a sí mismo:

```bash
sudo restic self-update
```

---

## 3. Inicializar un repositorio

Un **repositorio** es el directorio o bucket cifrado donde Restic guarda todos los snapshots y bloques de datos deduplicados. Antes de hacer copias, es necesario inicializarlo.

### Disco local o unidad externa
```bash
restic init --repo /Volumes/BackupDrive/restic-repo
```

Al ejecutarlo, te solicitará una contraseña para el repositorio.

> [!CAUTION]
> Si pierdes la contraseña del repositorio, los datos son **irrecuperables**. Restic utiliza criptografía robusta sin puertas traseras ni claves maestras de recuperación. Guarda la contraseña en tu gestor de contraseñas.

### Uso de variables de entorno
Tener que indicar `--repo` y escribir la contraseña en cada comando resulta tedioso. Puedes simplificar tu flujo en la terminal exportando variables de entorno:

```bash
export RESTIC_REPOSITORY="/Volumes/BackupDrive/restic-repo"
export RESTIC_PASSWORD="TuPasswordSeguraAqui"
```

> [!TIP]
> Para scripts o automatizaciones, apunta `RESTIC_PASSWORD_FILE` a un archivo con permisos restringidos (`chmod 600`) o usa `RESTIC_PASSWORD_COMMAND` para obtener la clave dinámicamente desde herramientas como `pass`, la CLI de 1Password (`op`) o el Keychain de macOS.

---

## 4. Crear copias de seguridad

Con el repositorio inicializado, crear una copia de seguridad es tan simple como ejecutar:

```bash
restic backup ~/projects
```

Restic analiza la ruta de origen, trocea los archivos en bloques, calcula sus hashes criptográficos, comprueba el índice del repositorio y solo sube los datos nuevos o modificados.


### Respaldar varias rutas y etiquetar snapshots
Puedes respaldar múltiples directorios a la vez y asignar etiquetas (`tags`) para facilitar búsquedas y políticas de retención:

```bash
restic backup ~/projects ~/Documents ~/.config --tag workstation --tag dev
```

### Excluir archivos y directorios
Utiliza patrones `--exclude` o un archivo de exclusión para omitir dependencias, cachés y entornos virtuales:

```bash
restic backup ~/projects \
  --exclude "node_modules" \
  --exclude ".venv" \
  --exclude "*.log" \
  --exclude-caches
```

- `--exclude-caches`: omite automáticamente cualquier directorio que contenga un archivo `CACHEDIR.TAG` (estándar de caché).
- `--exclude-file=excludes.txt`: carga patrones de exclusión línea por línea desde un archivo de texto.
- `--one-file-system`: evita que Restic salte a otros sistemas de archivos montados (unidades de red, volúmenes externos, etc.).

---

## 5. Inspeccionar snapshots y cambios

### Listar todos los snapshots
```bash
restic snapshots
```

Salida:
```console
ID        Time                 Host        Tags        Paths
-------------------------------------------------------------------------------
a8f419c2  2026-09-15 10:00:00  laptop      workstation /home/user/projects
b92c43e1  2026-09-16 09:30:00  laptop      workstation /home/user/projects
-------------------------------------------------------------------------------
2 snapshots
```

Puedes filtrar snapshots por etiqueta o por host:
```bash
restic snapshots --tag workstation --host laptop
```

### Ver diferencias entre dos snapshots
Restic incluye un comando `diff` integrado para comprobar qué archivos cambiaron entre dos puntos en el tiempo:

```bash
restic diff a8f419c2 b92c43e1
```

### Buscar archivos en los backups
Para localizar en qué snapshots se encuentra un archivo específico:

```bash
restic find config.json
```

---

## 6. Restaurar datos

### Restauración completa de un snapshot
Para restaurar una instantánea completa en un directorio de destino:

```bash
restic restore a8f419c2 --target /tmp/restore-folder
```

También puedes usar el alias especial `latest` en lugar del identificador del snapshot:
```bash
restic restore latest --target /tmp/restore-folder
```

### Restaurar archivos o carpetas específicas
Para extraer únicamente una carpeta o archivo concreto sin tener que descargar todo el contenido del snapshot:

```bash
restic restore latest \
  --target /tmp/restore-folder \
  --include "/home/user/projects/website/src"
```

### Montar el repositorio como sistema de archivos (FUSE)
Una de las funciones más cómodas de Restic es montar todo el repositorio como un sistema de archivos virtual de solo lectura:

```bash
mkdir /mnt/restic
restic mount /mnt/restic
```

Mientras esté montado, puedes navegar por las instantáneas como si fuesen carpetas normales:
- `/mnt/restic/snapshots/` contiene cada snapshot organizado por fecha.
- `/mnt/restic/tags/` agrupa las copias por etiqueta.
- `/mnt/restic/hosts/` agrupa las copias por nombre de máquina.

Puedes copiar archivos sueltos usando cualquier comando estándar (`cp`, `rsync` o exploradores de archivos) sin necesidad de ejecutar una restauración manual.

> [!NOTE]
> Para usar `restic mount` es necesario contar con soporte FUSE (`macFUSE` en macOS o `fuse3` en Linux).

---

## 7. Políticas de retención: Diferencia entre `forget` y `prune`

El mantenimiento de las copias en Restic se divide en dos fases:

1. **`restic forget`**: elimina el registro de los snapshots según las reglas de retención configuradas. Los bloques de datos reales permanecen en el repositorio.
2. **`restic prune`**: revisa todo el repositorio, identifica los bloques de datos a los que ya ningún snapshot hace referencia, reempaqueta los bloques activos y borra los archivos obsoletos para liberar espacio en disco.

```mermaid
flowchart TD
    A["Ejecutar restic forget --keep-daily 7 --keep-weekly 4"] --> B["Snapshots desvinculados del índice"]
    B --> C["Los datos aún ocupan espacio en disco"]
    C --> D["Ejecutar restic prune (o flag --prune)"]
    D --> E["Bloques no referenciados eliminados y espacio liberado"]
```

### Configurar una política de retención escalonada
Puedes combinar distintas opciones de retención:

```bash
restic forget \
  --keep-daily 7 \
  --keep-weekly 4 \
  --keep-monthly 12 \
  --keep-yearly 2 \
  --prune
```

### Probar la política de forma segura con `--dry-run`
Siempre es recomendable simular qué snapshots se borrarían antes de aplicar cambios destructivos:

```bash
restic forget --keep-daily 7 --keep-weekly 4 --dry-run
```

### Verificar la integridad del repositorio
Para comprobar que los árboles, índices y sumas criptográficas coinciden:

```bash
restic check
```

Para descargar y verificar también el contenido completo de cada bloque de datos (recomendado periódicamente):

```bash
restic check --read-data
```

---

## 8. Trabajar con almacenamiento remoto

Restic permite respaldar tanto en directorios locales como en diversos backends remotos y de almacenamiento en la nube sin requerir plugins adicionales.

### SFTP (Servidor Linux remoto / NAS)
```bash
export RESTIC_REPOSITORY="sftp:backupuser@nas.local:/srv/restic-backups"
restic init
```

### Amazon S3 / MinIO / Ceph
```bash
export RESTIC_REPOSITORY="s3:s3.eu-west-1.amazonaws.com/mi-bucket-backups"
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export RESTIC_PASSWORD="PasswordDelRepositorio"

restic init
```

Para servidores compatibles con S3 como **MinIO**:
```bash
export RESTIC_REPOSITORY="s3:https://minio.internal.example.com/backups"
export AWS_ACCESS_KEY_ID="minioadmin"
export AWS_SECRET_ACCESS_KEY="miniopassword"
```

### Backblaze B2 (API compatible con S3)

### Servidor REST de Restic (Protección Append-Only)
El [rest-server](https://github.com/restic/rest-server) es un servidor HTTP ligero optimizado para Restic.

Cuando se inicia con el flag `--append-only`, los clientes de backup pueden subir nuevos snapshots y datos, pero **no pueden borrar ni sobrescribir copias existentes**. Incluso si una máquina cliente sufre un ataque de ransomware, el atacante no podrá destruir los backups históricos almacenados en el servidor.

```bash
export RESTIC_REPOSITORY="rest:https://user:password@backup.example.com/repo-name"
restic backup ~/projects
```

---

## 9. Ejemplo de automatización

A continuación se muestra un ejemplo de automatización en Bash como punto de partida para programarlo con cron o un temporizador de systemd:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Ubicación del repositorio y credenciales
export RESTIC_REPOSITORY="s3:s3.eu-west-1.amazonaws.com/prod-backups-bucket"
export RESTIC_PASSWORD_FILE="/etc/restic/password"
export AWS_SHARED_CREDENTIALS_FILE="/etc/restic/aws-credentials"

# Ejecutar backup
echo "[$(date)] Iniciando backup..."
restic backup \
  --tag automated \
  --tag daily \
  --exclude-caches \
  --exclude-file="/etc/restic/excludes.txt" \
  /var/www /etc /home

# Aplicar política de retención y limpieza
echo "[$(date)] Aplicando política de retención..."
restic forget \
  --tag automated \
  --keep-daily 7 \
  --keep-weekly 4 \
  --keep-monthly 6 \
  --prune

# Comprobación de integridad
echo "[$(date)] Ejecutando verificación del repositorio..."
restic check

echo "[$(date)] Backup completado con éxito."
```

---

## 10. Hoja de referencia rápida (CLI)

| Tarea | Comando |
| :--- | :--- |
| **Inicializar Repositorio** | `restic init` |
| **Crear Backup** | `restic backup /ruta/datos` |
| **Backup con Exclusiones** | `restic backup /datos --exclude "node_modules" --exclude-caches` |
| **Listar Snapshots** | `restic snapshots` |
| **Comparar Snapshots** | `restic diff <ID_1> <ID_2>` |
| **Restaurar Todo** | `restic restore latest --target /destino` |
| **Restaurar Carpeta Concreta** | `restic restore latest --target /destino --include "/datos/subcarpeta"` |
| **Montar como Sistema de Archivos** | `restic mount /mnt/restic` |
| **Retención y Limpieza** | `restic forget --keep-daily 7 --keep-weekly 4 --prune` |
| **Verificar Integridad** | `restic check --read-data` |
| **Estadísticas del Repositorio** | `restic stats` |

---

## Conclusión

Restic ofrece un equilibrio perfecto entre seguridad criptográfica, eficiencia de almacenamiento y simplicidad operativa. Al resolver la deduplicación, el cifrado y el almacenamiento remoto sin requerir servidores complejos, convierte la recuperación ante desastres en una tarea predecible y verificable.

Para consultar la documentación oficial y conocer detalles sobre sus especificaciones técnicas, visita [restic.net](https://restic.net) y el [repositorio de Restic en GitHub](https://github.com/restic/restic).
