# Security Policy

## What TokenCave does

- **Reads** claude.ai API responses to display token counts and usage bars
- **Intercepts** `fetch` calls made by claude.ai pages — only within `https://claude.ai`
- **Stores** caveman mode preferences in `sessionStorage` (tab-local, cleared on close)
- **Reads** the `lastActiveOrg` cookie — only to query `/api/organizations/{id}/usage`

## What TokenCave never does

- Sends any data to external servers
- Phones home or tracks anything
- Reads files from your disk
- Accesses other websites or tabs
- Logs or stores conversation content

## Extension permissions

| Permission | Why |
|---|---|
| `activeTab` | Inject scripts into claude.ai only |
| `scripting` | Popup communicates caveman state with active tab |

No `storage`, no `cookies`, no `history`, no broad host permissions.

## Content Security

The extension declares `web_accessible_resources` restricted to `https://claude.ai/*`.
The injected bridge script posts messages only to `window.location.origin` (not `'*'`).

## Reporting a Vulnerability

Open an issue or email the maintainer privately. Please do not post security
issues publicly until a fix is available.
