---
title: "Crear una pequeña caché en memoria en Python sin sobrediseñarla"
description: "Cómo implementar una caché en memoria ligera en Python usando un diccionario, Lock y expiración por TTL y límite de elementos, sin necesidad de Redis."
date: "2026-05-20"
tags: ["python", "caching", "in-memory", "concurrency", "performance"]
category: "engineering"
language: "es"
slug: "python-inmemory-cache"
---

No toda caché necesita Redis.

A veces solo quieres algo pequeño, local y aburrido:

- unos cientos o miles de entradas
- tiempo de vida corto
- local al proceso
- fácil de entender

Ése es exactamente el tipo de caché que añadimos para las comprobaciones de autenticación JWT exitosas.

El objetivo era sencillo:

- evitar repetir la misma comprobación de autenticación costosa una y otra vez
- especialmente cuando un cliente realiza peticiones periódicas (polling) sobre el estado de un trabajo o se reconecta a un websocket
- sin modificar la API externa

### Qué tipo de caché es ésta

Se trata de una caché en memoria dentro de un único proceso de Python.

Ésto significa que es:

- rápida
- simple
- sin dependencias externas
- compartida por los hilos de ese proceso
- no compartida entre múltiples procesos de ejecución (workers)

Este último punto es importante. Si ejecutas varios workers de la aplicación, cada worker tendrá su propia caché independiente.

### El diseño útil más pequeño

Utilizamos un diccionario indexado por un hash del token:

```python
cache = {
    "sha256-del-token": valor_en_cache
}
```

El valor almacenado en caché contiene:

- la identidad autenticada
- una marca de tiempo de expiración

De forma simplificada:

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class CachedTokenReview:
    identity: str
    expires_at: float
```

Y la búsqueda en caché tiene este aspecto:

```python
import hashlib
import time

