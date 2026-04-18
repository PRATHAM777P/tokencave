(() => {
	'use strict';

	/**
	 * TokenCave — Caveman Mode Manager
	 *
	 * Injects a caveman system-prompt prefix into outgoing Claude messages
	 * by hooking the textarea submit flow. Intensity levels: lite, full, ultra.
	 *
	 * Commands (type in chat):
	 *   /cave          → toggle on/off (restores last level)
	 *   /cave lite     → enable lite mode
	 *   /cave full     → enable full mode (default)
	 *   /cave ultra    → enable ultra mode
	 *   /cave off      → disable
	 *   /cave status   → show current state without sending
	 */

	const TC = (globalThis.TokenCave = globalThis.TokenCave || {});

	// ─── Prompts ──────────────────────────────────────────────────────────────

	const CAVEMAN_PROMPTS = Object.freeze({
		lite: `[RESPONSE STYLE: lite caveman — no filler/hedging, keep articles + full sentences, professional but tight]`,
		full: `[RESPONSE STYLE: full caveman — drop articles, fragments OK, short synonyms. No filler words. Pattern: [thing] [action] [reason]. [next step].]`,
		ultra: `[RESPONSE STYLE: ultra caveman — maximum compression. Abbreviate (DB/auth/config/req/res/fn/impl), arrows for causality (X→Y), one word when sufficient. Strip conjunctions.]`
	});

	// ─── State ────────────────────────────────────────────────────────────────

	let cavemanState = {
		active: false,
		level: TC.CONST?.CAVEMAN_DEFAULT || 'full'
	};

	// Persist across page navigations via sessionStorage (private to tab, no server exposure)
	function loadState() {
		try {
			const raw = sessionStorage.getItem('tc:caveman');
			if (raw) {
				const parsed = JSON.parse(raw);
				if (parsed && typeof parsed.active === 'boolean' && TC.CONST.CAVEMAN_LEVELS.includes(parsed.level)) {
					cavemanState = parsed;
				}
			}
		} catch {
			// ignore
		}
	}

	function saveState() {
		try {
			sessionStorage.setItem('tc:caveman', JSON.stringify(cavemanState));
		} catch {
			// ignore
		}
	}

	function setLevel(level) {
		if (!TC.CONST.CAVEMAN_LEVELS.includes(level)) return;
		if (level === 'off') {
			cavemanState.active = false;
		} else {
			cavemanState.active = true;
			cavemanState.level = level;
		}
		saveState();
		TC.ui?.updateCavemanBadge?.();
	}

	function toggle() {
		cavemanState.active = !cavemanState.active;
		saveState();
		TC.ui?.updateCavemanBadge?.();
	}

	// ─── Command interceptor ──────────────────────────────────────────────────

	/**
	 * Intercept /cave commands typed by the user before they reach Claude.
	 * Returns true if the message was a command (should not be sent as-is).
	 */
	function interceptCommand(text) {
		const trimmed = text.trim();
		if (!trimmed.startsWith('/cave')) return false;

		const parts = trimmed.slice(1).trim().toLowerCase().split(/\s+/);
		const cmd = parts[0]; // 'cave'
		const arg = parts[1]; // level or subcommand

		if (cmd !== 'cave') return false;

		if (!arg || arg === 'toggle') {
			toggle();
			showToast(`TokenCave: caveman ${cavemanState.active ? cavemanState.level : 'off'}`);
			return true;
		}

		if (arg === 'off') {
			setLevel('off');
			showToast('TokenCave: caveman off');
			return true;
		}

		if (TC.CONST.CAVEMAN_LEVELS.includes(arg) && arg !== 'off') {
			setLevel(arg);
			showToast(`TokenCave: caveman ${arg} 🪨`);
			return true;
		}

		if (arg === 'status') {
			showToast(
				`TokenCave: caveman ${cavemanState.active ? `ON (${cavemanState.level})` : 'OFF'}`
			);
			return true;
		}

		return false;
	}

	// ─── Prompt injection ─────────────────────────────────────────────────────

	/**
	 * Prepend the caveman system hint to a user message text, if active.
	 * This is injected into the text as a bracketed instruction Claude will follow.
	 */
	function applyToMessage(text) {
		if (!cavemanState.active) return text;
		const prompt = CAVEMAN_PROMPTS[cavemanState.level];
		if (!prompt) return text;
		// Prefix on a separate line so it doesn't disrupt code blocks
		return `${prompt}\n\n${text}`;
	}

	// ─── Toast notification ───────────────────────────────────────────────────

	function showToast(message, durationMs = 2500) {
		const existing = document.getElementById('tc-toast');
		if (existing) existing.remove();

		const toast = document.createElement('div');
		toast.id = 'tc-toast';
		toast.className = 'tc-toast';
		toast.textContent = message;
		document.body.appendChild(toast);

		// Animate in
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				toast.classList.add('tc-toast--visible');
			});
		});

		setTimeout(() => {
			toast.classList.remove('tc-toast--visible');
			setTimeout(() => toast.remove(), 300);
		}, durationMs);
	}

	// ─── Submit hook ──────────────────────────────────────────────────────────

	/**
	 * Hooks the main chat textarea to:
	 * 1. Intercept /cave commands
	 * 2. Inject caveman prompt prefix when active
	 *
	 * Uses a keydown listener for Enter (submit). Modifies textarea value before
	 * the framework reads it via React's synthetic event system.
	 */
	function hookTextarea(textarea) {
		if (!textarea || textarea.dataset.tcHooked) return;
		textarea.dataset.tcHooked = 'true';

		textarea.addEventListener(
			'keydown',
			(e) => {
				// Only intercept Enter without Shift (submit)
				if (e.key !== 'Enter' || e.shiftKey) return;

				const text = textarea.value;
				if (!text.trim()) return;

				// Handle /cave commands — suppress the submit entirely
				if (interceptCommand(text)) {
					e.preventDefault();
					e.stopImmediatePropagation();
					// Clear the textarea
					const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
						window.HTMLTextAreaElement.prototype,
						'value'
					)?.set;
					if (nativeInputValueSetter) {
						nativeInputValueSetter.call(textarea, '');
						textarea.dispatchEvent(new Event('input', { bubbles: true }));
					}
					return;
				}

				// Inject caveman prefix if active
				if (cavemanState.active) {
					const modified = applyToMessage(text);
					const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
						window.HTMLTextAreaElement.prototype,
						'value'
					)?.set;
					if (nativeInputValueSetter) {
						nativeInputValueSetter.call(textarea, modified);
						textarea.dispatchEvent(new Event('input', { bubbles: true }));
					}
				}
			},
			true // capture phase to run before React
		);
	}

	// Watch for textarea to appear (SPA navigation)
	function watchForTextarea() {
		const tryHook = () => {
			const textarea = document.querySelector('textarea[data-testid="chat-input"], div[contenteditable="true"][data-testid="chat-input"], textarea');
			if (textarea && textarea.tagName === 'TEXTAREA') hookTextarea(textarea);
		};

		tryHook();

		const observer = new MutationObserver(() => tryHook());
		observer.observe(document.body, { childList: true, subtree: true });
	}

	// ─── Public API ───────────────────────────────────────────────────────────

	TC.caveman = {
		get active() { return cavemanState.active; },
		get level() { return cavemanState.level; },
		setLevel,
		toggle,
		showToast,
		applyToMessage,
		interceptCommand
	};

	// Init
	loadState();
	watchForTextarea();
})();
