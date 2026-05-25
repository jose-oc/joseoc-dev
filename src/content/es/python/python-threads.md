---
title: "Usar hilos en aplicaciones web de Python sin bloquear la E/S"
description: "Aprende a ejecutar operaciones de E/S bloqueantes de forma segura dentro de aplicaciones web asíncronas de Python usando run_in_threadpool sin pausar el bucle de eventos."
date: "2026-05-20"
tags: ["python", "asyncio", "threads", "fastapi", "performance"]
category: "engineering"
language: "es"
slug: "python-threads-blocking-io"
---

Si desarrollas APIs de Python para sistemas reales, tarde o temprano te encontrarás con esta situación:

- tu framework web es asíncrono (async)
- parte de tu trabajo no es asíncrono en absoluto
- aun así, necesitas llamarlo de forma segura bajo carga

Éste era exactamente nuestro caso. La API está construida con FastAPI/Starlette, pero la autenticación requería:

- leer un token de revisión desde el disco
- llamar a `TokenReview` de Kubernetes usando `requests`

Ambas son operaciones bloqueantes. Si las ejecutas directamente dentro de un `async def`, pueden pausar el bucle de eventos (event loop) y ralentizar otras peticiones no relacionadas.

Ahí es donde los hilos ayudan.

### La idea básica

El Python asíncrono es fantástico cuando el código que estás llamando también es asíncrono. Pero si una función utiliza E/S (I/O) bloqueante, una opción práctica es:

- mantener tu ruta o dependencia asíncrona
- mover sólo la parte bloqueante a un pool de hilos (threadpool)

En Starlette/FastAPI, la herramienta habitual es:

```python
from starlette.concurrency import run_in_threadpool

result = await run_in_threadpool(blocking_function, arg1, arg2)
```

Esto te ofrece un punto intermedio muy interesante:

- tu controlador de API sigue siendo asíncrono
- tu trabajo bloqueante se ejecuta fuera del bucle de eventos
- otras peticiones pueden seguir procesándose

### ¿Por qué no convertir todo en código síncrono?

A veces se puede. En nuestro caso, no del todo.

Queríamos permitir la lectura del JWT desde el cuerpo de la petición HTTP para peticiones `POST`. El análisis del cuerpo de la petición ya es compatible con async. Por lo tanto, la mejor división fue:

- código asíncrono para extraer el token de la petición
- delegar el trabajo de autenticación bloqueante a un pool de hilos

Al final, quedó algo parecido a esto:

```python
from starlette.concurrency import run_in_threadpool

async def require_request_access(request):
    token = None
    if authenticator.config.enabled:
        token = await extract_http_jwt_token(request)

    return await run_in_threadpool(authenticator.authenticate, token)
```

Y para websockets:

```python
async def authenticate_websocket_access(websocket):
    token = extract_websocket_jwt_token(websocket)
    return await run_in_threadpool(authenticator.authenticate, token)
```

### Para qué sirve `run_in_threadpool`

Es estupendo cuando tienes código que es:

- bloqueante
- que ya funciona correctamente
- que no vale la pena reescribir en una versión completamente asíncrona

Ejemplos típicos:

- `requests`
- lectura de archivos locales
- SDKs que solo exponen clientes síncronos
- librerías heredadas (legacy)
- operaciones administrativas ligeras en CPU pero bloqueantes

Sin embargo, no es magia. Simplemente mueve el trabajo a hilos secundarios.

### Pros

- Fácil de adoptar de forma incremental.
- Permite que los endpoints asíncronos coexistan con librerías síncronas.
- A menudo es mucho menos invasivo que reescribir el código para usar `httpx.AsyncClient`, `aiofiles`, etc.
- Ideal para operaciones bloqueantes cortas como comprobaciones de autenticación, lecturas del sistema de archivos o llamadas a APIs externas.

### Contras

