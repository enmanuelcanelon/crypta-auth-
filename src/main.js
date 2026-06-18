import './style.css';
import * as OTPAuth from 'otpauth';
import { Html5Qrcode } from 'html5-qrcode';
import {
  isVaultInitialized,
  unlockVault,
  saveVault,
  createVault,
} from './crypto.js';
import {
  setMasterPassword,
  getMasterPassword,
  lock,
  onLock,
  setupActivityListeners,
  secureCopy,
  preventContextMenu,
  sanitizeInput,
} from './security.js';
import { initNativeSecurity } from './capacitor-init.js';

let tokens = [];
let updateInterval;
let scanner = null;

const app = document.getElementById('app');
const tokenList = document.getElementById('token-list');
const addModal = document.getElementById('add-modal');
const addBtn = document.getElementById('add-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const addForm = document.getElementById('add-form');
const startScanBtn = document.getElementById('start-scan-btn');
const lockScreen = document.getElementById('lock-screen');
const lockForm = document.getElementById('lock-form');
const lockPassword = document.getElementById('lock-password');
const lockConfirm = document.getElementById('lock-confirm');
const lockConfirmGroup = document.getElementById('lock-confirm-group');
const lockTitle = document.getElementById('lock-title');
const lockSubtitle = document.getElementById('lock-subtitle');
const lockError = document.getElementById('lock-error');
const lockSubmit = document.getElementById('lock-submit');

const toast = document.createElement('div');
toast.className = 'copy-toast';
toast.textContent = 'Copiado';
app.appendChild(toast);

function showToast(msg = 'Copiado') {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function getTOTP(secret, issuer = 'Unknown', label = 'Account') {
  try {
    return new OTPAuth.TOTP({
      issuer,
      label,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret.replace(/\s+/g, '').toUpperCase()),
    });
  } catch {
    return null;
  }
}

function renderTokens() {
  tokenList.innerHTML = '';

  if (tokens.length === 0) {
    tokenList.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" stroke-width="1.5" fill="none" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <p>Sin tokens</p>
        <span>Pulsa + para añadir</span>
      </div>
    `;
    return;
  }

  const now = Date.now() / 1000;
  const period = 30;
  const remaining = period - (now % period);
  const percentage = (remaining / period) * 100;

  tokens.forEach((tokenData, index) => {
    const totp = getTOTP(tokenData.secret, tokenData.issuer, tokenData.account);
    if (!totp) return;

    const code = totp.generate();
    const card = document.createElement('article');
    card.className = 'token-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Copiar código de ${tokenData.issuer}`);

    const handleCopy = () => secureCopy(code).then((ok) => ok && showToast());

    card.addEventListener('click', handleCopy);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCopy();
      }
    });

    card.innerHTML = `
      <div class="token-header">
        <div>
          <div class="token-issuer">${escapeHtml(tokenData.issuer)}</div>
          <div class="token-account">${escapeHtml(tokenData.account)}</div>
        </div>
        <button class="icon-btn delete-btn" aria-label="Eliminar" data-index="${index}">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
      <div class="token-code">
        <span>${code.substring(0, 3)}</span>
        <span class="code-sep"></span>
        <span>${code.substring(3, 6)}</span>
      </div>
      <div class="progress-container">
        <div class="progress-bar ${remaining < 5 ? 'danger' : ''}" id="progress-${index}" style="width: ${percentage}%"></div>
      </div>
    `;
    tokenList.appendChild(card);
  });

  tokenList.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteToken(Number(btn.dataset.index));
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function startLoop() {
  if (updateInterval) clearInterval(updateInterval);

  updateInterval = setInterval(() => {
    const now = Date.now() / 1000;
    const period = 30;
    const remaining = period - (now % period);
    const percentage = (remaining / period) * 100;

    if (remaining > 29.5) {
      renderTokens();
    } else {
      tokens.forEach((_, index) => {
        const bar = document.getElementById(`progress-${index}`);
        if (bar) {
          bar.style.width = `${percentage}%`;
          bar.classList.toggle('danger', remaining < 5);
        }
      });
    }
  }, 500);
}

async function deleteToken(index) {
  if (!confirm('¿Eliminar este token?')) return;
  tokens.splice(index, 1);
  await persistTokens();
  renderTokens();
}

async function persistTokens() {
  const pwd = getMasterPassword();
  if (pwd) await saveVault(pwd, tokens);
}

