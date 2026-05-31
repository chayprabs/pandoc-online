import type { SampleItem } from "@pandoc-online/shared-ui";

export const BUILTIN_SAMPLES: SampleItem[] = [
  {
    id: "readme",
    label: "README",
    format: "markdown",
    content: `# Sample README

This is a **sample** document for Pandoc Online.

- Item one
- Item two

\`\`\`bash
echo "hello"
\`\`\`
`,
  },
  {
    id: "research",
    label: "Research paper",
    format: "markdown",
    content: `---
title: Sample Research Paper
---

# Introduction

This paper cites prior work [@smith2024].

# Methods

We used Pandoc for conversion.
`,
  },
  {
    id: "thesis",
    label: "Thesis chapter",
    format: "markdown",
    content: `# Thesis Chapter

![Diagram](diagram.png)

| Year | Count |
|------|-------|
| 2024 | 10 |
`,
  },
  {
    id: "latex",
    label: "LaTeX article",
    format: "latex",
    content: `\\documentclass{article}
\\begin{document}
\\title{Sample Article}
\\author{Pandoc Online}
\\maketitle
\\section{Intro}
Hello from \\LaTeX.
\\end{document}
`,
  },
  {
    id: "html",
    label: "HTML page",
    format: "html",
    content: `<!DOCTYPE html>
<html><head><title>Sample</title></head>
<body><h1>Hello HTML</h1><p>Convert me.</p></body></html>`,
  },
];

export const BIB_SAMPLE = `@article{smith2024,
  author = {Smith, Jane},
  title = {Document Conversion at Scale},
  year = {2024},
  journal = {Journal of Examples}
}`;
