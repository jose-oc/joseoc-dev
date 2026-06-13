---
title: "Why You Need a security.txt File on Your Website"
description: "An introduction to the RFC 9116 security.txt standard, how it helps researchers report vulnerabilities, and the contact options you can use."
date: "2026-06-13"
tags: ["security", "web-standards", "github", "web-best-practices"]
category: "engineering"
language: "en"
slug: "how-to/security-txt"
draft: false
---

A few days ago, I was auditing my website against standard web specifications, and I ran into a recommendation I had never heard of: adding a `security.txt` file at `/.well-known/security.txt`. 

My first reaction was: *What is this, and why do I need it?*

If you are running a simple website—especially a static one like a portfolio or a documentation project—security might feel like something you only need to worry about if you have a database or user logins. But web standards evolve, and having a standardized way for people to reach you about security flaws has become a recommended practice.

Here is a plain-English guide to what `security.txt` is, why it matters, and how to set it up without exposing your personal email to spammers.

---

## What is `security.txt`?

At its core, `security.txt` is a simple text file served at a predictable location on your website: `https://yourdomain.com/.well-known/security.txt`. 

It is defined by **RFC 9116** (an official internet standard) and its purpose is simple: to tell security researchers, white-hat hackers, and users exactly how to report security vulnerabilities they find on your site.

Instead of a researcher having to search your site for a contact form, hunt for you on social media, or guess your email address, they can just fetch this text file and get your preferred contact details instantly.

---

## Why It Matters: The "Responsible Disclosure" Flow

If a security researcher finds a vulnerability on your website, they generally want to report it to you privately so you can fix it. This is called **responsible disclosure**.

If you don't have a clear way to contact you:
*   A researcher might get frustrated and publish the exploit online immediately so you're forced to notice.
*   They might try to scrape your site for any email address they can find.
*   They might simply give up, leaving your site vulnerable to malicious actors.

By having a `security.txt` file, you show that you care about security and give researchers a clear, frictionless path to report issues to you in private.

---

## The Big Dilemma: Exposing Your Personal Email

When people read the `security.txt` specification, the most common setup they see looks like this:

```txt
Contact: mailto:security@example.com
```

If you own a company with a dedicated security team and an inbox like `security@company.com`, this is perfect. But if this is a personal project or a static portfolio site, you probably don't have a custom domain email set up. 

If you put your personal email in `security.txt`, you face two immediate risks:
1.  **Spam**: Automated spambots constantly crawl the web looking for `.well-known/security.txt` files to scrape email addresses. Your personal inbox will likely end up on spam databases.
2.  **Privacy**: Anyone visiting your site can easily read your personal email address.

Fortunately, the specification doesn't require you to use an email. You have several other contact options.

---

## The Contact Options: Emails, Forms, and GitHub

The `Contact` field in a `security.txt` file can be an email address (prefixed with `mailto:`) or a web URL (prefixed with `https://`). Here is how the different options compare:

### 1. Dedicated Email Alias (Good)
If you want to use email but keep your personal inbox clean, you can use a masked email or an email alias (e.g., using iCloud's *Hide My Email*, Firefox Relay, or a dedicated alias like `yourname-security@outlook.com`). If the alias starts getting spammed, you can simply delete or filter it without affecting your main email.

### 2. A Web Contact Form (Better)
If you already have a contact form or a support portal, you can link directly to it:

```txt
Contact: https://yourdomain.com/contact
```

This keeps your email address hidden from scrapers while still allowing researchers to reach you through your site.

### 3. GitHub Private Vulnerability Reporting (Best for Open Source)
If your website's source code is hosted on GitHub as a public repository, you can enable a built-in feature called **Private Vulnerability Reporting** in your repository's security settings.

This allows researchers to submit security advisories privately directly to your repository. They can describe the bug, and you can collaborate with them in a private draft advisory to fix it before publishing it. 

You can link directly to this reporting page in your `security.txt`:

```txt
Contact: https://github.com/your-username/your-repo/security/advisories/new
```

This is the cleanest option: it requires no email address configuration, keeps your inbox spam-free, and handles security reports in a structured, developer-friendly way.

---

## How to Implement `security.txt`

If you decide to add one, here is how to set it up:

1.  Create a folder named `.well-known` inside your site's public static assets directory (in Astro, this is the `public/` folder).
2.  Inside it, create a text file named `security.txt`.
3.  Add the standard fields:

```txt
Contact: https://github.com/your-username/your-repo/security/advisories/new
Expires: 2027-06-12T23:59:59.000Z
Preferred-Languages: en, es
Canonical: https://www.yourdomain.com/.well-known/security.txt
```

> [!IMPORTANT]
> The `Expires` field is **required** by the RFC specification. It tells crawlers when the contact information should no longer be trusted. You should set this to a date in the future (usually up to one year) and remember to update it annually.

---

## What if You Don't Want to Publish One?

If your website is a simple, static site with no dynamic back-end, the security risks are already very low. If you do not want to set up an alias or make your repository public, **it is better to omit the `security.txt` file entirely** rather than publishing a fake or non-existent email address. 

A non-functional contact link is worse than no contact link at all, as it wastes researchers' time and defeats the purpose of the specification.
