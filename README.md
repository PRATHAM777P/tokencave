<div align="center">

# 🪨 TokenCave

**One extension to rule your tokens.**

Token counter · Usage bars · Cache timer · Caveman mode · Context compressor

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/manifest-v3-green?style=flat-square)](#)
[![Privacy](https://img.shields.io/badge/data-stays%20local-brightgreen?style=flat-square)](#privacy)

</div>

---

## What is TokenCave?

TokenCave is a browser extension for **[claude.ai](https://claude.ai)** that combines two things:

1. **Token intelligence** — see exactly how much context you're using, when it expires, and how close you are to limits
2. **Caveman mode** — slash your output tokens by ~75% by making Claude speak with radical brevity — without losing technical accuracy

---

## Features

### 📊 Token Counter
Approximate token count for your current conversation, with a mini progress bar against Claude's 200k context limit. Uses the same `o200k_base` tokenizer family.

### ⏱ Cache Timer
Live countdown showing how long your conversation remains cached. Cached messages cost significantly less — this timer tells you when to keep going vs. when to start fresh.

### 📈 Usage Bars
Session (5-hour) and weekly (7-day) usage with progress bars and reset countdowns. More accurate than Claude's `/usage` page because it reads exact utilization fractions from the SSE stream, not rounded percentages.

### 🪨 Caveman Mode
Make Claude respond like a brilliant, extremely terse caveman. Same technical substance — roughly 75% fewer output tokens.

| Level | Example |
|-------|---------|
| 🪶 **Lite** | Drop filler and hedging, keep full sentences |
| 🪨 **Full** | Drop articles, use fragments, short synonyms |
| 🔥 **Ultra** | Abbreviate everything, arrows for causality (`X→Y`), one word when sufficient |

**Commands (type in chat):**

```
/cave          → toggle on/off
/cave lite     → switch to lite mode
/cave full     → switch to full mode
/cave ultra    → switch to ultra mode
/cave off      → disable
/cave status   → show current state
```

Or use the **extension popup** to click between levels.

### 🗜 Context Compressor (CLI)
Compress your CLAUDE.md, project notes, and documentation files to cut input tokens by ~46% — without losing meaning. Runs locally via Python.

```bash
pip install -r requirements.txt
python -m skills.compress.scripts path/to/CLAUDE.md
```

---

## Installation

### Chrome / Edge / Chromium

1. [Download the latest release ZIP](#) *(or clone this repo)*
2. Go to `chrome://extensions` and enable **Developer mode**
3. Drag and drop the ZIP onto the page *(or click Load unpacked)*

### Firefox

1. Go to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on** → select `manifest.json`

---

## Before / After — Caveman Mode

<table>
<tr>
<td width="50%">

### 🗣 Normal Claude (69 tokens)

> "The reason your React component is re-rendering is likely because you're creating a new object reference on each render cycle. When you pass an inline object as a prop, React's shallow comparison sees it as a different object every time, which triggers a re-render. I'd recommend using useMemo to memoize the object."

</td>
<td width="50%">

### 🪨 Caveman Claude · full (19 tokens)

> "New object ref each render. Inline object prop = new ref = re-render. Wrap in `useMemo`."

</td>
</tr>
</table>

**Same fix. ~75% fewer tokens. Brain still big.**

---

## Privacy & Security

- ✅ All data stays in your browser — no external servers, no tracking
- ✅ Only communicates with `claude.ai`
- ✅ Reads `lastActiveOrg` cookie only to query Claude's own `/usage` endpoint
- ✅ `postMessage` restricted to `window.location.origin` (not `'*'`)
- ✅ Caveman state stored in `sessionStorage` — clears when you close the tab
- ✅ Compression scripts refuse to process secrets, `.env`, keys, or credentials

See [SECURITY.md](SECURITY.md) for full details.

---

## Caveman Mode — How It Works

When caveman mode is active, TokenCave prepends a bracketed instruction to your
message before it's sent:

```
[RESPONSE STYLE: full caveman — drop articles, fragments OK, short synonyms…]

Your actual question here
```

Claude respects this instruction and responds tersely for the rest of the message.
The prefix is invisible in the UI — you just see the compressed response.

The instruction is NOT stored anywhere, NOT sent to any server, and clears when
you turn caveman mode off.

---

## Context Compressor — How It Works

The compression CLI (`skills/compress/scripts/`) uses Claude's API to:

1. Detect whether a file is natural language (compressible) vs. code/config (skip)
2. Refuse to process any file that looks like it contains secrets or credentials
3. Compress natural-language files to ~50% of original tokens
4. Validate the output preserves all technical content
5. Retry up to 2 times if quality check fails

```
Before: CLAUDE.md — 8,200 tokens
After:  CLAUDE.md — 4,400 tokens  (~46% reduction)
```

---

## Project Structure

```
TokenCave/
├── manifest.json          # Extension manifest (MV3)
├── popup.html             # Extension popup UI
├── src/
│   ├── content/
│   │   ├── constants.js   # Shared constants & colors
│   │   ├── bridge-client.js
│   │   ├── tokens.js      # Token counting & caching
│   │   ├── caveman.js     # 🆕 Caveman mode manager
│   │   ├── ui.js          # UI components & DOM injection
│   │   └── main.js        # Orchestrator
│   ├── injected/
│   │   └── bridge.js      # Page-world fetch interceptor
│   ├── styles.css
│   └── vendor/
│       └── o200k_base.js  # Bundled tokenizer
├── icons/                 # Extension icons
├── skills/
│   ├── caveman/SKILL.md   # AI coding assistant skill (Claude Code / Cursor)
│   └── compress/
│       ├── SKILL.md
│       └── scripts/       # Python compression CLI
├── requirements.txt
├── SECURITY.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## Acknowledgements

- Token counting via [gpt-tokenizer](https://github.com/niieani/gpt-tokenizer) (MIT)
- Caveman speech compression concept — viral LLM observation that terse prompts preserve accuracy

---

## License

[MIT](LICENSE)
