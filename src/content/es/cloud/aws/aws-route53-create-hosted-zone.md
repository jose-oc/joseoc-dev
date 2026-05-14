---
title: "Crear y delegar una zona hospedada de Route 53 para un subdominio"
description: "Aprende a crear una zona hospedada delegada en Route 53 para un subdominio, enlazarla desde la zona padre y añadir registros DNS con AWS CLI."
date: "2026-05-14"
tags: ["aws", "route53", "cloud", "devops", "automation"]
category: "engineering"
language: "es"
slug: "create-delegated-subdomain-aws-route53-hosted-zone"
---

Cuando quieres que un subdominio se gestione de forma independiente de su dominio padre, una opción habitual es crear una zona hospedada separada en Route 53 y delegar ese subdominio hacia ella. Esto resulta útil cuando distintos equipos administran diferentes partes del DNS, cuando quieres límites de responsabilidad más claros o cuando necesitas migrar una parte de un dominio sin afectar al resto.

En esta guía vamos a recorrer un ejemplo completo usando AWS CLI. Crearemos una zona hospedada delegada para `testapp.mydomain.com` bajo la zona padre `mydomain.com`, añadiremos la delegación desde la zona padre y después crearemos varios registros dentro de la zona hija: un registro IPv4 en el apex, un registro IPv4 para un subdominio normal, un registro IPv6 y un registro `ALIAS` de Route 53.


> [!TIP]
> Esta guía usa AWS CLI, pero puedes seguir el mismo proceso desde la consola web de AWS si lo prefieres.

## 1. Encontrar el ID de la zona hospedada padre

Empezaremos localizando el ID de la zona hospedada del dominio padre, `mydomain.com`.

```bash
aws route53 list-hosted-zones-by-name \
  --dns-name mydomain.com \
  --query "HostedZones[?Name == 'mydomain.com.'].Id" \
  --output text
```

Esto devuelve algo parecido a:

```text
/hostedzone/ZPARENT123456
```

Expórtalo para reutilizarlo en los siguientes comandos:

```bash
export PARENT_ZONE_ID="ZPARENT123456"
```

## 2. Crear la zona hospedada hija

A continuación, crea la zona hospedada para el subdominio delegado `testapp.mydomain.com`.

```bash
aws route53 create-hosted-zone \
  --name testapp.mydomain.com \
  --caller-reference "testapp-mydomain-com-$(date +%Y%m%d%H%M%S)"
```

Este comando crea la zona hospedada hija y devuelve su ID junto con los servidores de nombres que Route 53 le asigna.

Si quieres recuperar después el ID de la zona hospedada, ejecuta:

```bash
aws route53 list-hosted-zones-by-name \
  --dns-name testapp.mydomain.com \
  --query "HostedZones[?Name == 'testapp.mydomain.com.'].Id" \
  --output text
```

Después expórtalo:

```bash
export CHILD_ZONE_ID="ZCHILD123456"
```

## 3. Delegar la zona hija desde la zona padre

En este punto la zona hospedada hija ya existe, pero la zona padre todavía no delega tráfico hacia ella. Para conectar ambas zonas, primero obtén los servidores de nombres de la zona hija:

```bash
aws route53 get-hosted-zone \
  --id "$CHILD_ZONE_ID" \
  --query "DelegationSet.NameServers" \
  --output text
```

Ahora crea un archivo de change batch para la zona padre. Sustituye los cuatro servidores de nombres de abajo por los valores reales devueltos por el comando anterior.

`delegate-testapp.json`
```json
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "testapp.mydomain.com.",
        "Type": "NS",
        "TTL": 300,
        "ResourceRecords": [
          { "Value": "ns-123.awsdns-11.com." },
          { "Value": "ns-456.awsdns-22.net." },
          { "Value": "ns-789.awsdns-33.org." },
          { "Value": "ns-101.awsdns-44.co.uk." }
        ]
      }
    }
  ]
}
```

Aplica ese cambio sobre la zona hospedada padre:

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id "$PARENT_ZONE_ID" \
  --change-batch file://delegate-testapp.json
```

## 4. Crear registros dentro de la zona hija

Con la delegación ya hecha, la zona hospedada hija puede contener los registros de `testapp.mydomain.com` y de cualquier nombre que cuelgue por debajo.

En este ejemplo vamos a crear:

- un registro `A` en el apex para `testapp.mydomain.com`
- un registro `A` para `ipv4example.testapp.mydomain.com`
- un registro `AAAA` para `ipv4example.testapp.mydomain.com`

Crea un archivo de change batch como este:

`child-records.json`
```json
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "testapp.mydomain.com.",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [
          { "Value": "203.0.113.10" }
        ]
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "ipv4example.testapp.mydomain.com.",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [
          { "Value": "203.0.113.20" }
        ]
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "ipv4example.testapp.mydomain.com.",
        "Type": "AAAA",
        "TTL": 300,
        "ResourceRecords": [
          { "Value": "2001:db8::20" }
        ]
      }
    }
  ]
}
```

Aplica los registros en la zona hospedada hija:

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id "$CHILD_ZONE_ID" \
  --change-batch file://child-records.json
```

## 5. Añadir un registro `ALIAS` de Route 53

Un registro `ALIAS` de Route 53 es útil cuando quieres que un nombre DNS apunte a otro recurso gestionado por AWS, por ejemplo:

- un Application Load Balancer
- un Network Load Balancer
- una distribución de CloudFront
- un endpoint web de S3, cuando esté soportado

Aquí tienes un ejemplo que hace que `alias.testapp.mydomain.com` apunte a un Application Load Balancer:

`child-alias.json`
```json
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "alias.testapp.mydomain.com.",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z35SXDOTRQ7X7K",
          "DNSName": "internal-my-alb-123456.eu-west-1.elb.amazonaws.com.",
          "EvaluateTargetHealth": false
        }
      }
    }
  ]
}
```

Aplícalo con:

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id "$CHILD_ZONE_ID" \
  --change-batch file://child-alias.json
```

Sustituye estos valores por los datos reales de tu recurso en AWS:

- `HostedZoneId`
- `DNSName`

## 6. Verificar el resultado

Una vez que los cambios se hayan propagado, puedes verificar tanto la delegación como los registros con `dig`:

```bash
dig testapp.mydomain.com NS
dig testapp.mydomain.com A
dig ipv4example.testapp.mydomain.com A
dig ipv4example.testapp.mydomain.com AAAA
dig alias.testapp.mydomain.com A
```

## Notas

> [!WARNING]
> No crees un `CNAME` en el apex `testapp.mydomain.com`, porque el apex ya necesita registros `NS` y `SOA`, y DNS no permite un `CNAME` en ese punto.

Hay algunos detalles que conviene tener presentes durante este proceso:

- El registro `NS` de `testapp.mydomain.com` pertenece a la zona padre `mydomain.com`.
- Los registros `A`, `AAAA` y `ALIAS` pertenecen a la zona hija `testapp.mydomain.com`.
- Un punto final en nombres como `testapp.mydomain.com.` indica que se trata de un nombre de dominio completamente cualificado (FQDN, por sus siglas en Inglés: Fully Qualified Domain Name).
- Es una buena práctica escribir ese punto final porque elimina ambigüedades y deja claro que el nombre es absoluto desde la raíz DNS.
