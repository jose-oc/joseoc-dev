---
title: "Cómo acceder a tus discos Linux desde macOS con UTM (ext4 y Carpetas Compartidas)"
description: "Aprende a montar y acceder a discos duros externos ext4 de Linux directamente desde macOS usando UTM, passthrough USB y carpetas compartidas con bindfs."
date: "2026-08-20"
tags: ["virtualization", "utm", "ubuntu", "macos", "apple-silicon", "ext4", "storage", "devops"]
category: "engineering"
language: "es"
slug: "how-to/ubuntu-apple-silicon-utm-ext4"
draft: false
---

# Accede a tus discos Linux desde macOS: UTM, Passthrough USB ext4 y Carpetas Compartidas

Si trabajas en un Mac con Apple Silicon (M1, M2, M3, M4 o M5) y necesitas interactuar con sistemas de archivos nativos de Linux como **ext4**, macOS presenta un obstáculo importante: no puede montar ni escribir de forma nativa en sistemas de archivos ext4 sin recurrir a extensiones de kernel inestables o software de pago de terceros.

La solución más limpia, rápida y fiable es ejecutar una máquina virtual **Ubuntu Server ARM64** mediante [UTM](https://mac.getutm.app/). Dado que Apple Silicon funciona sobre arquitectura ARM64, UTM virtualiza Linux a velocidades prácticamente nativas aprovechando el framework Hypervisor integrado de macOS.

En esta guía veremos:

1. **Cómo configurar una máquina virtual de Ubuntu ARM64 en UTM** para obtener el máximo rendimiento.
2. **Cómo realizar passthrough de discos duros externos USB en ext4** directamente a la máquina virtual invitada.
3. **Cómo configurar carpetas compartidas anfitrión-huésped** utilizando `bindfs` para corregir los conflictos de permisos entre el UID 501 de macOS y el UID 1000 de Linux.
4. **Cómo automatizar el montaje persistente** con `/etc/fstab` y solucionar problemas comunes.

---

## 1. Configuración de la máquina virtual en UTM

### 1.1 Descarga y creación de la VM

1. Descarga e instala [UTM para macOS](https://mac.getutm.app/).
2. Descarga una imagen ISO oficial de **Ubuntu Server ARM64** (por ejemplo, Ubuntu 24.04 LTS ARM64).
3. Abre UTM y haz clic en **Create a New Virtual Machine** (o el botón `+`).

![Crear una nueva máquina virtual en UTM](../../../assets/utm-ubuntu/01-utm-create-vm.png)

4. En la pantalla inicial, selecciona **Virtualize**.

> [!IMPORTANT]
> Selecciona siempre **Virtualize** en equipos con Apple Silicon cuando utilices sistemas operativos ARM64. **No** elijas *Emulate* a menos que necesites ejecutar software heredado x86_64, ya que la emulación genera un consumo de CPU muy elevado.

![Seleccionar Virtualize en UTM](../../../assets/utm-ubuntu/02-utm-virtualize.png)

5. Selecciona **Linux** como sistema operativo.

![Seleccionar Linux en UTM](../../../assets/utm-ubuntu/03-utm-linux-os.png)

6. Busca y selecciona la imagen ISO de Ubuntu Server ARM64 que descargaste.
7. Configura el hardware del sistema:
   - **RAM**: Asigna al menos **4 GB** (o más según la capacidad de tu Mac).
   - **Núcleos de CPU**: Asigna al menos **4 núcleos**.
   - **Almacenamiento**: Asigna entre **32 GB y 64 GB** de disco virtual.
8. Indica una ruta de **Directorio Compartido** en tu Mac para compartirla con la máquina virtual (puedes ajustarla más adelante).

![Configurar directorio compartido en el asistente de UTM](../../../assets/utm-ubuntu/04-utm-shared-directory-wizard.png)

9. Revisa las opciones en la pantalla de **Resumen** (Summary), marca la casilla **Open VM Settings** y pulsa **Save**.

![Resumen de configuración de la VM en UTM](../../../assets/utm-ubuntu/05-utm-summary-settings.png)

### 1.2 Verificar configuración de recursos compartidos y USB

Antes de arrancar la máquina virtual, comprueba dos ajustes fundamentales en la ventana de preferencias de la VM:

1. **Pestaña Sharing (Compartir)**: Comprueba que el modo de compartición (**Directory Share Mode**) esté establecido en **VirtFS** (o WebDAV si prefieres el servicio SPICE WebDAV).

![Ajustes de Sharing en UTM con VirtFS](../../../assets/utm-ubuntu/06-utm-sharing-virtfs.png)

2. **Pestaña Input (Entrada)**: En **USB Support**, asegúrate de que esté seleccionado **USB 3.0 (XHCI)**. Esto es imprescindible para permitir el passthrough de discos duros externos a alta velocidad.

![Ajustes de Input en UTM con soporte USB 3.0 XHCI](../../../assets/utm-ubuntu/07-utm-input-usb3.png)

Inicia la máquina virtual y completa el proceso estándar de instalación de Ubuntu.

---

## 2. (Opcional) Instalar un entorno de escritorio ligero

Ubuntu Server se instala en modo consola (CLI). Si prefieres disponer de una interfaz gráfica de escritorio ligera, puedes instalar **XFCE (Xubuntu Desktop)** una vez completada la instalación inicial:

```bash
sudo apt update
sudo apt install xubuntu-desktop
```

> [!TIP]
> Las imágenes oficiales de escritorio de Xubuntu no se distribuyen como ISOs ARM64 independientes para Apple Silicon. Instalar la ISO oficial de Ubuntu Server ARM64 y añadir después el paquete `xubuntu-desktop` es la vía recomendada para contar con un entorno gráfico XFCE rápido y fluido en UTM.

---

## 3. Montar discos duros externos ext4 mediante Passthrough USB

Cuando conectas un disco duro ext4 a un Mac, macOS no puede interpretar el sistema de archivos. Si el disco contiene varias particiones (como una partición EFI FAT junto a una partición de datos ext4), macOS puede montar automáticamente la partición FAT y retener el descriptor del dispositivo en bloque, impidiendo que UTM capture el disco.

Sigue estos pasos para pasar el disco físico a Ubuntu de forma limpia:

### Paso A: Liberar el disco en macOS

1. Conecta el disco duro externo USB a tu Mac.
2. Si macOS muestra el aviso **"El disco que has introducido no es legible por este ordenador"** (o en inglés *"The disk you attached was not readable by this computer"*), pulsa en **Ignorar** (Ignore).

![Aviso de macOS de disco no legible con botón Ignore resaltado](../../../assets/utm-ubuntu/08-macos-unreadable-disk-prompt.png)

3. Abre el **Terminal** de macOS e identifica el identificador de disco correspondiente:

```bash
diskutil list
```

Ejemplo de salida:

```text
/dev/disk0 (internal, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      GUID_partition_scheme                        *1.0 TB     disk0
   ...

/dev/disk4 (external, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:     FDisk_partition_scheme                        *2.0 TB     disk4
   1:                      Linux                         2.0 TB     disk4s1
```

4. Desmonta todas las particiones del disco sin expulsar físicamente el hardware USB:

```bash
diskutil unmountDisk /dev/disk4
```

Deberías ver el mensaje de confirmación:

```text
Unmount of all volumes on disk4 was successful
```

### Paso B: Conectar el dispositivo USB en UTM

1. Con la máquina virtual de Ubuntu en ejecución, haz clic en el **icono de USB** situado en la barra de herramientas superior derecha de la ventana de UTM.

![Menú de dispositivos USB en la barra de herramientas de UTM](../../../assets/utm-ubuntu/09-utm-usb-devices-menu.png)

2. Selecciona tu disco externo (por ejemplo, `My Passport 0748`) y haz clic en **Connect...**.

![Opción Connect seleccionada en el menú USB de UTM](../../../assets/utm-ubuntu/10-utm-usb-connect-option.png)

3. Cuando macOS muestre el diálogo de seguridad **"UTM quiere acceder a [Nombre del Dispositivo]"**, pulsa en **Permitir** (Allow o Always Allow).

![Diálogo de confirmación de permisos en macOS para acceder al dispositivo USB](../../../assets/utm-ubuntu/11-macos-utm-usb-permission.png)

### Paso C: Montar la partición ext4 en Ubuntu

1. En la consola de tu máquina virtual Ubuntu, lista los dispositivos de almacenamiento disponibles:

```bash
lsblk --output NAME,SIZE,FSTYPE,MOUNTPOINT
```

Verás el disco físico transferido (por ejemplo, `sda` o `sdb`) junto a su partición ext4 (`sda1`):

```shell
jose@ubuserver:~$ lsblk --output NAME,SIZE,FSTYPE,MOUNTPOINT
NAME                        SIZE FSTYPE      MOUNTPOINT
loop0                      43.4M squashfs    /snap/snapd/27709
loop1                      61.9M squashfs    /snap/core24/1644
loop2                         4K squashfs    /snap/bare/5
loop3                     552.9M squashfs    /snap/gnome-46-2404/154
loop4                      91.7M squashfs    /snap/gtk-common-themes/1535
loop5                     188.2M squashfs    /snap/mesa-2404/1836
loop6                     245.1M squashfs    /snap/firefox/8753
loop7                     213.9M squashfs    /snap/thunderbird/1229
sda                         1.8T
└─sda1                      1.8T ext4
sr0                        1024M
vda                          64G
├─vda1                        1G vfat        /boot/efi
├─vda2                        2G ext4        /boot
└─vda3                     60.9G LVM2_member
  └─ubuntu--vg-ubuntu--lv  30.5G ext4        /
```

2. Crea el punto de montaje y monta la partición:

```bash
sudo mkdir -p /mnt/external_storage
sudo mount -t ext4 /dev/sda1 /mnt/external_storage
```

3. Verifica el acceso y la capacidad disponible:

```bash
df -h /mnt/external_storage
```

---

## 4. Configurar carpetas compartidas y corregir permisos con `bindfs`

Al compartir una carpeta entre macOS (anfitrión) y Ubuntu (invitado) mediante VirtFS/9p, es habitual encontrar problemas de permisos. macOS asigna los archivos al UID `501`, mientras que el usuario por defecto en Ubuntu utiliza el UID `1000`.

Para resolver esto de forma limpia y transparente, utilizamos **bindfs** para crear una capa de montaje con mapeo de identidades de usuario.

### Paso A: Instalar agentes de invitado y bindfs

Dentro del terminal de Ubuntu, instala los paquetes necesarios:

```bash
sudo apt update
sudo apt install spice-vdagent spice-webdavd bindfs
```

### Paso B: Crear los directorios de montaje sin procesar y mapeado

Creamos dos carpetas en el directorio personal (`home`) del usuario:
- `~/shares/raw_mac`: El montaje directo de VirtFS 9p desde el anfitrión.
- `~/mac_shared`: El punto de montaje con los permisos remapeados con acceso total de lectura y escritura.

```bash
mkdir -p ~/shares/raw_mac
mkdir -p ~/mac_shared
```

### Paso C: Configurar montajes persistentes en `/etc/fstab`

Abre `/etc/fstab` con tu editor preferido:

```bash
sudo nano /etc/fstab
```

Añade las siguientes dos líneas al final del archivo (sustituye `tu_usuario` por tu nombre de usuario real en Ubuntu):

```ini
# 1. Montar la carpeta compartida 9p sin procesar desde el anfitrión macOS
share  /home/tu_usuario/shares/raw_mac  9p  trans=virtio,version=9p2000.L,uver=9p2000.L,nofail  0  0

# 2. Mapear el UID 501 de macOS al usuario de Ubuntu para acceso completo de escritura
/home/tu_usuario/shares/raw_mac  /home/tu_usuario/mac_shared  fuse.bindfs  map=501/tu_usuario,allow_other,nofail  0  0
```

> [!NOTE]
> La opción `nofail` asegura que la máquina virtual arranque sin interrupciones incluso si el recurso compartido no está disponible en ese momento.

### Paso D: Aplicar y comprobar los montajes

Monta todos los sistemas de archivos configurados en `fstab`:

```bash
sudo mount -a
```

A partir de este momento, cualquier archivo creado o modificado en `~/mac_shared` dentro de Ubuntu tendrá permisos de lectura/escritura completos y se reflejará al instante en macOS con los permisos correctamente alineados.

---

## 5. Diagnóstico de problemas frecuentes

| Problema | Causa probable | Solución |
| :--- | :--- | :--- |
| **El icono de carpeta compartida está en gris** | El sistema invitado aún no ha montado la etiqueta del recurso compartido. | Comprueba que `spice-vdagent` esté activo, revisa `dmesg \| grep 9p` o ejecuta `sudo mount -a`. |
| **Error 'Permission Denied' en la carpeta compartida** | Discrepancia entre el UID del anfitrión (`501`) y del invitado (`1000`). | Asegúrate de tener instalado `bindfs` y que el parámetro `map=501/tu_usuario` en `/etc/fstab` indique tu usuario exacto de Ubuntu. |
| **El disco USB no aparece en Ubuntu (`lsblk`)** | macOS sigue bloqueando el dispositivo o no se activó la conexión en UTM. | Ejecuta `diskutil unmountDisk /dev/diskN` en macOS, abre el menú USB de UTM y pulsa en **Connect...**. |
| **La conexión USB se interrumpe tras suspensión** | El estado de reposo puede reiniciar la enumeración del bus USB. | En las opciones de energía de Ubuntu, desactiva la suspensión automática durante transferencias prolongadas de almacenamiento externo. |

---

## Resumen

Con UTM y la virtualización en ARM64, ejecutar Linux en Apple Silicon ofrece un rendimiento nativo excepcional. Al combinar `diskutil unmountDisk` con el passthrough USB 3.0 de UTM y el mapeo de permisos mediante `bindfs`, dispones de acceso directo a discos duros externos ext4 y carpetas compartidas bidireccionales fluidas y sin fricciones.
