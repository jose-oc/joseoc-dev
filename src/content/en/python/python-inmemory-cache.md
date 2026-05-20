# Building A Small In-Process Cache In Python Without Overengineering It

Not every cache needs Redis.

Sometimes you just want something small, local, and boring:

- a few hundred or a few thousand entries
- short lifetime
- process-local
- easy to reason about

That is exactly the kind of cache we added around successful JWT auth checks.

The goal was simple:

- avoid repeating the same expensive auth check over and over
- especially while a client is polling job status or reconnecting a websocket
- without changing the external API

### What kind of cache this is

This is an in-memory cache inside one Python process.

That means:

- fast
- simple
- no external dependency
- shared by threads in that process
- not shared across multiple worker processes

That last point matters. If you run several app workers, each worker has its own cache.

### The smallest useful design

We used a dictionary keyed by a token digest:

```python
cache = {
    "sha256-of-token": cached_value
}
```

The cached value contains:

- the authenticated identity
- an expiration timestamp

In simplified form:

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class CachedTokenReview:
    identity: str
    expires_at: float
```

And the cache lookup looks like:

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

That’s already enough for a functional TTL cache.

### Why hash the token?

We did not want raw JWTs sitting in memory as dictionary keys longer than necessary.

So instead of this:

```python
cache[token] = ...
```

we used:

```python
cache[sha256(token)] = ...
```

That is not encryption, but it is still cleaner than retaining raw bearer tokens as keys.

### Writing to the cache

A simple store function might look like this:

```python
def store_cached_identity(cache: dict, token: str, identity, ttl_seconds: float):
    now = time.monotonic()
    expires_at = now + ttl_seconds
    cache[cache_key(token)] = CachedTokenReview(
        identity=identity,
        expires_at=expires_at,
    )
```

But if you stop there, a few issues appear quickly.

### First caveat: expired entries can pile up

If you only delete expired entries when the same token is looked up again, stale entries can accumulate forever.

That is why we added pruning on write:

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

That keeps the cache from growing forever with dead entries.

### Second caveat: even a TTL cache can grow too large

Suppose a service sees lots of distinct tokens in a short burst. Even if the TTL is short, the cache could still spike in size.

So we added a max-item limit too.

Because Python dicts preserve insertion order, we can evict oldest entries fairly simply:

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

This is not a fancy LRU cache. It is just a bounded insertion-ordered cache with TTL cleanup.

And for a small operational cache, that is often enough.

### What about threads?

If the same cache is accessed from multiple threads, protect it.

We used a lock:

```python
import threading

cache_lock = threading.Lock()

with cache_lock:
    # read or write cache safely
```

Without a lock, concurrent requests could corrupt the cache or produce inconsistent behavior.

### Pros of this kind of cache

- Very simple.
- Very fast.
- No extra infrastructure.
- Great for short-lived, process-local memoization.
- Easy to explain and test.

### Cons

- Not shared across worker processes.
- Lost on restart.
- Limited correctness guarantees compared with a centralized cache.
- TTL means “possibly stale for a short time.”
- Easy to grow from “small helper” into “surprising subsystem” if you keep adding features.

### When it makes sense

This kind of cache is a good fit when:

- the cached thing is cheap to keep in memory
- the TTL is short
- stale data for a short period is acceptable
- cache misses are okay
- you mainly want to reduce repeated work, not build a source of truth

That matched our auth case pretty well. If one token review succeeds, using that result again for a short time is a reasonable tradeoff.

### When it does not make sense

It is a poor fit when:

- data must be globally consistent across processes
- revocation must be immediate
- the data volume is large
- eviction policy needs to be sophisticated
- you need persistence

In those cases, use a proper shared cache or rethink whether caching is appropriate.

### Other caveats worth keeping in mind

- TTL caches can briefly accept something that became invalid right after it was cached.
- Process-local caches do nothing for other processes.
- A bounded cache with oldest-entry eviction is simple, but not the same as LRU.
- Even hashed keys are still derived from secrets, so treat memory-dump risk realistically.

### A practical mental model

If you are wondering whether this is something you need, ask:

- Am I repeating the same expensive check a lot?
- Is a short-lived local cache acceptable?
- Would a simple dict plus lock solve 80% of the problem?

If the answer is yes, a small in-process cache is often the right answer.

Not glamorous. Just useful.
