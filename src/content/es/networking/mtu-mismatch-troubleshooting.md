---
title: "MTU distinta: conecta bien y se cuelga al mover datos"
description: "Los errores de red intermitentes que solo aparecen con paquetes grandes suelen indicar una MTU distinta en algún tramo del camino. Qué es la MTU, cómo funciona Path MTU Discovery, cómo diagnosticarla con ping y tcpdump, y cómo arreglarla."
date: "2026-11-19"
tags: ["networking", "mtu", "troubleshooting", "linux", "devops"]
category: "engineering"
language: "es"
slug: "networking/mtu-mismatch-troubleshooting"
draft: false
---

En nuestros datacenters nos encontramos errores de conexión entre servidores difíciles de explicar: unas conexiones funcionaban y otras se quedaban colgadas sin motivo aparente. Uno de los sospechosos era valores de MTU distinta entre servidores y puertos del switch. 
Me di cuenta de que no entendía del todo cómo funciona la MTU, así que me puse a aprenderlo y en este artículo dejo escrito lo que aprendí: qué es la MTU, qué pasa de verdad cuando los dos extremos del camino no coinciden, cómo diagnosticar el problema con herramientas que ya tienes y cómo se arregla.

## El síntoma

Un problema de MTU tiene una firma muy reconocible: los paquetes pequeños pasan y los grandes no.

- `ping` funciona, porque sus paquetes por defecto son pequeños.
- SSH conecta, pero se congela en cuanto algo saca mucho texto por pantalla, como un listado largo o un `cat` de un archivo grande.
- Las negociaciones TLS se quedan a medias y las páginas HTTPS no terminan de cargar.
- Las transferencias arrancan bien y mueren a los pocos kilobytes.

Los errores parecen aleatorios e intermitentes porque dependen del tamaño del paquete, no de la hora ni de la carga. Si ese patrón te suena, la MTU merece un puesto en la lista de sospechosos. Otros fallos producen síntomas parecidos (una tarjeta de red defectuosa, congestión), así que la idea no es dar nada por hecho: es medir.

## Qué es la MTU

La MTU (unidad máxima de transmisión, del inglés *Maximum Transmission Unit*) es el paquete más grande que una interfaz envía de una vez. En Ethernet, el estándar (IEEE 802.3) lo fija en 1500 bytes, y ése es el valor por defecto en casi todas partes.

Una analogía útil: el límite de altura de los puentes de una carretera. Un camión más alto que el puente más bajo de su ruta no pasa, aunque todos los puentes de su ciudad sean altos. Tu servidor puede tener una MTU perfectamente válida y fallar igualmente porque algún tramo del camino es más bajo.

Valores típicos:

| MTU | Dónde aparece |
| --- | --- |
| 1500 | Ethernet estándar, el valor por defecto |
| 9000 | Tramas gigantes (*jumbo frames*), habituales en redes de datacenter y almacenamiento |
| ~1450 | Overlays y túneles (VXLAN, algunas redes de nube), por las cabeceras extra |
| 1280 | Mínimo obligatorio en IPv6 (RFC 8200) |

## Qué pasa cuando no coincide

