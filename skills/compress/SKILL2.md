---
name: tokencave-compress
description: >
  Compress natural-language context files (CLAUDE.md, README, notes, docs) to cut input tokens
  ~46% while preserving all technical substance. Skips code, config, secrets.
  Use when: "compress this file", "reduce tokens in CLAUDE.md", "shrink context",
  or when a file is provided with a request to make it shorter for AI context windows.
---

## When to use

Compress: `.md`, `.txt`, `.rst` — markdown instructions, project notes, preference files.

Skip: code (`.py`, `.js`, etc.), config (`.json`, `.yaml`), secrets (`.env`, credentials).

## How

1. Detect if natural language (use `scripts/detect.py`)
2. If yes, call Claude with compression prompt
3. Validate output preserves meaning (use `scripts/validate.py`)
4. Retry up to 2 times if quality fails

## Compression prompt

```
Compress this text to ~50% of original tokens. Rules:
- Keep ALL technical facts, numbers, names, constraints
- Drop filler words, redundant phrasing, verbose explanations
- Use fragments where meaning is clear
- Never remove code blocks, commands, or config values
- Output ONLY the compressed text, no commentary

TEXT:
{content}
```

## Usage (CLI)

```bash
python -m skills.compress.scripts path/to/file.md
```

## Security

Never compress: `.env*`, `*.key`, `*.pem`, `credentials*`, `secrets*`,
files in `.ssh/`, `.aws/`, `.gnupg/`, `.kube/`, `.docker/`.