- Los hilos no son gratis.
- Demasiado trabajo en el pool de hilos puede convertirse en su propio cuello de botella.
- Depurar problemas de seguridad en hilos (thread-safety) es más complejo que depurar código asíncrono monohilo.
- Aún debes tener cuidado con el estado mutable compartido.

Este último punto es la gran advertencia.

### La trampa de `requests.Session`

Un patrón común es crear un único `requests.Session()` y reutilizarlo de forma indefinida:

```python
class Client:
    def __init__(self):
        self.session = requests.Session()
```

Esto puede estar bien en un programa síncrono sencillo. Pero tan pronto como empiezas a llamar a ese cliente de forma concurrida desde varios hilos, el estado compartido de la sesión se convierte en un problema.

Nosotros chocamos directamente con ésto.

Primero movimos las comprobaciones de autenticación al pool de hilos. Eso resolvió el problema del bucle de eventos. Pero entonces, múltiples peticiones podían llamar al mismo autenticador simultáneamente, y dicho autenticador mantenía una única `requests.Session` compartida.

Ésto es arriesgado.

> [!TIP]
> Crear un nuevo `requests.Session()` vs único reutilizado

Un patrón más seguro es crear una sesión nueva para cada llamada bloqueante y cerrarla explícitamente:

```python
import requests

def perform_token_review(url, headers, payload, timeout, verify):
    session = requests.Session()
    try:
        response = session.post(
            url,
            headers=headers,
            json=payload,
            timeout=timeout,
            verify=verify,
        )
        response.raise_for_status()
        return response.json()
    finally:
        session.close()
```

Esto evita compartir el estado mutable de la sesión entre diferentes hilos.

### ¿Qué pasa con la lectura de archivos?

Leer un archivo también es una operación bloqueante:

```python
with open("/var/run/secrets/kubernetes.io/serviceaccount/token", encoding="utf-8") as token_file:
    reviewer_token = token_file.read().strip()
```

Para archivos muy pequeños, esto suele ser rápido. Pero sigue siendo bloqueante. Si se encuentra dentro de un código llamado desde un controlador asíncrono, pertenece al mismo grupo mental de 'delegar en un pool de hilos'.

No siempre necesitas una librería de archivos asíncrona. A veces la respuesta más sencilla es:

- mantener el acceso al archivo de forma síncrona
- ejecutar toda la unidad de trabajo bloqueante en un hilo

### Un patrón simple que funciona bien

Una estructura práctica y limpia es:

```python
from starlette.concurrency import run_in_threadpool

async def route_handler(request):
    payload = await request.json()
    result = await run_in_threadpool(do_blocking_work, payload)
    return result
```

Y luego:

```python
def do_blocking_work(payload):
    token = read_token_file()
    response = call_sync_http_client(token, payload)
    return response
```

Esto hace que la frontera esté muy clara.

### Cuándo es adecuado este enfoque

Es probable que quieras usar este patrón si:

- tu aplicación ya es asíncrona
- una parte de ella utiliza librerías bloqueantes
- reescribir esas librerías requiere demasiado esfuerzo
- el trabajo bloqueante es importante pero relativamente pequeño

Es posible que no lo quieras si:

- casi todo en tu app es bloqueante de todos modos
- el trabajo requiere mucho uso de CPU en lugar de E/S
- realmente necesitas una red asíncrona de extremo a extremo con un rendimiento muy alto

### Advertencias finales que vale la pena recordar

- Un pool de hilos oculta el bloqueo del bucle de eventos, pero no hace que el código bloqueante sea asíncrono.
- Los objetos mutables compartidos necesitan especial cuidado una vez que intervienen los hilos.
- Los recursos por llamada (como las sesiones de requests) normalmente deben cerrarse de forma explícita.
- La corrección multihilo suele ser más importante que ahorrarse unas pocas líneas de código.

Si solo te quedas con esto, es suficiente:

Si tu aplicación asíncrona necesita llamar a código síncrono, `run_in_threadpool` suele ser el puente más limpio, pero solo si el código síncrono es seguro para hilos (thread-safe) o está aislado por llamada.
