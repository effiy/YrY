/**
 * Content Script Entry — message relay and DOM observation.
 * Handles standard content script responsibilities in the ISOLATED world.
 * The bootstrap module handles dual-world injection separately.
 */

import type { PopupToContent } from '../shared/messages';

// ── Inline Role Config (kept self-contained for content-script classic loading) ─

const ROLE_STORAGE_KEY = 'petRole';

const ROLE_PROMPTS: Record<string, string> = {
  Teacher:
    'You are a knowledgeable and patient Teacher. ' +
    'You explain concepts clearly with examples, adapt your teaching style ' +
    'to the learner\'s level, and encourage curiosity. ' +
    'You are warm, approachable, and never condescending. ' +
    'When you don\'t know something, you admit it honestly and offer to look it up. ' +
    'You celebrate small wins and gently correct mistakes. ' +
    'Your goal is to make learning enjoyable and empowering.',
  Doctor:
    'You are a caring and professional Doctor with extensive medical knowledge. ' +
    'You provide evidence-based health information with a warm bedside manner. ' +
    'You always include a disclaimer that you are not a substitute for in-person ' +
    'medical consultation. You ask clarifying questions about symptoms, duration, ' +
    'and severity before offering guidance. You explain medical terms in plain ' +
    'language, show empathy for discomfort or anxiety, and prioritize safety — ' +
    'urging the user to seek emergency care when symptoms sound serious. ' +
    'You cover general medicine, preventive care, mental health, nutrition, ' +
    'and wellness. You stay calm, reassuring, and never alarmist. ' +
    'Your tone is warm, attentive, and deeply respectful of patient dignity.',
  'Pastry Chef':
    'You are a creative and passionate Pastry Chef. ' +
    'You share baking tips, recipes, and techniques with infectious enthusiasm. ' +
    'You know the science behind pastry — why butter must be cold, why dough ' +
    'needs to rest, how gluten develops. You suggest substitutions for dietary ' +
    'needs, troubleshoot common baking failures, and celebrate the joy of ' +
    'homemade desserts. You describe flavors, textures, and aromas in vivid ' +
    'sensory detail. Your tone is warm, playful, and irresistibly inspiring — ' +
    'like a friend who always brings the best dessert to the party.',
  'Police Officer':
    'You are a dedicated and community-focused Police Officer. ' +
    'You provide safety advice, explain laws and regulations in plain language, ' +
    'and promote crime prevention awareness. You are approachable, fair, and ' +
    'committed to protecting and serving. You de-escalate tense situations with ' +
    'calm, clear communication. You know when to listen and when to act. ' +
    'You never offer legal advice but can explain general principles of law ' +
    'and public safety. Your tone is professional yet personable — firm when ' +
    'necessary, compassionate when someone is scared or vulnerable. ' +
    'You treat every interaction with dignity and respect.',
};

const VALID_ROLE_SET = new Set(Object.keys(ROLE_PROMPTS));

function validateRoleName(input: string): string | null {
  if (VALID_ROLE_SET.has(input)) return input;
  const lower = input.toLowerCase();
  for (const name of VALID_ROLE_SET) {
    if (name.toLowerCase() === lower) return name;
  }
  return null;
}

function getRolePrompt(name: string): string {
  return ROLE_PROMPTS[name] || '';
}

// ── Message Listener ────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener(
  (msg: PopupToContent, _sender, sendResponse) => {
    switch (msg.action) {
      case 'ping': {
        sendResponse({ success: true });
        break;
      }
      case 'setVisibility': {
        _petVisible = msg.visible;
        notifyMainWorld('visibilityChanged', { visible: _petVisible });
        sendResponse({ success: true, visible: _petVisible });
        break;
      }
      case 'toggleVisibility': {
        // Toggle pet visibility — dispatched to MAIN world via
        // custom DOM event or direct window reference
        const visible = togglePetVisibility();
        sendResponse({ success: true, visible });
        break;
      }
      case 'changeSize': {
        setPetSize(msg.size);
        sendResponse({ success: true, size: msg.size });
        break;
      }
      case 'setRole': {
        const canonical = validateRoleName(msg.role);
        if (!canonical) {
          console.warn('[YiPet] Invalid role rejected:', msg.role);
          sendResponse({ success: false });
          break;
        }
        setPetRole(canonical);
        sendResponse({ success: true, role: canonical });
        break;
      }
      case 'setColor': {
        setPetColor(msg.color);
        sendResponse({ success: true });
        break;
      }
      default: {
        sendResponse({ success: false });
      }
    }
    return true; // keep channel open for async response
  },
);

// ── Pet State Helpers ──────────────────────────────────────────────────

let _petVisible = false;
let _petSize = 260;
let _petRole = 'Teacher';
let _petColor = 0;

function togglePetVisibility(): boolean {
  _petVisible = !_petVisible;
  notifyMainWorld('visibilityChanged', { visible: _petVisible });
  return _petVisible;
}

function setPetSize(size: number): void {
  _petSize = size;
  notifyMainWorld('sizeChanged', { size });
}

function setPetRole(role: string): void {
  _petRole = role;
  const systemPrompt = getRolePrompt(role);
  notifyMainWorld('roleChanged', { role, systemPrompt });

  // Persist role globally (separate from per-tab state map)
  chrome.storage.local.set({ [ROLE_STORAGE_KEY]: role }).catch((err: Error) => {
    console.warn('[YiPet] Failed to persist role preference:', err.message);
  });
}

function setPetColor(color: number): void {
  _petColor = color;
  notifyMainWorld('colorChanged', { color });
  // Persist color theme globally (cross-page default)
  chrome.storage.local.set({ petColorTheme: color }).catch(() => {});
}

function notifyMainWorld(type: string, detail: Record<string, unknown>): void {
  window.dispatchEvent(new CustomEvent(`yipet:${type}`, { detail }));
}

// Signal that content script is ready
console.log('[YiPet] Content script initialized');
