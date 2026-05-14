---
title: "Create and Delegate a Route 53 Hosted Zone for a Subdomain"
description: "Learn how to create a delegated hosted zone in Route 53 for a subdomain, connect it from the parent zone, and add common DNS records with the AWS CLI."
date: "2026-05-14"
tags: ["aws", "route53", "cloud", "devops", "automation"]
category: "engineering"
language: "en"
slug: "create-delegated-subdomain-aws-route53-hosted-zone"
---

When you want a subdomain to be managed independently from its parent domain, a common approach is to create a separate hosted zone in Route 53 and delegate that subdomain to it. This is useful when different teams manage different parts of DNS, when you want clearer ownership boundaries, or when you need to migrate part of a domain without affecting the rest.

In this guide, we will walk through a complete example using the AWS CLI. We will create a delegated hosted zone for `testapp.mydomain.com` under the parent zone `mydomain.com`, add the delegation from the parent zone, and then create a few records inside the child zone: an apex IPv4 record, a regular subdomain IPv4 record, an IPv6 record, and a Route 53 `ALIAS` record.


> [!TIP]
> This guide uses the AWS CLI, but you can follow the same process from the AWS web console if you prefer.

## 1. Find the parent hosted zone ID

We will start by locating the hosted zone ID for the parent domain, `mydomain.com`.

```bash
aws route53 list-hosted-zones-by-name \
  --dns-name mydomain.com \
  --query "HostedZones[?Name == 'mydomain.com.'].Id" \
  --output text
```

This returns something like:

```text
/hostedzone/ZPARENT123456
```

Export it for reuse in the next commands:

```bash
export PARENT_ZONE_ID="ZPARENT123456"
```

## 2. Create the child hosted zone

Next, create the hosted zone for the delegated subdomain `testapp.mydomain.com`.

```bash
aws route53 create-hosted-zone \
  --name testapp.mydomain.com \
  --caller-reference "testapp-mydomain-com-$(date +%Y%m%d%H%M%S)"
```

This command creates the child hosted zone and returns its hosted zone ID together with the Route 53 name servers assigned to it.

If you want to retrieve the hosted zone ID afterward, run:

```bash
aws route53 list-hosted-zones-by-name \
  --dns-name testapp.mydomain.com \
  --query "HostedZones[?Name == 'testapp.mydomain.com.'].Id" \
  --output text
```

Then export it:

```bash
export CHILD_ZONE_ID="ZCHILD123456"
```

## 3. Delegate the child zone from the parent

At this point, the child hosted zone exists, but the parent zone does not yet delegate traffic to it. To connect both zones, first retrieve the child zone name servers:

```bash
aws route53 get-hosted-zone \
  --id "$CHILD_ZONE_ID" \
  --query "DelegationSet.NameServers" \
  --output text
```

Now create a change batch file for the parent zone. Replace the four name servers below with the real ones returned by the previous command.

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

Apply that change to the parent hosted zone:

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id "$PARENT_ZONE_ID" \
  --change-batch file://delegate-testapp.json
```

## 4. Create records inside the child zone

With delegation in place, the child hosted zone can now hold the records for `testapp.mydomain.com` and anything below it.

In this example, we will create:

- an apex `A` record for `testapp.mydomain.com`
- an `A` record for `ipv4example.testapp.mydomain.com`
- an `AAAA` record for `ipv4example.testapp.mydomain.com`

Create a change batch file like this:

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

Apply the records to the child hosted zone:

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id "$CHILD_ZONE_ID" \
  --change-batch file://child-records.json
```

## 5. Add a Route 53 `ALIAS` record

A Route 53 `ALIAS` record is useful when you want a DNS name to point to another AWS-managed resource, such as:

- an Application Load Balancer
- a Network Load Balancer
- a CloudFront distribution
- an S3 website endpoint, where supported

Here is an example that points `alias.testapp.mydomain.com` to an Application Load Balancer:

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

Apply it with:

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id "$CHILD_ZONE_ID" \
  --change-batch file://child-alias.json
```

Replace these values with the real details of your AWS target:

- `HostedZoneId`
- `DNSName`

## 6. Verify the result

Once the changes have propagated, you can verify both the delegation and the records with `dig`:

```bash
dig testapp.mydomain.com NS
dig testapp.mydomain.com A
dig ipv4example.testapp.mydomain.com A
dig ipv4example.testapp.mydomain.com AAAA
dig alias.testapp.mydomain.com A
```

## Notes

> [!WARNING]
> Do not create a `CNAME` at the apex `testapp.mydomain.com`, because the apex already needs `NS` and `SOA` records, and DNS does not allow a `CNAME` there.

A few details are worth keeping in mind as you work through this process:

- The `NS` record for `testapp.mydomain.com` belongs in the parent zone `mydomain.com`.
- The `A`, `AAAA`, and `ALIAS` records belong in the child zone `testapp.mydomain.com`.
- A trailing dot in names such as `testapp.mydomain.com.` indicates a fully qualified domain name (FQDN).
- Writing the trailing dot is a good habit because it removes ambiguity and makes it clear that the name is absolute from the DNS root.
