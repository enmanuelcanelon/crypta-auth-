/**
 * Vault cifrado con Web Crypto API (AES-256-GCM + PBKDF2).
 * Los secretos nunca se almacenan en texto plano.
 */

const VAULT_KEY = 'crypta-vault';
const SALT_KEY = 'crypta-salt';
const PBKDF2_ITERATIONS = 600_000;
const IV_LENGTH = 12;

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function fromBase64(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function isVaultInitialized() {
  return localStorage.getItem(SALT_KEY) !== null;
}

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function createVault(password, tokens = []) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(JSON.stringify(tokens))
  );
  localStorage.setItem(SALT_KEY, toBase64(salt));
  localStorage.setItem(VAULT_KEY, JSON.stringify({ iv: toBase64(iv), data: toBase64(ciphertext) }));
  localStorage.removeItem('crypta-auth-tokens');
}

export async function unlockVault(password) {
  const saltB64 = localStorage.getItem(SALT_KEY);
  const vaultRaw = localStorage.getItem(VAULT_KEY);
  if (!saltB64 || !vaultRaw) return null;

  try {
    const salt = fromBase64(saltB64);
    const { iv, data } = JSON.parse(vaultRaw);
    const key = await deriveKey(password, salt);
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(iv) },
      key,
      fromBase64(data)
    );
    const dec = new TextDecoder();
    return JSON.parse(dec.decode(plaintext));
  } catch {
    return null;
  }
}

export async function saveVault(password, tokens) {
  await createVault(password, tokens);
}

export async function migratePlaintextVault(password) {
  const legacy = localStorage.getItem('crypta-auth-tokens');
  if (!legacy) return false;
  try {
    const tokens = JSON.parse(legacy);
    await createVault(password, tokens);
    return true;
  } catch {
    return false;
  }
}

export async function verifyPassword(password) {
  const tokens = await unlockVault(password);
  return tokens !== null;
}

export async function changeMasterPassword(currentPassword, newPassword) {
  const tokens = await unlockVault(currentPassword);
  if (tokens === null) return false;
  await createVault(newPassword, tokens);
  return true;
}

export function wipeVault() {
  localStorage.removeItem(VAULT_KEY);
  localStorage.removeItem(SALT_KEY);
  localStorage.removeItem('crypta-auth-tokens');
}
