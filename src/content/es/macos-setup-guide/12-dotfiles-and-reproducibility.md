---
title: "Infraestructura como código para tu Mac: gestionar dotfiles con Chezmoi"
description: "No vuelvas a configurar un Mac a mano. Aprende a usar Chezmoi y Brewfiles de Homebrew para gestionar tu configuración, sincronizar dotfiles entre máquinas y lograr una reproducibilidad del 100 %."
date: "2026-04-18"
tags: ["dotfiles", "chezmoi", "reproducibility", "devops", "automation"]
category: "engineering"
language: "es"
slug: "macos-setup-guide/dotfiles-and-reproducibility"
---

## Por qué importa

Has dedicado horas a afinar tu terminal, tu editor y tu shell. Si mañana se muriera tu portátil, ¿cuánto tardarías en volver exactamente al mismo estado? Para la mayoría de desarrolladores, la respuesta es "días de frustración".

Al tratar tu configuración como **Infrastructure as Code (IaC)**, te aseguras de que tu entorno sea permanente, versionado y reproducible. **Chezmoi** es una opción profesional para esto: gestiona tus dotfiles de forma segura y te permite recrear toda tu workstation en un Mac nuevo con un solo comando.

### Beneficios clave
* **Desechabilidad**: tu portátil deja de ser una mascota y pasa a ser ganado; puedes cambiar de máquina en minutos.
* **Control de versiones**: ves exactamente cuándo y por qué cambiaste un ajuste en tu editor.
* **Seguridad**: gestionas plantillas sensibles sin commitear secretos a Git.

---

## 1. Chezmoi: el gestor de dotfiles amigo de Git

Chezmoi funciona manteniendo una "fuente de verdad" en un repositorio Git oculto y "aplicando" esos archivos a tu directorio home real.

### Instalación
```bash
brew install chezmoi
```

### Inicializar tu repo
```bash
# Start a new local repository
chezmoi init

# Add your first files
chezmoi add ~/.zshrc
chezmoi add ~/.config/nvim
chezmoi add ~/.config/starship.toml

chezmoi status
```

Los archivos que añadas a chezmoi se almacenarán en `~/.local/share/chezmoi`. Ese directorio es un repositorio Git real.

![chezmoi git dir](../../../assets/chezmoi-git-dir.png)

---

## 2. La regla de oro: edita el origen, no el archivo desplegado

Una vez que un archivo está gestionado por Chezmoi, ya no deberías editarlo directamente en tu home. Si lo haces, tus cambios se sobrescribirán la próxima vez que apliques tus dotfiles.

### El flujo
1. **Editar**: `chezmoi edit ~/.zshrc` para abrir el archivo en tu [Neovim configurado](/es/docs/macos-setup-guide/editor-setup-neovim).
2. **Previsualizar**: `chezmoi diff` para ver qué va a cambiar.
3. **Aplicar**: `chezmoi apply` para hacer efectivos los cambios.

---

## 3. Subirlo a GitHub: hacer backup de tu configuración

Chezmoi guarda tus archivos "origen" en `~/.local/share/chezmoi`, que es un repositorio Git real. Para respaldar tus dotfiles debes commitear y hacer push desde ese directorio.

```bash
# Go to the source directory
chezmoi cd

# Commit and push your changes
git add .
git commit -m "Add my developer configuration"
git remote add origin https://github.com/your-username/dotfiles.git
git push -u origin main
```

---

## 4. Reproducibilidad al 100 % con Brewfile

Para que tu máquina sea realmente reproducible, también debes gestionar tus aplicaciones. Lo hacemos añadiendo a Chezmoi el `Brewfile` que creaste en la [configuración del sistema base](/es/docs/macos-setup-guide/base-system-setup-macos).

```bash
# Update your Brewfile
brew bundle dump --file="$HOME/Brewfile" --force

# Add it to chezmoi
chezmoi add ~/Brewfile
```

---

## 5. Configurar un Mac nuevo con un solo comando

Cuando estrenes un ordenador nuevo, la preparación se reduce a unos pocos pasos:

1. **Instalar Homebrew**.
2. **Instalar chezmoi**.
3. **Añadir datos personalizados a chezmoi**.
```bash
mkdir -p ~/.config/chezmoi
cat > ~/.config/chezmoi/chezmoi.toml <<EOF
data:
  email: "[EMAIL_ADDRESS]"
EOF
```
4. **Ejecutar chezmoi**:
```bash
chezmoi init --apply https://github.com/your-username/dotfiles.git
```
5. **Instalar con brew**:
```bash
brew bundle install --file="$HOME/Brewfile"
```

Esto clonará tu repo, instalará todas las herramientas de tu `Brewfile` y colocará cada archivo de configuración exactamente donde toca.

---

## 6. Configuración dinámica con templates

¿Y si quieres que tu `.zshrc` sea ligeramente distinto en el portátil del trabajo frente al personal? Chezmoi lo resuelve con **templates**.

### Paso 1: crear una template
Para convertir un archivo normal en template, usa `--template` al añadirlo:
```bash
chezmoi add --template ~/.zshrc
chezmoi add --template ~/.gitconfig
```
Esto añadirá `.zshrc.tmpl` y `.gitconfig.tmpl` a tu directorio de origen.

### Paso 2: añadir lógica y variables
Ahora puedes usar sintaxis de templates de Go para hacer tus archivos dinámicos.

**Ejemplo 1: líneas condicionales en `.zshrc`**
```bash
# ~/.zshrc.tmpl
{{ if eq .chezmoi.hostname "macbook-pro-work" }}
# Added by Antigravity
export PATH="/Users/jose/.antigravity/antigravity/bin:$PATH"
{{ end }}
```

**Ejemplo 2: email diferente en `.gitconfig`**
```ini
# ~/.gitconfig.tmpl
[user]
    name = Jose OC
    email = {{ .email }}
```

### Paso 3: definir tus datos
Para rellenar la variable `{{ .email }}`, crea un archivo de configuración en cada máquina en `~/.config/chezmoi/chezmoi.yaml`:

```yaml
# Personal Machine
data:
  email: "personal@email.com"

# Work Machine
data:
  email: "work@company.com"
```

Ahora, cuando ejecutes `chezmoi apply`, generará el archivo correcto para esa máquina concreta.

---

## 7. Buenas prácticas para dotfiles

---

## Resumen
¡Enhorabuena! Has transformado tu Mac de una colección de ajustes manuales en una **workstation de desarrollo totalmente automatizada y versionada**. Ahora formas parte de ese pequeño grupo de desarrolladores que puede sobrevivir a un fallo de hardware sin perder ni una sola línea de configuración.

**Happy Hacking!**