async function addToken(issuer, account, secret) {
  const totp = getTOTP(secret, issuer, account);
  if (!totp) {
    showToast('Clave inválida');
    return;
  }

  tokens.push({
    issuer: sanitizeInput(issuer) || 'Unknown',
    account: sanitizeInput(account) || 'Account',
    secret: secret.replace(/\s+/g, '').toUpperCase(),
  });
  await persistTokens();
  renderTokens();
  closeModal();
  addForm.reset();
}

function showApp() {
  lockScreen.classList.add('hidden');
  app.classList.remove('locked');
  renderTokens();
  startLoop();
}

function showLockScreen(isSetup = false) {
  lockScreen.classList.remove('hidden');
  app.classList.add('locked');
  lockPassword.value = '';
  lockConfirm.value = '';
  lockError.textContent = '';
  lockError.classList.remove('visible');

  if (isSetup) {
    lockTitle.textContent = 'Crear bóveda';
    lockSubtitle.textContent = 'Define tu contraseña maestra. No se almacena en ningún sitio.';
    lockConfirmGroup.classList.remove('hidden');
    lockSubmit.textContent = 'Crear bóveda';
  } else {
    lockTitle.textContent = 'CRYPTA';
    lockSubtitle.textContent = 'Introduce tu contraseña maestra';
    lockConfirmGroup.classList.add('hidden');
    lockSubmit.textContent = 'Desbloquear';
  }

  lockPassword.focus();
}

async function handleLockSubmit(e) {
  e.preventDefault();
  const password = lockPassword.value;
  lockError.classList.remove('visible');

  if (!password || password.length < 8) {
    lockError.textContent = 'Mínimo 8 caracteres';
    lockError.classList.add('visible');
    return;
  }

  const isSetup = !isVaultInitialized();

  if (isSetup) {
    if (password !== lockConfirm.value) {
      lockError.textContent = 'Las contraseñas no coinciden';
      lockError.classList.add('visible');
      return;
    }
    let initialTokens = [];
    const legacy = localStorage.getItem('crypta-auth-tokens');
    if (legacy) {
      try { initialTokens = JSON.parse(legacy); } catch { /* corrupto */ }
    }
    await createVault(password, initialTokens);
    setMasterPassword(password);
    tokens = initialTokens;
    showApp();
    return;
  }

  const unlocked = await unlockVault(password);
  if (unlocked === null) {
    lockError.textContent = 'Contraseña incorrecta';
    lockError.classList.add('visible');
    lockPassword.value = '';
    return;
  }

  setMasterPassword(password);
  tokens = unlocked;
  showApp();
}

function closeModal() {
  addModal.classList.add('hidden');
  stopScanner();
}

addBtn.addEventListener('click', () => addModal.classList.remove('hidden'));
closeModalBtn.addEventListener('click', closeModal);

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    tabContents.forEach((c) => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.target).classList.add('active');
    if (tab.dataset.target !== 'qr-scan') stopScanner();
  });
});

addForm.addEventListener('submit', (e) => {
  e.preventDefault();
  addToken(
    document.getElementById('issuer').value,
    document.getElementById('account').value,
    document.getElementById('secret').value
  );
});

startScanBtn.addEventListener('click', async () => {
  if (!scanner) scanner = new Html5Qrcode('reader');

  try {
    startScanBtn.textContent = 'Iniciando…';
    startScanBtn.disabled = true;

    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        try {
          const url = new URL(decodedText);
          if (url.protocol === 'otpauth:' && url.hostname === 'totp') {
            const secret = url.searchParams.get('secret');
            const issuer = url.searchParams.get('issuer') || url.pathname.split(':')[0].replace(/^\//, '');
            const account = url.pathname.split(':').pop() || 'Account';
            if (secret) {
              stopScanner();
              addToken(decodeURIComponent(issuer), decodeURIComponent(account), secret);
            }
          }
        } catch {
          /* QR inválido */
        }
      },
      () => {}
    );
    startScanBtn.textContent = 'Escaneando…';
  } catch {
    showToast('Error de cámara');
    startScanBtn.textContent = 'Iniciar cámara';
    startScanBtn.disabled = false;
  }
});

function stopScanner() {
  if (scanner?.isScanning) {
    scanner.stop().then(() => {
      startScanBtn.textContent = 'Iniciar cámara';
      startScanBtn.disabled = false;
    }).catch(() => {});
  }
}

document.getElementById('lock-btn')?.addEventListener('click', () => lock());

lockForm.addEventListener('submit', handleLockSubmit);

onLock(() => {
  if (updateInterval) clearInterval(updateInterval);
  tokens = [];
  stopScanner();
  showLockScreen(false);
});

preventContextMenu();
setupActivityListeners();
initNativeSecurity();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

if (isVaultInitialized()) {
  showLockScreen(false);
} else {
  showLockScreen(true);
}
