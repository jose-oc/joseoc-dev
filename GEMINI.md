# Project Brief: High-Performance Multilingual IT Documentation Site

## 1. Core Objective
Develop a modern, static documentation and personal brand website using Astro. The site must serve as a professional IT knowledge base while allowing for personal blog posts, optimized for both human readability and LLM consumption.

## 2. Technical Stack
- **Framework**: Astro (Latest Stable)
- **Content Strategy**: Markdown/MDX using Astro Content Collections.
- **I18n**: Sub-path routing (e.g., /en/ and /es/) for English and Spanish.
- **Search**: Pagefind (Static search integration).
- **Styling**: Tailwind CSS + Custom Design System based on "Laws of UX" (specifically Jakob’s Law and Aesthetic-Usability Effect).
- **Hosting**: Vercel (Hobby Tier).
- **Source Control**: GitHub.

## 3. Functional Requirements
- **Dynamic Layouts**: Support for `How-To`, `Documentation`, and `Standard Blog` schemas.
- **Hierarchical Content**: Support for nested folder structures within `src/content/`.
- **LLM Optimization**: Every HTML page must include a hidden `<link rel="alternate" type="text/markdown">` in the `<head>` pointing to the raw Markdown source for AI agents.
- **Media Support**: 
    - Full MDX support for tables, callouts, and code blocks with syntax highlighting.
    - Integration for Asciinema recordings (using the JS player or optimized SVG/GIF exports).
    - Optimized image pipeline using `astro:assets`.
- **Taxonomy**: Robust system for linkable categories and tags.
- **SEO/Performance**: Core Web Vitals focus, automated sitemaps, and Schema.org metadata for IT articles.

## 4. Design Guidelines
- **UI/UX**: Modern, minimalist, and developer-centric. Follow "Laws of UX" (e.g., Fitts's Law for navigation, Law of Proximity for grouping documentation steps).
- **Social**: Integrated links to professional networks (GitHub, LinkedIn, etc.).

## 5. Developer Instructions
- Please provide a recommended folder structure for this i18n setup.
- Explain the best method to implement the hidden "Markdown-only" header for LLMs.
- Suggest a workflow for editing and embedding `asciinema` recordings that maintains fast page loads.

## 6. Initial Questions
Before providing the code, ask me any clarifying questions regarding the specific "Custom Design System" tokens or the preferred navigation structure.
