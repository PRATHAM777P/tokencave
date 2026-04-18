# Contributing to TokenCave

Thanks for your interest! Here's how to get started.

## Project structure

```
TokenCave/
├── manifest.json          # Extension manifest (MV3)
├── popup.html             # Extension popup
├── src/
│   ├── content/           # Content scripts (run on claude.ai)
│   │   ├── constants.js   # Shared constants & colors
│   │   ├── bridge-client.js
│   │   ├── tokens.js      # Token counting logic
│   │   ├── caveman.js     # Caveman mode manager
│   │   ├── ui.js          # DOM UI components
│   │   └── main.js        # Orchestrator
│   ├── injected/
│   │   └── bridge.js      # Injected page script (fetch hook)
│   ├── styles.css
│   └── vendor/
│       └── o200k_base.js  # Bundled tokenizer (do not edit)
├── icons/                 # Extension icons
├── skills/                # AI coding assistant skills
│   ├── caveman/SKILL.md
│   └── compress/
│       ├── SKILL.md
│       └── scripts/       # Python CLI for context compression
└── requirements.txt
```

## Loading locally

**Chrome / Edge:**
1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `TokenCave/` folder

**Firefox:**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on** → select `manifest.json`

## Guidelines

- Keep all styles prefixed with `tc-` to avoid clashing with claude.ai
- Never send user data anywhere — all data stays local
- Never access `credentials`, `.env`, or sensitive files in the compress scripts
- Add a test for any new compress logic in `tests/`

## Pull Requests

- Keep PRs focused on one feature or fix
- Update CHANGELOG.md if adding a user-visible change
- Run `python -m pytest tests/` before submitting
