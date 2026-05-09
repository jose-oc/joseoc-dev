---
title: "How to Record Terminal Sessions as SVG with termsvg"
description: "Learn how to use termsvg to capture your terminal sessions and convert them into high-quality, scalable SVG animations for documentation and blogs."
date: "2026-05-09"
tags: ["terminal", "svg", "documentation", "productivity", "cli"]
category: "engineering"
language: "en"
slug: "how-to/recording-terminal-to-svg-with-termsvg"
---

# Record Terminal Sessions as SVG with termsvg

When writing technical documentation, sometimes a static screenshot isn't enough to explain a complex CLI workflow, but a video file is too heavy or requires a dedicated player. 

**termsvg** solves this by capturing your terminal session and converting it into a lightweight, scalable, and beautiful SVG animation that plays directly in any modern web browser.

## 1. Installation

`termsvg` is a Go-based tool. You can install it using `go install`:

```bash
go install github.com/mrmarble/termsvg/cmd/termsvg@latest
```

Ensure your `$GOPATH/bin` is in your `$PATH` so you can run the command from anywhere.

Or using brew for MacOS users
```bash
brew install termsvg
```

## 2. Basic Usage

### 2.1 Record a session

Recording a session is straightforward. Run the command and specify the output filename:

```bash
termsvg rec terminal-recording-$(date +"%Y%m%d_%H%M%S").cast
```

Once you run this command:
1. A new shell session starts.
2. Everything you type and every output generated is recorded.
3. To stop recording, simply type `exit` or press `Ctrl+D`.

### 2.2 Playback

```bash
termsvg play terminal-recording-20260509_110827.cast
```

### 2.3 Convert to SVG

```bash
termsvg export terminal-recording-20260509_110827.cast
```

That generates a file named `terminal-recording-20260509_110827.svg` in the current directory.

## 3. Why Use termsvg?

*   **Scalability**: Being an SVG, you can zoom in infinitely without losing quality.
*   **Searchable**: The text inside the SVG is often selectable and searchable (depending on the viewer).
*   **Lightweight**: Much smaller than a GIF or a video for short terminal snippets.
*   **No Plugins**: Works natively in HTML using a simple `<img>` tag or an `<object>` tag.

---

## Conclusion

<a href="https://github.com/mrmarble/termsvg" target="_blank" rel="noopener noreferrer">termsvg</a> is an essential tool for any DevOps engineer or technical writer who wants to create clear, interactive, and high-performance terminal demonstrations. Give it a try for your next blog post or project README!