IPv4 permite fragmentar los paquetes por el camino, salvo cuando llevan activado el bit DF (del inglés *Don't Fragment*, no fragmentar), habitual en TCP con PMTUD. Si el paquete supera la MTU del siguiente enlace y lleva DF, el router no puede trocearlo: lo descarta y debe enviar al emisor un mensaje ICMP *Fragmentation Needed*.

ICMP identifica sus mensajes con un **tipo** y un **código**. En IPv4, el tipo **3** significa *Destination Unreachable* (destino inalcanzable); el código **4** concreta el motivo: hace falta fragmentar, pero el bit DF lo impide. No significa que el servidor de destino esté apagado: ese paquete no puede continuar en esas condiciones.

Según el [RFC 1191, sección 4](https://www.rfc-editor.org/rfc/rfc1191#section-4), el aviso incluye el campo *Next-Hop MTU*: la MTU del enlace de salida por el que ese router no pudo reenviar el paquete. **No es la MTU configurada en el receptor final**, ni garantiza que no haya otro enlace aún menor más adelante. El valor cuenta el paquete IP completo, incluida su cabecera, no solo los datos de TCP.

Por ejemplo: un servidor envía un paquete IP de 1500 bytes con DF. Un router intermedio tiene que reenviarlo por un enlace con MTU 1400. Lo descarta y comunica **1400** al emisor, aunque el receptor tenga configurada una MTU de 1500. Si el aviso llega, el emisor reduce su estimación de la MTU para ese destino y, en TCP, retransmite los datos en paquetes menores. Ese mecanismo es el descubrimiento de MTU de ruta (*Path MTU Discovery*, PMTUD).

El router **debe** enviar el aviso según el protocolo; eso no garantiza que el emisor lo reciba. Un fallo de implementación o configuración puede impedir que se genere, y un firewall puede filtrarlo por el camino. Por eso conviene distinguir lo que exige el protocolo de lo que ocurre en la práctica.

```mermaid
flowchart TD
    A["El servidor envía un paquete de 1500 bytes"] --> B{"¿Cabe en la MTU del siguiente tramo?"}
    B -->|"Sí"| C["Llega a destino"]
    B -->|"No, y lleva el bit DF"| D["El router lo descarta"]
    D --> E{"¿Vuelve el ICMP Fragmentation Needed?"}
    E -->|"Sí"| F["El emisor baja el tamaño y reintenta (PMTUD)"]
    E -->|"Filtrado"| G["Agujero negro: retransmite hasta agotar el tiempo"]
```

Cuando los avisos llegan y PMTUD funciona, el emisor adapta el tamaño y la conexión puede continuar. Puede necesitar varios ajustes si hay enlaces con MTU cada vez menor a lo largo de la ruta.

## El agujero negro del ICMP

El modo de fallo detrás de los síntomas raros es el agujero negro (*black hole*): un firewall o filtro en el camino descarta el tráfico ICMP, así que el aviso de *Fragmentation Needed* nunca llega al emisor. Éste retransmite el paquete a tamaño completo hasta que la conexión agota el tiempo de espera. Los paquetes pequeños pasan y los grandes desaparecen sin explicación. Es exactamente la firma del primer apartado.

Los culpables habituales son los firewalls excesivamente estrictos: bloquear todo el ICMP entrante rompe PMTUD, que depende de él. Cloudflare tiene un buen artículo sobre cómo se da esto en la práctica (enlazado en las referencias), y es un tema recurrente en despliegues de VPN y túneles, donde la sobrecarga del túnel reduce la MTU efectiva por debajo de lo que los extremos asumen.

## Jumbo frames y la regla del dominio L2

Las tramas gigantes (*jumbo frames*, normalmente de 9000 bytes) son habituales en redes de datacenter, porque los paquetes más grandes reducen la sobrecarga por paquete en el tráfico de almacenamiento y replicación. Aquí importan dos cosas:

- 9000 es una convención, no un estándar. Cada equipo elige su propio máximo y no todos coinciden.
- Todo el dominio de layer 2 (dominio L2) debe ir al mismo valor: cada servidor, puerto de switch y VLAN del camino necesita la misma MTU.

Si un servidor configurado a 9000 habla con un puerto de switch configurado a 1500, las tramas grandes se descartan en silencio en layer 2. No hay aviso ICMP ni PMTUD, porque un switch no enruta, no fragmenta ni envía errores: simplemente tira lo que no cabe. Es la variante más traicionera del problema, porque nada en los logs la explica.

## Diagnóstico paso a paso

1. Mira la MTU de cada interfaz, en los dos extremos: `ip link show`.
2. Mide la MTU real de la ruta con `ping -M do -s 1472 <destino>`. `-M do` activa el bit DF y `-s 1472` es el tamaño de los datos; 1472 de datos + 20 bytes de cabecera IP + 8 bytes de cabecera ICMP = 1500. Si pasa, la ruta admite 1500. Si no, baja el valor hasta que pase: el mayor valor que funciona más 28 es la MTU de la ruta.
3. `tracepath <destino>` muestra la MTU de la ruta directamente y a menudo el salto donde cambia.
4. Prueba en los dos sentidos. Arreglar uno no arregla el otro.
5. Interpreta los resultados. Un error `message too long, mtu=X` es buena noticia: PMTUD funciona y X te da el límite. El silencio total significa que algo filtra ICMP.
6. Comprueba si los avisos llegan siquiera: `sudo tcpdump -ni <interfaz> icmp` mientras lanzas los pings grandes.
7. En switches gestionables, revisa la MTU por puerto y por VLAN y los contadores de descartes, que es donde se ven las caídas silenciosas de layer 2.

| Comando | Qué te dice |
| --- | --- |
| `ip link show` | La MTU configurada en cada interfaz |
| `ping -M do -s 1472 <destino>` | Si la ruta admite paquetes de 1500 bytes sin fragmentar |
| `tracepath <destino>` | La MTU descubierta de la ruta y el salto donde baja |
| `sudo tcpdump -ni <interfaz> icmp` | Si los avisos ICMP de fragmentación llegan de verdad |

## Cómo se arregla

- **Alinea la MTU en todo el camino.** Éste es el arreglo correcto. Si activas jumbo frames, pon el mismo valor en cada equipo del dominio L2.
- **Baja la MTU en el extremo** cuando no controlas el camino: `ip link set dev <interfaz> mtu 1450`, y hazlo persistente en la configuración de red. Ten en cuenta que esto arregla un sentido en un equipo.
- **Activa PLPMTUD como red de seguridad**: define `net.ipv4.tcp_mtu_probing=1` (RFC 4821). TCP sondea entonces un tamaño que funcione por su cuenta cuando los paquetes se pierden, sin depender de ICMP. El valor `1` sondea solo cuando se sospecha un agujero negro; `2` sondea siempre. La [documentación de ip-sysctl del kernel](https://www.kernel.org/doc/html/latest/networking/ip-sysctl.html) describe ambos.
- **Limitación del MSS (*MSS clamping*) en el router o firewall**: reescribe la opción MSS de las conexiones TCP que pasan para que nunca intenten paquetes más grandes de lo que la ruta admite (por ejemplo con el objetivo `TCPMSS` de iptables y `--clamp-mss-to-pmtu`). Funciona, pero es un parche que oculta el desajuste en lugar de arreglarlo.

> [!WARNING]
> Cambies lo que cambies, prueba después en los dos sentidos. Una ruta que funciona de A a B puede seguir rota de B a A.

## Nota sobre Kubernetes

Una **red superpuesta (*overlay*)** es una red virtual construida sobre otra red que transporta sus paquetes, la **red subyacente (*underlay*)**. En una overlay basada en túneles, los nodos meten el tráfico original dentro de otros paquetes para cruzar la underlay y lo extraen al llegar al otro extremo. Es como meter una carta dentro de otro sobre: el envoltorio también ocupa sitio.

VXLAN es un ejemplo: transporta tramas Ethernet dentro de paquetes UDP/IP. En Kubernetes, flannel en modo VXLAN puede usarlo para conectar pods de nodos distintos sobre la red que une esos nodos. No todas las redes de Kubernetes usan una overlay; depende del plugin y del modo de red elegidos.

La encapsulación reduce el espacio disponible para el paquete interior. En el caso habitual de VXLAN sobre IPv4, sin opciones IP ni etiquetas VLAN interiores, la diferencia es de **50 bytes**: 20 de IP exterior + 8 de UDP + 8 de VXLAN + 14 de Ethernet interior. Así, una underlay con MTU IP de **1500** permite una MTU IP interior de **1450**. No es una constante de todas las overlays: otras encapsulaciones o una underlay IPv6 cambian la cuenta.

Compara `ip link show` en el nodo y dentro de un pod para ver ambos valores. La MTU del pod debe dejar espacio para la encapsulación en el camino entre nodos; si no, pueden aparecer pérdidas de paquetes grandes entre pods de nodos distintos.

## Glosario

- **MTU (unidad máxima de transmisión)**: el paquete más grande que una interfaz envía de una vez. 1500 bytes en Ethernet estándar.
- **DF (*Don't Fragment*)**: bit de la cabecera IPv4 que prohíbe a los routers trocear el paquete. El tráfico TCP casi siempre lo lleva.
- **ICMP**: protocolo que usan los equipos de red para notificar errores, incluidos los avisos de *Fragmentation Needed*.
- **Descubrimiento de MTU de ruta (*Path MTU Discovery*, PMTUD)**: mecanismo (RFC 1191) por el que el emisor aprende la MTU más pequeña del camino a partir de los avisos ICMP y baja el tamaño de sus paquetes.
- **Agujero negro (*black hole*)**: ruta donde los avisos ICMP se filtran, de modo que el emisor nunca sabe por qué desaparecen sus paquetes grandes.
- **Tramas gigantes (*jumbo frames*)**: tramas Ethernet más grandes que los 1500 bytes estándar, normalmente de 9000. Una convención, no un estándar; todo el dominio L2 debe coincidir.
- **Dominio de layer 2 (dominio L2)**: el conjunto de equipos y puertos conectados a nivel Ethernet (switches, VLAN, puertos de servidor) sin enrutado intermedio.
- **Limitación del MSS (*MSS clamping*)**: reescritura de la opción de tamaño máximo de segmento de TCP en tránsito, para que las conexiones no intenten paquetes demasiado grandes.
- **Overlay / underlay**: red virtual superpuesta y red subyacente que la transporta. En una overlay basada en túneles, la encapsulación ocupa parte de la MTU disponible.
- **VXLAN**: protocolo que transporta tramas Ethernet sobre UDP/IP. Con IPv4 y sin opciones ni etiquetas VLAN interiores, reduce en 50 bytes la MTU IP disponible para el paquete interior.

## Resumen

- La firma de una MTU distinta es inconfundible: los paquetes pequeños pasan y los grandes se cuelgan. El SSH que conecta y luego se congela es el caso clásico.
- PMTUD depende de que los avisos ICMP *Fragmentation Needed* vuelvan. Si un firewall los filtra, la ruta se convierte en un agujero negro y las conexiones se cuelgan sin explicación.
- Los jumbo frames son todo o nada: todos los equipos del dominio L2 deben compartir la misma MTU, o las tramas grandes mueren en silencio en el switch.
- Diagnostica midiendo, no suponiendo: `ping -M do -s 1472`, `tracepath`, en los dos sentidos, y `tcpdump` para ver si los avisos ICMP llegan.
- El arreglo de verdad es alinear la MTU a lo largo del camino; `net.ipv4.tcp_mtu_probing=1` es una buena red de seguridad mientras llegas.

## Referencias

- [RFC 1191: Path MTU Discovery](https://www.rfc-editor.org/rfc/rfc1191.html)
- [RFC 2923: TCP Problems with Path MTU Discovery, section 2.1](https://www.rfc-editor.org/rfc/rfc2923#section-2.1)
- [RFC 7348: VXLAN, sections 3 and 5](https://www.rfc-editor.org/rfc/rfc7348)
- [RFC 4821: Packetization Layer Path MTU Discovery](https://www.rfc-editor.org/rfc/rfc4821.html)
- [RFC 8200: IPv6 (MTU mínima de 1280 bytes)](https://www.rfc-editor.org/rfc/rfc8200.html)
- [Cloudflare: Path MTU Discovery in practice](https://blog.cloudflare.com/path-mtu-discovery-in-practice/)
- [Hetzner Docs: MTU troubleshooting](https://docs.hetzner.com/networking/networks/troubleshooting/mtu/)
- [NETGEAR: Guidance on the use of jumbo frames](https://kb.netgear.com/25091/Guidance-on-the-use-of-jumbo-frames)
- [flannel issue #1775: setting MTU in kube-flannel.yml](https://github.com/flannel-io/flannel/issues/1775)
- [Kernel de Linux: documentación de ip-sysctl (`tcp_mtu_probing`)](https://www.kernel.org/doc/html/latest/networking/ip-sysctl.html)
