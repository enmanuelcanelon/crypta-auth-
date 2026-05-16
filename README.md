<div align="center">
  <h1>CRYPTA Auth</h1>
  <p><strong>Zero-Knowledge Cyber-Gothic Authenticator (PWA)</strong></p>
</div>

CRYPTA Auth is a lightweight, ultra-secure, completely offline Progressive Web App (PWA) that generates Time-Based One-Time Passwords (TOTP) for Two-Factor Authentication (2FA). It is designed to be a private, self-hosted alternative to corporate authenticators like Google Authenticator or Authy.

This project is part of the broader **CRYPTA** ecosystem, focusing on privacy, zero-knowledge architecture, and a distinct "Cyber-Gothic" aesthetic.

## 🛡️ Security First

This application was built with absolute privacy and robust security as the core principles:

1. **Zero External Connections (Zero-Knowledge):** 
   The application logic does not make a single network request to any external server. All cryptographic calculations and TOTP generation happen entirely locally on your device's processor. Your secret keys (seeds) never leave your device.
   
2. **Standard Cryptography (RFC 6238):**
   CRYPTA Auth uses the industry-standard HMAC-Based Time-Based One-Time Password algorithm. It generates the exact same 6-digit codes as commercial authenticators when given the same secret key, ensuring 100% compatibility with services like GitHub, Google, Twitter, etc.

3. **Total Control & No Third Parties:**
   There are no centralized servers, no analytics, and no accounts to register. Because there is no backend, there is no central database that can be breached to steal your 2FA seeds. You are the sole owner of your vault.

*(Note: Future roadmap includes AES-GCM encryption for the local storage payload using a Master Password, ensuring that even if your device is stolen while unlocked, your 2FA codes remain secure).*

## ✨ Features

- **Cyber-Gothic Aesthetic:** A premium, dark-mode-first UI featuring vibrant purple accents (`#bb86fc`), smooth animations, and minimalist typography.
- **Progressive Web App (PWA):** Installable natively on iOS and Android devices directly from the browser. Operates 100% offline.
- **Built-in QR Scanner:** Uses your device's camera to seamlessly scan and add new 2FA tokens without requiring manual input.
- **Zero Framework Bloat:** Built purely with Vanilla JavaScript, HTML, and CSS. No React, Vue, or heavy dependencies, resulting in lightning-fast load times.

## 🚀 Installation & Usage

### Running Locally

1. Clone the repository and navigate to the directory:
   ```bash
   cd crypta-auth
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server (exposed to your local network):
   ```bash
   npm run dev -- --host
   ```

### Installing on Mobile (PWA)

1. Ensure your mobile device is on the same local network as the host running the dev server.
2. Open your mobile browser (e.g., Brave, Safari, Chrome) and navigate to the local network IP (e.g., `http://<YOUR_LOCAL_IP>:5173`).
3. Open the browser menu and select **"Add to Home Screen"** or **"Install App"**.
4. The application will now run natively in full-screen mode on your device and will work completely offline.

## 🛠️ Technology Stack

- **Frontend:** Vanilla JavaScript, HTML5, Vanilla CSS
- **Bundler:** [Vite](https://vitejs.dev/)
- **Cryptography:** [`otpauth`](https://github.com/hectorm/otpauth) (for standard HOTP/TOTP generation)
- **QR Scanner:** [`html5-qrcode`](https://github.com/mebjas/html5-qrcode)

## 📄 License

This project is Open Source. Part of the CRYPTA privacy ecosystem.
