# TokenCave — AI Assistant Context

## Project overview

Browser extension (Chrome/Firefox, Manifest V3) for claude.ai that combines:
- Token counter + cache timer + usage bars (from content scripts)
- Caveman mode (terse response injection)
- Python CLI for context file compression

## Critical rules

- All CSS classes prefixed with `tc-` (not `cc-` — that was the old project)
- All JS global namespace: `globalThis.TokenCave` / `window.TokenCave` / `TC`
- `postMessage` always uses `window.location.origin` as target — never `'*'`
- Never read, log, or transmit conversation content to external servers
- Never touch files matching: `.env*`, `*.key`, `*.pem`, `credentials*`, `secrets*`, or files in `.ssh/`, `.aws/`, `.gnupg/`

## Architecture

Content scripts load in order:
1. `constants.js` — TC.DOM, TC.CONST, TC.COLORS
2. `bridge-client.js` — TC.bridge (postMessage IPC), TC.injectBridgeOnce
3. `o200k_base.js` — tokenizer (vendor)
4. `tokens.js` — TC.tokens.computeConversationMetrics
5. `caveman.js` — TC.caveman (state, commands, prompt injection)
6. `ui.js` — TC.ui.CounterUI
7. `main.js` — orchestrator, sets up TC.waitForElement

Injected script (`bridge.js`) runs in page world to intercept fetch.

## Caveman mode flow

1. User types `/cave [level]` → `caveman.js` intercepts keydown in capture phase
2. Clears textarea, shows toast, saves state to `sessionStorage`
3. On next submit: prepends `[RESPONSE STYLE: ...]` prefix to textarea value
4. React picks up modified value via synthetic `input` event

## Extension popup

`popup.html` uses `chrome.scripting.executeScript` to read/write `sessionStorage`
on the active claude.ai tab. Requires `activeTab` + `scripting` permissions.

## Compress CLI

```bash
python -m skills.compress.scripts <file>
```

Requires `ANTHROPIC_API_KEY` env var.

## DO NOT

- Add any analytics, telemetry, or external HTTP calls
- Use `'*'` as postMessage origin
- Compress or read `.env`, keys, credentials in the CLI
- Change the `tc-` CSS prefix
