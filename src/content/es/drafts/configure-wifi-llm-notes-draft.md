---
draft: true
---

Configurar una red limpia, segura y rápida en un Mac recién estrenado es una muy buena práctica. macOS trae herramientas de red muy buenas, pero unos pocos ajustes adicionales pueden mejorar bastante tu privacidad, seguridad y velocidad.

Aquí tienes una guía recomendada paso a paso para configurar la red, ordenada desde lo más básico hasta lo más avanzado.

---

### Paso 1: reforzar tu conexión Wi-Fi
Ya que mencionaste el acceso Wi-Fi privado, macOS tiene una función excelente aunque algo escondida.

**Activar "Private Wi-Fi Address" (aleatorización de MAC):**
Por defecto, tu Mac difunde un identificador único de hardware, la dirección MAC, a cada router al que se conecta. Eso permite a sitios como aeropuertos, cafeterías o centros comerciales seguir tus movimientos físicos.
1. Ve a **System Settings > Wi-Fi**.
2. Haz clic en **Details** junto a la red conectada.
3. Asegúrate de que **Private Wi-Fi Address** está activado.
4. *Nota: haz esto para cada red que guardes. Si una red deja de funcionar al activarlo, significa que el router usa filtrado MAC antiguo y puedes desactivarlo solo para esa red concreta.*

### Paso 2: configurar DNS modernos y privados
Tienes dos opciones principales: usar DNS públicos cifrados o usar tu propio DNS a través de la VPN, como el `100.100.1.1` de Pi-hole que vimos antes.

**Opción A: DNS públicos cifrados (lo mejor si no tienes un Pi-hole)**
El DNS estándar se envía en texto plano. Usa DNS-over-HTTPS (DoH) para evitar que tu ISP vea tus consultas DNS.
1. Ve a **System Settings > Network > Wi-Fi (or Ethernet) > Details > DNS**.
2. Elimina cualquier DNS del ISP que aparezca por defecto en "DNS Servers".
3. Añade las IP de tu DNS cifrado preferido:
   * **Cloudflare (rápido y privado):** `1.1.1.1` y `1.0.0.1`
   * **Quad9 (seguro y bloquea malware):** `9.9.9.9` y `149.112.112.112`
4. *(Paso importante)*: justo debajo de las cajas de DNS hay un desplegable que probablemente diga "Default". Cámbialo a **"Cloudflare, Inc."** o **"Quad9"**. Eso le indica a macOS que cifre la conexión a esas IP usando HTTPS.

**Opción B: tu DNS de VPN/Pi-hole**
Si tienes un montaje con WireGuard o Tailscale y un Pi-hole, como tu `100.100.1.1`, deja la configuración DNS de macOS en "Default". En su lugar, configura tu app VPN para que envíe esos servidores DNS `100.x.x.x` al Mac cuando se conecte. Así usarás tu bloqueador de anuncios en casa y volverás a un DNS estándar cuando estés fuera de la VPN.

### Paso 3: configurar clientes SSH y VPN con una base limpia
Como es un Mac nuevo, conviene asegurarse de que servicios como SSH y las VPN quedan bien aislados.

**Evitar que SSH se quede colgado en redes malas:**
Si usas SSH a menudo, por ejemplo para conectarte a tu `raspi`, añade esto a `~/.ssh/config`. Así evitarás que la terminal se quede congelada indefinidamente si un servidor desaparece:
```text
Host *
  ServerAliveInterval 60
  ServerAliveCountMax 3
  AddKeysToAgent yes
  UseKeychain yes
```

**Resolver conflictos del firewall de macOS con VPNs:**
Cuando instalas apps de VPN como WireGuard, Tailscale o ZeroTier, macOS a veces se confunde con los firewalls solapados.
1. Ve a **System Settings > Network > Firewall**.
2. Apágalo.
3. Instala y configura tus aplicaciones VPN.
4. Vuelve a encender el firewall de macOS y, dentro de **Options...**, asegúrate de que "Stealth Mode" está activo.

### Paso 4: bloquear el acceso de red en segundo plano
Las apps de macOS tienden a "llamar a casa" en segundo plano. Puedes limitarlo sin instalar software de terceros usando una herramienta integrada de terminal llamada `cfctl`, que forma parte del framework `NetworkExtension` de Apple.

