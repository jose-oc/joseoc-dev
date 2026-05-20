# Using Threads In Python Web Apps Without Tripping Over Blocking I/O

If you build Python APIs for real systems, sooner or later you hit this situation:

- your web framework is async
- part of your work is not async at all
- you still need to call it safely under load

That was exactly the case here. The API is built with FastAPI/Starlette, but authentication needed to:

- read a reviewer token from disk
- call Kubernetes `TokenReview` using `requests`

Both of those are blocking operations. If you run them directly inside an `async def`, they can pause the event loop and slow down unrelated requests.

That’s where threads help.

### The basic idea

Async Python is great when the code you are calling is also async. But if a function uses blocking I/O, one practical option is:

- keep your async route or dependency
- move only the blocking part into a threadpool

In Starlette/FastAPI, the usual tool is:

```python
from starlette.concurrency import run_in_threadpool

result = await run_in_threadpool(blocking_function, arg1, arg2)
```

That gives you a nice middle ground:

- your API handler stays async
- your blocking work runs outside the event loop
- other requests can keep moving

### Why not just turn everything into sync code?

Sometimes you can. In our case, not quite.

We wanted to support reading the JWT from the HTTP request body for `POST` requests. Request body parsing is already async-friendly. So the best split was:

- async code to extract the token from the request
- threadpool offload for the blocking auth work

That ended up looking roughly like this:

```python
from starlette.concurrency import run_in_threadpool

async def require_request_access(request):
    token = None
    if authenticator.config.enabled:
        token = await extract_http_jwt_token(request)

    return await run_in_threadpool(authenticator.authenticate, token)
```

And for websockets:

```python
async def authenticate_websocket_access(websocket):
    token = extract_websocket_jwt_token(websocket)
    return await run_in_threadpool(authenticator.authenticate, token)
```

### What `run_in_threadpool` is good for

It shines when you have code that is:

- blocking
- already working
- not worth rewriting into a full async version

Typical examples:

- `requests`
- reading local files
- some SDKs that only expose sync clients
- legacy libraries
- CPU-light but blocking administrative operations

It is not magic, though. It just moves work to threads.

### Pros

- Easy to adopt incrementally.
- Lets async endpoints coexist with sync libraries.
- Often much less invasive than rewriting code to use `httpx.AsyncClient`, `aiofiles`, and so on.
- Good fit for short blocking operations like auth checks, filesystem reads, or external API calls.

### Cons

- Threads are not free.
- Too much threadpool work can become its own bottleneck.
- Debugging thread-safety issues is more subtle than debugging single-threaded async code.
- You still need to think about shared mutable state.

That last one is the big caveat.

### The `requests.Session` trap

A common pattern is to create one `requests.Session()` and reuse it forever:

```python
class Client:
    def __init__(self):
        self.session = requests.Session()
```

That can be fine in a simple sync program. But once you start calling that client concurrently from multiple threads, shared session state becomes a concern.

We hit that directly.

We first moved auth checks into the threadpool. That solved the event-loop problem. But then multiple requests could call the same authenticator concurrently, and that authenticator held one shared `requests.Session`.

That is risky.

A safer pattern is to create a fresh session for each blocking call and close it explicitly:

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

That avoids sharing mutable session state across threads.

### What about reading files?

Reading a file is blocking too:

```python
with open("/var/run/secrets/kubernetes.io/serviceaccount/token", encoding="utf-8") as token_file:
    reviewer_token = token_file.read().strip()
```

For very small files, this is usually fast. But it is still blocking. If it sits inside code called from an async handler, it belongs in the same “offload to threadpool” mental bucket.

You do not always need an async file library. Sometimes the simplest answer is:

- keep file access sync
- run the whole blocking unit of work in a thread

### A simple pattern that works well

A nice practical structure is:

```python
from starlette.concurrency import run_in_threadpool

async def route_handler(request):
    payload = await request.json()
    result = await run_in_threadpool(do_blocking_work, payload)
    return result
```

And then:

```python
def do_blocking_work(payload):
    token = read_token_file()
    response = call_sync_http_client(token, payload)
    return response
```

That makes the boundary very clear.

### When this approach is a good fit

You probably want this pattern if:

- your app is already async
- one part of it uses blocking libraries
- rewriting those libraries out is too much effort
- the blocking work is important but relatively small

You may not want it if:

- nearly everything is blocking anyway
- the work is CPU-heavy rather than I/O-heavy
- you truly need high-throughput async networking end-to-end

### Final caveats worth remembering

- A threadpool hides event-loop blocking, but it does not make blocking code async.
- Shared mutable objects need extra care once threads are involved.
- Per-call resources like sessions should usually be closed explicitly.
- Multi-threaded correctness is often more important than shaving a few lines of code.

If all you remember is this, it’s enough:

If your async app needs to call sync code, `run_in_threadpool` is often the cleanest bridge, but only if the sync code is thread-safe or isolated per call.
