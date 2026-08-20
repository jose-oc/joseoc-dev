# **Ubuntu Server on Apple Silicon (M1/M2/M3)**

### **Setup Guide: UTM, ext4 USB Passthrough, and Shared Folders**

This guide provides the necessary steps to run an Ubuntu Server virtual machine on macOS using UTM, with full access to external ext4 drives and a shared folder with correct write permissions.

## **1\. Virtual Machine Configuration (UTM)**

1. **Download UTM:** Install [UTM](https://docs.getutm.app/installation/macos/).  
2. **Create VM:**  
   * Select **Virtualize** (do not use Emulate for M1 chips).  
   * Choose **Linux** and select your Ubuntu Server ARM64 ISO.  
   * **Hardware:** Allocate at least 4 CPU cores and 4GB of RAM.  
3. **Sharing Settings:**  
   * Go to the **Sharing** tab in the VM settings.  
   * Select the Mac folder you want to share.  
4. **Input Settings:**  
   * Ensure **USB 3.0 (XHCI)** is enabled to support external hard drives.

You can install whatever linux flavour you prefer. As I’m on macOS M5 machine, I want to use an ARM ISO image. 

Optional. In case I wanted graphical interface, I’m used to work with xubuntu, but there’s no arm ISO for xubuntu available to download so the solution is to install ubuntu server arm ISO and then install 

sudo apt update

sudo apt install xubuntu-desktop 


## **2\. Mounting External ext4 Hard Drives**

Since macOS cannot read ext4, we must "pass through" the USB hardware directly to the VM. If the disk has multiple partitions (like FAT and ext4), macOS may "grab" the FAT partition, preventing the VM from seeing the disk.

Plug the USB cable, then:

**Step A: Release the disk from macOS**

Before attaching the disk to UTM, ensure macOS has let go of it. Open the **macOS Terminal** and run:

1. diskutil list (Identify your disk, e.g., disk4)  
2. diskutil unmountDisk /dev/disk4 (Unmount all partitions without ejecting the hardware)

Example:

\`\`\`

**\~** on **󱇶 tfc-devops-sa@tfc-development-261608(eu-w4)** 

**❯** diskutil list

/dev/disk0 (internal, physical):

   \#:                       TYPE NAME                    SIZE       IDENTIFIER

   0:      GUID\_partition\_scheme                        \*1.0 TB     disk0

   1:             Apple\_APFS\_ISC Container disk1         576.7 MB   disk0s1

   2:                 Apple\_APFS Container disk3         994.6 GB   disk0s2

   3:        Apple\_APFS\_Recovery Container disk2         5.4 GB     disk0s3

/dev/disk3 (synthesized):

   \#:                       TYPE NAME                    SIZE       IDENTIFIER

   0:      APFS Container Scheme \-                      \+994.6 GB   disk3

                                 Physical Store disk0s2

   1:                APFS Volume Macintosh HD            12.6 GB    disk3s1

   2:              APFS Snapshot com.apple.os.update-... 12.6 GB    disk3s1s1

   3:                APFS Volume Preboot                 9.1 GB     disk3s2

   4:                APFS Volume Recovery                1.6 GB     disk3s3

   5:                APFS Volume Data                    233.0 GB   disk3s5

   6:                APFS Volume VM                      5.4 GB     disk3s6

/dev/disk4 (external, physical):

   \#:                       TYPE NAME                    SIZE       IDENTIFIER

   0:     FDisk\_partition\_scheme                        \*2.0 TB     disk4

   1:                      Linux                         2.0 TB     disk4s1

**\~** on **󱇶 tfc-devops-sa@tfc-development-261608(eu-w4)** 

**❯** diskutil unmountDisk /dev/disk4

Unmount of all volumes on disk4 was successful

\`\`\`

**Step B: Pass through to UTM**

1. Start the Ubuntu VM.  
2. Plug in the USB HDD to the Mac.  
3. If macOS says "The disk you attached was not readable," click **Ignore** or **Cancel**.  
4. In the UTM toolbar (top right), click the **USB icon** and select your HDD.

**Step C: Mount in Ubuntu**

1. In the Ubuntu terminal, identify the partitions:  
2. lsblk \--output NAME,SIZE,FSTYPE,MOUNTPOINT  
3. Create the mount point and mount the ext4 partition (usually sdb1 or sdb2):  
4. sudo mkdir \--parents /mnt/external\_storage  
   sudo mount \--types ext4 /dev/sdb2 /mnt/external\_storage

## **3\. Shared Folder Setup (Permissions Fix)**

Shared folders on M1 VMs often suffer from UID mismatches (macOS uses 501, Ubuntu uses 1000). We solve this using bindfs.

### **Step A: Install Dependencies**

sudo apt update  
sudo apt install spice-vdagent spice-webdavd bindfs

sudo apt **install** spice-vdagent spice-webdavd bindfs neovim

### **Step B: Create Mount Points**

We use a "raw" folder for the initial mount and a "user" folder for the permission-mapped version.

mkdir \--parents \~/shares/raw\_mac  
mkdir \--parents \~/mac\_shared

### **Step C: Automate with fstab**

To make the shares permanent, edit the filesystem table:

sudo nano /etc/fstab

Add these two lines at the bottom (replace your\_user with the actual Ubuntu username):

\# 1\. Mount the raw 9p share from the host  
share  /home/your\_user/shares/raw\_mac  9p  trans=virtio,version=9p2000.L,uver=9p2000.L  0  0

\# 2\. Map macOS UID 501 to the Ubuntu user for write access  
/home/your\_user/shares/raw\_mac  /home/your\_user/mac\_shared  fuse.bindfs  map=501/your\_user,allow\_other  0  0

### **Step D: Apply Changes**

sudo mount \--all

## **4\. Troubleshooting**

* **"Grayed Out" Icon:** If the shared folder icon in UTM is gray, it means the guest hasn't mounted the share tag yet. Ensure the fstab entries are correct.  
* **Permission Denied:** If you can't write to the share, verify that bindfs is running and that the map=501/your\_user flag is using the correct names.  
* **USB Device Not Found:** Ensure you have manually clicked the USB icon in the UTM toolbar to "connect" the physical device to the VM.