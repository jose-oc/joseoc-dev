---
title: "Configurar un entorno de Python con direnv"
description: "Aprende a automatizar tu entorno de desarrollo Python usando direnv. Crea un entorno Python reproducible con virtualenv y uv."
date: "2026-05-01"
tags: ["python", "direnv", "setup", "devops", "automation"]
category: "engineering"
language: "es"
slug: "python-environment-direnv"
---

Cuando trabajo en un proyecto python o ansible quiero tener un entorno virtual con las dependencias de ese proyecto y que éste se active de forma automática cuando entro a la carpeta del proyecto.

Para ello la mejor herramienta que he encontrado es `direnv`.

Instalamos direnv con brew:

```shell
brew install direnv
```

Añade a `.zshrc`:
```shell
if (( ${+commands[direnv]} )); then
  eval "$(direnv hook zsh)"
fi
```

De esta forma lo tienes cargado automaticamente en cada shell que abres.

Ahora, en el directorio de tu proyecto, solo tienes que crear un archivo `.envrc` con un contenido similar a éste que te muestro, que es el que uso para trabajar con proyectos Ansible:

```shell
layout python python3

# To generate requirements-controller.txt run `uv pip compile --output-file requirements-controller.txt requirements-controller.in`
watch_file requirements-controller.txt
uv pip sync requirements-controller.txt
# less strict:
#python3 -m pip install --requirement requirements-controller.txt

export ANSIBLE_CONFIG=$PWD/ansible.cfg
export ANSIBLE_PYTHON_INTERPRETER=$VIRTUAL_ENV/bin/python
# Put your secrets in .envrc.private file with the format `export MYSECRET="VALUE"`
source_env_if_exists .envrc.private
```

## Explicación del archivo .envrc

* `layout python python3`: Activa el entorno virtual de python. El virtualenv se crea en un directorio `.direnv`. 
* `watch_file requirements-controller.txt`: Vigila el archivo `requirements-controller.txt` y recarga el entorno virtual si cambia. De esta forma las dependencias siempre estarán actualizadas con el archivo `requirements-controller.txt`
* `uv pip sync requirements-controller.txt`: Sincroniza el entorno virtual con el archivo `requirements-controller.txt`. Ésto instala las dependencias del proyecto en el entorno virtual.
* `export ANSIBLE_CONFIG=$PWD/ansible.cfg`: Exporta la variable de entorno `ANSIBLE_CONFIG` a `ansible.cfg`.
* `export ANSIBLE_PYTHON_INTERPRETER=$VIRTUAL_ENV/bin/python`: Exporta la variable de entorno `ANSIBLE_PYTHON_INTERPRETER` al entorno virtual de python.
* `source_env_if_exists .envrc.private`: Carga las variables de entorno del archivo `.envrc.private` si existe. Esto es util para no subir las variables de entorno privadas al repositorio. Recuerda añadir el archivo `.envrc.private` a `.gitignore`.

La línea `python3 -m pip install --requirement requirements-controller.txt` reemplazaría a `uv pip sync requirements-controller.txt` y serías tú quien editaría el archivo `requirements-controller.txt` para añadir o quitar dependencias, sin necesidad de especificar las dependencias transitivas.

Sin embargo, usando `uv pip sync requirements-controller.txt` sólo tienes que mantener actualizado el archivo `requirements-controller.in` y `uv` se encargará de generar el archivo `requirements-controller.txt` con las dependencias correctas, incluyendo las dependencias transitivas, resolviendo conflictos automáticamente. Puedes usarlo con `uv pip compile --output-file requirements-controller.txt requirements-controller.in`.

## Funcionamiento

Es todo automático. Cuando entras en el directorio, se ejecuta automaticamente el archivo `.envrc` y se activa el entorno virtual de python, se exportan las variables de entorno, etc. Cuando sales del directorio, se desactiva automaticamente el entorno virtual de python, las variables de entorno no estarán exportadas, etc.

## Seguridad con direnv

Recuerda que cada vez que modifiques el archivo `.envrc` tienes que ejecutar el comando `direnv allow`. Ésto es para permitir que direnv ejecute comandos en tu directorio. 

Por defecto, las variables de entorno que definas en .envrc solo afectarán al directorio del proyecto y a sus subdirectorios. Si quieres que afecten a todos los directorios, puedes usar el comando `direnv export --all`. 

