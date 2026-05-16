import './style.css';
import * as OTPAuth from 'otpauth';
import { Html5Qrcode } from 'html5-qrcode';

// State
let tokens = JSON.parse(localStorage.getItem('crypta-auth-tokens')) || [];
let updateInterval;
let scanner = null;

// DOM Elements
const app = document.getElementById('app');
const tokenList = document.getElementById('token-list');
const addModal = document.getElementById('add-modal');
const addBtn = document.getElementById('add-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const addForm = document.getElementById('add-form');
const startScanBtn = document.getElementById('start-scan-btn');

// Toast notification
const toast = document.createElement('div');
toast.className = 'copy-toast';
toast.textContent = 'Copied to clipboard';
app.appendChild(toast);

function showToast() {
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// Generate TOTP object
function getTOTP(secret, issuer = 'Unknown', label = 'Account') {
  try {
    return new OTPAuth.TOTP({
      issuer: issuer,
      label: label,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret.replace(/\s+/g, '').toUpperCase()),
    });
  } catch (err) {
    console.error("Invalid secret", err);
    return null;
  }
}

// Render the UI
function renderTokens() {
  tokenList.innerHTML = '';
  
  if (tokens.length === 0) {
    tokenList.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); margin-top: 3rem;">
        <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1" fill="none" style="margin-bottom: 1rem; opacity: 0.5;">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <p>No tokens yet.</p>
        <p style="font-size: 0.85rem; margin-top: 0.5rem;">Click + to add a new authenticator.</p>
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
    const formattedCode = `${code.substring(0,3)} ${code.substring(3,6)}`;

    const card = document.createElement('div');
    card.className = 'token-card';
    card.onclick = () => {
      navigator.clipboard.writeText(code).then(() => showToast());
    };

    card.innerHTML = `
      <div class="token-header">
        <div class="token-issuer">${tokenData.issuer}</div>
        <button class="icon-btn" onclick="event.stopPropagation(); deleteToken(${index})" style="color: var(--danger); padding: 0;">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
      <div class="token-account">${tokenData.account}</div>
      <div class="token-code">
        <span>${formattedCode.substring(0,3)}</span>
        <span>${formattedCode.substring(4,7)}</span>
      </div>
      <div class="token-footer">
        <div class="progress-container">
          <div class="progress-bar ${remaining < 5 ? 'danger' : ''}" id="progress-${index}" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
    tokenList.appendChild(card);
  });
}

// Tick loop to update codes and progress bars
function startLoop() {
  if (updateInterval) clearInterval(updateInterval);
  
  updateInterval = setInterval(() => {
    const now = Date.now() / 1000;
    const period = 30;
    const remaining = period - (now % period);
    const percentage = (remaining / period) * 100;

    // If remaining time resets to ~30, we need to regenerate the codes
    if (remaining > 29.5) {
      renderTokens();
    } else {
      // Just update progress bars
      tokens.forEach((_, index) => {
        const bar = document.getElementById(`progress-${index}`);
        if (bar) {
          bar.style.width = `${percentage}%`;
          if (remaining < 5) {
            bar.classList.add('danger');
          } else {
            bar.classList.remove('danger');
          }
        }
      });
    }
  }, 500); // 500ms for smooth progress bar updates
}

window.deleteToken = (index) => {
  if (confirm('Are you sure you want to delete this token?')) {
    tokens.splice(index, 1);
    saveTokens();
    renderTokens();
  }
};

function saveTokens() {
  localStorage.setItem('crypta-auth-tokens', JSON.stringify(tokens));
}

function addToken(issuer, account, secret) {
  // Validate secret
  const totp = getTOTP(secret, issuer, account);
  if (!totp) {
    alert('Invalid secret key. Please check and try again.');
    return;
  }
  
  tokens.push({ issuer, account, secret: secret.replace(/\s+/g, '').toUpperCase() });
  saveTokens();
  renderTokens();
  closeModal();
  addForm.reset();
}

// Events
addBtn.addEventListener('click', () => {
  addModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', closeModal);

function closeModal() {
  addModal.classList.add('hidden');
  stopScanner();
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    
    tab.classList.add('active');
    document.getElementById(tab.dataset.target).classList.add('active');

    if (tab.dataset.target === 'qr-scan') {
      // Optionally start scanner automatically
    } else {
      stopScanner();
    }
  });
});

addForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const issuer = document.getElementById('issuer').value || 'Unknown';
  const account = document.getElementById('account').value || 'Account';
  const secret = document.getElementById('secret').value;
  addToken(issuer, account, secret);
});

// Scanner logic
startScanBtn.addEventListener('click', async () => {
  if (!scanner) {
    scanner = new Html5Qrcode("reader");
  }

  try {
    startScanBtn.textContent = 'Starting...';
    startScanBtn.disabled = true;
    
    await scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText, decodedResult) => {
        // Handle OTP URI
        // Format: otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example
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
        } catch (e) {
          console.error("Invalid QR Code content", e);
        }
      },
      (errorMessage) => {
        // parse error, ignore
      }
    );
    startScanBtn.textContent = 'Scanning...';
  } catch (err) {
    console.error(err);
    alert('Error accessing camera. Please ensure permissions are granted.');
    startScanBtn.textContent = 'Start Camera';
    startScanBtn.disabled = false;
  }
});

function stopScanner() {
  if (scanner && scanner.isScanning) {
    scanner.stop().then(() => {
      startScanBtn.textContent = 'Start Camera';
      startScanBtn.disabled = false;
    }).catch(console.error);
  }
}

// Initial Render
renderTokens();
startLoop();