def cache_key(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def get_cached_identity(cache: dict, token: str):
    now = time.monotonic()
    key = cache_key(token)
    cached = cache.get(key)
    if cached is None:
        return None
    if cached.expires_at <= now:
        del cache[key]
        return None
    return cached.identity
```

Eso ya es suficiente para tener una caché con tiempo de expiración (TTL) completamente funcional.

### ¿Por qué aplicar un hash al token?

No queríamos que los tokens JWT en texto plano permanecieran en memoria como claves del diccionario más tiempo del necesario.

Así que en lugar de hacer esto:

```python
cache[token] = ...
```

utilizamos:

```python
cache[sha256(token)] = ...
```

Esto no es un cifrado fuerte, pero sigue siendo mucho más limpio que conservar bearer tokens en bruto como claves.

### Escribir en la caché

Una función de guardado simple podría ser así:

```python
def store_cached_identity(cache: dict, token: str, identity, ttl_seconds: float):
    now = time.monotonic()
    expires_at = now + ttl_seconds
    cache[cache_key(token)] = CachedTokenReview(
        identity=identity,
        expires_at=expires_at,
    )
```

Pero si te detienes ahí, pronto surgirán algunos problemas.

### Primera advertencia: las entradas expiradas pueden acumularse

Si sólo eliminas las entradas expiradas cuando se vuelve a consultar ese mismo token, las entradas obsoletas pueden acumularse indefinidamente.

Por eso añadimos una limpieza (pruning) durante la escritura:

```python
def store_cached_identity(cache: dict, token: str, identity, ttl_seconds: float):
    now = time.monotonic()
    expires_at = now + ttl_seconds

    expired_keys = [
        key
        for key, cached in cache.items()
        if cached.expires_at <= now
    ]
    for key in expired_keys:
        del cache[key]

    cache[cache_key(token)] = CachedTokenReview(
        identity=identity,
        expires_at=expires_at,
    )
```

Así se evita que la caché crezca indefinidamente con entradas muertas.

### Segunda advertencia: incluso una caché con TTL puede crecer demasiado

Supongamos que un servicio recibe una avalancha de tokens diferentes en un intervalo muy corto. Incluso si el TTL es bajo, el tamaño de la caché podría dispararse.

Por tanto, también añadimos un límite máximo de elementos.

Como los diccionarios de Python preservan el orden de inserción por defecto, podemos desalojar las entradas más antiguas de manera bastante sencilla:

```python
def store_cached_identity(cache: dict, token: str, identity, ttl_seconds: float, max_items: int):
    now = time.monotonic()
    expires_at = now + ttl_seconds

    expired_keys = [
        key
        for key, cached in cache.items()
        if cached.expires_at <= now
    ]
    for key in expired_keys:
        del cache[key]

    key = cache_key(token)
    cache[key] = CachedTokenReview(identity=identity, expires_at=expires_at)

    while len(cache) > max_items:
        oldest_key = next(iter(cache))
        del cache[oldest_key]
```

Ésta no es una caché LRU (Least Recently Used) sofisticada. Es simplemente una caché acotada que respeta el orden de inserción con limpieza de TTL.

Y para una pequeña caché operativa, suele ser más que suficiente.

### ¿Qué pasa con los hilos?

Si se accede a la misma caché desde varios hilos, debes protegerla.

Nosotros usamos un bloqueo (lock):

```python
import threading

cache_lock = threading.Lock()

with cache_lock:
    # leer o escribir en la caché de forma segura
```

Sin un bloqueo, las peticiones concurrentes podrían corromper la caché o provocar comportamientos inconsistentes.

### Ventajas de este tipo de caché

- Muy simple.
- Muy rápida.
- Sin infraestructura adicional.
- Excelente para la memorización local en el proceso y de corta duración.
- Fácil de explicar y probar.

### Desventajas

- No se comparte entre diferentes procesos de ejecución.
- Se pierde al reiniciar el proceso.
- Garantías de consistencia limitadas en comparación con una caché centralizada.
- TTL significa "posiblemente obsoleto durante un breve periodo".
- Es fácil que crezca de "pequeña utilidad" a "subsistema sorprendentemente complejo" si sigues añadiendo características.

### Cuándo tiene sentido

Este tipo de caché es adecuado cuando:

- lo que se almacena en caché es barato de mantener en memoria
- el TTL es corto
- es aceptable tener datos ligeramente obsoletos durante un periodo breve
- los fallos de caché (cache misses) no son críticos
- tu objetivo principal es reducir trabajo repetido, no construir una fuente de verdad

Esto encajaba perfectamente con nuestro caso de autenticación. Si la revisión de un token tiene éxito, reutilizar ese resultado durante un breve espacio de tiempo es un compromiso razonable.

### Cuándo NO tiene sentido

No es adecuado cuando:

- los datos deben ser consistentes globalmente entre todos los procesos
- la revocación debe ser inmediata
- el volumen de datos es muy grande
- la política de desalojo (eviction) debe ser muy sofisticada
- necesitas persistencia

En esos casos, utiliza una caché compartida real o replantea si el almacenamiento en caché es lo adecuado.

### Otras advertencias a tener en cuenta

- Las cachés con TTL pueden aceptar brevemente algo que dejó de ser válido inmediatamente después de almacenarse en caché.
- Las cachés locales del proceso no hacen nada por otros procesos en otros servidores o contenedores.
- Una caché acotada con desalojo de la entrada más antigua es simple, pero no equivale a una LRU.
- Aunque uses hashes para las claves, éstas se derivan de secretos; evalúa con realismo el riesgo de un volcado de memoria.

### Un modelo mental práctico

Si te estás preguntando si ésto es lo que necesitas, hazte estas preguntas:

- ¿Estoy repitiendo la misma comprobación costosa con mucha frecuencia?
- ¿Es aceptable una caché local de corta duración?
- ¿Resolvería un simple diccionario junto con un bloqueo el 80% del problema?

Si la respuesta es afirmativa, una pequeña caché interna en el proceso suele ser la solución adecuada.

No es glamurosa. Simplemente útil.