1. Abre tu terminal.
2. Ejecuta `sudo cfctl` para ver una lista de reglas integradas.
3. Puedes bloquear cierta telemetría de Apple para que no salga a Internet con comandos como:
   ```bash
   sudo cfctl rule add block outgoing tcp any any app /System/Library/PrivateFrameworks/AssistantServices.framework/Versions/A/Support/assistantd
   ```
*(Nota: si esto te parece demasiado avanzado, una alternativa con interfaz gráfica muy respetada y open source para Mac es **LuLu** de Objective-See, que te deja pulsar "Allow" o "Deny" cuando una app intenta conectarse por primera vez).*

### Paso 5: activar "Lockdown Mode" si eres un objetivo de alto valor
Si usas este Mac para trabajo sensible de desarrollo, periodismo o simplemente quieres la máxima seguridad posible:
1. Ve a **System Settings > Privacy & Security**.
2. Baja hasta el final y activa **Lockdown Mode**.
3. *Advertencia:* esto limita de forma estricta las funciones de red que usará tu Mac. Bloquea solicitudes de conexión entrantes, incluso cosas como AirDrop o servidores locales para desarrollo, elimina imágenes de páginas web y desactiva parte del agent forwarding de SSH. Úsalo solo si valoras la seguridad extrema por encima de la comodidad.

### Checklist resumida para un power user "normal"
* [x] Wi-Fi Details -> Private Wi-Fi Address: **On**
* [x] DNS Servers configurados como `1.1.1.1`, `1.0.0.1` o `9.9.9.9` con el desplegable HTTPS seleccionado.
* [x] Firewall de macOS: **On**, con Stealth Mode activado.
* [x] `~/.ssh/config` actualizado con `ServerAliveInterval` y rutas `IdentityFile` correctas.
* [x] Deja el DNS `100.100.1.1` como está; que lo gestione tu app VPN.

### ¿Qué ajuste de Private Wi-Fi Address es mejor?

**Respuesta corta:** usa **Rotating**.

Aquí tienes la diferencia entre las tres opciones:

* **Off:** tu Mac usa su dirección MAC real y permanente. Eso hace muy fácil que tiendas, aeropuertos y anunciantes sepan exactamente cuándo llegas, por dónde te mueves y cuándo te vas. *(No lo uses salvo que una red corporativa antigua y muy rígida te obligue).*
* **Fixed:** tu Mac genera una dirección MAC falsa la primera vez que se conecta a una red Wi-Fi concreta. Después usará siempre esa misma dirección falsa en esa red. Esto evita el seguimiento entre redes distintas, pero ese aeropuerto seguirá sabiendo que eres tú cada vez que vuelves.
* **Rotating:** tu Mac genera una dirección MAC falsa, pero la cambia periódicamente, normalmente cada pocas horas o días mientras estás conectado, y seguro cada vez que desconectas y vuelves a conectarte.

**Por qué gana Rotating:**
Es la opción con más privacidad. Evita tanto el seguimiento entre redes como el seguimiento longitudinal dentro de un mismo lugar a lo largo del tiempo.

*La única razón para usar "Fixed" es si estás en una red con portal cautivo, como el Wi-Fi de un hotel donde tienes que aceptar condiciones en una página web y cambiar la MAC te obliga a repetir ese proceso una y otra vez. En tu red de casa, "Rotating" suele funcionar perfectamente.*

---

### ¿Qué es "Stealth Mode"? Explicación sencilla

Normalmente, cuando otro ordenador o dispositivo en Internet "llama a la puerta" de tu Mac para ver si está ahí, tu Mac está programado para responder educadamente: *"Sí, aquí estoy".*

Aunque el firewall esté activado y bloquee la entrada, el Mac sigue contestando. Los atacantes usan herramientas automáticas para llamar a millones de puertas. Si escuchan que tu Mac responde, toman nota de tu dirección y empiezan a buscar una forma de entrar.

**Stealth Mode simplemente le dice a tu Mac que ignore por completo esa llamada a la puerta.**

Si un atacante o escáner llama mientras Stealth Mode está activado, tu Mac se queda totalmente en silencio. El atacante asume que no hay nadie en casa y pasa al siguiente objetivo. Hace que tu Mac sea prácticamente invisible para escáneres aleatorios de Internet.

*(Nota: Stealth Mode no afecta a tu navegación normal, a las descargas ni a las conexiones salientes que tú inicies hacia otros equipos. Solo ignora "pings" entrantes aleatorios y no solicitados).*
