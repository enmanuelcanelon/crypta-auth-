/**
 * Capa de seguridad: bloqueo, auto-lock, clipboard seguro.
 */

const AUTO_LOCK_MS = 60_000;
const CLIPBOARD_CLEAR_MS = 30_000;

let masterPassword = null;
let lockTimer = null;
let clipboardTimer = null;
let onLockCallback = null;

export function setMasterPassword(password) {
  masterPassword = password;
  resetAutoLock();
}

export function getMasterPassword() {
  return masterPassword;
}

export function clearMasterPassword() {
  masterPassword = null;
}

export function onLock(callback) {
  onLockCallback = callback;
}

export function lock() {
  clearMasterPassword();
  clearClipboard();
  if (onLockCallback) onLockCallback();
}

export function resetAutoLock() {
  if (lockTimer) clearTimeout(lockTimer);
  lockTimer = setTimeout(() => lock(), AUTO_LOCK_MS);
}

export function setupActivityListeners() {
  const events = ['touchstart', 'touchmove', 'mousedown', 'keydown', 'scroll'];
  events.forEach((evt) => {
    document.addEventListener(evt, resetAutoLock, { passive: true });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) lock();
  });
}

export async function secureCopy(text) {
  try {
    await navigator.clipboard.writeText(text);
    if (clipboardTimer) clearTimeout(clipboardTimer);
    clipboardTimer = setTimeout(clearClipboard, CLIPBOARD_CLEAR_MS);
    return true;
  } catch {
    return false;
  }
}

async function clearClipboard() {
  try {
    await navigator.clipboard.writeText('');
  } catch {
    /* clipboard API puede no estar disponible */
  }
}

export function preventContextMenu() {
  document.addEventListener('contextmenu', (e) => e.preventDefault());
}

export function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>"'&]/g, '').trim().slice(0, 256);
}
