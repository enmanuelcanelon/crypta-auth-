<div align="center">
  <h1>CRYPTA Auth</h1>
  <p><strong>Autenticador TOTP offline con cifrado local · PWA + APK</strong></p>
</div>

CRYPTA Auth es una app ligera, ultra-segura y completamente offline que genera contraseñas de un solo uso basadas en tiempo (TOTP) para autenticación de dos factores (2FA). Alternativa privada y auto-hospedada a Google Authenticator o Authy.

Parte del ecosistema **CRYPTA**: privacidad, arquitectura zero-knowledge y estética cyber-gothic minimalista.

## Seguridad

- **Cifrado AES-256-GCM** con contraseña maestra (PBKDF2, 600k iteraciones)
- **Zero-Knowledge:** cero conexiones a servidores externos
- **RFC 6238:** compatible con GitHub, Google, etc.
- **Auto-bloqueo**, clipboard seguro, anti-screenshot en Android
- Auditoría completa en [`SECURITY.md`](SECURITY.md)

## Características

- UI minimalista dark mode con acento púrpura
- PWA instalable (iOS/Android) — funciona offline
- Escáner QR integrado
- APK nativo Android vía Capacitor
- Vanilla JS — sin frameworks pesados

## Instalación

```bash
git clone https://github.com/enmanuelcanelon/crypta-auth-.git
cd crypta-auth-
npm install
npm run dev -- --host
```

### APK Android

Ver [`BUILD.md`](BUILD.md) para compilar el APK.

```bash
npm run apk:debug
```

### PWA en móvil

1. `npm run build && npm run preview -- --host`
2. Abre la IP en el navegador del móvil
3. **Añadir a pantalla de inicio**

## Stack

- Vanilla JavaScript, HTML5, CSS
- [Vite](https://vitejs.dev/)
- [otpauth](https://github.com/hectorm/otpauth) · [html5-qrcode](https://github.com/mebjas/html5-qrcode)
- [Capacitor](https://capacitorjs.com/) (Android)

## Licencia

Open Source — ecosistema CRYPTA.
