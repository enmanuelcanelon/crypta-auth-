<div align="center">
  <h1>CRYPTA Auth</h1>
  <p><strong>Autenticador TOTP offline con cifrado local · App nativa Android</strong></p>

  <br />

  <a href="https://github.com/enmanuelcanelon/crypta-auth-/releases/latest/download/crypta-auth.apk">
    <img src="https://img.shields.io/badge/Descargar-APK%20Android-a78bfa?style=for-the-badge&logo=android&logoColor=white" alt="Descargar APK" />
  </a>

  <p style="margin-top: 1rem;">
    <a href="https://github.com/enmanuelcanelon/crypta-auth-/releases/latest/download/crypta-auth.apk"><strong>⬇ Descargar CRYPTA Auth.apk</strong></a>
    — un clic, instalar, app nativa (no navegador)
  </p>
</div>

## Instalar en tu teléfono

1. Pulsa **Descargar APK** arriba (desde el móvil)
2. Abre el archivo descargado
3. Si Android lo pide, permite **Instalar apps desconocidas** para Chrome o tu gestor de archivos
4. Toca **Instalar** → abre **CRYPTA Auth** desde el launcher

> La app se compila automáticamente en cada actualización. Si el enlace aún no funciona, espera 2–3 minutos tras un push o revisa [Releases](https://github.com/enmanuelcanelon/crypta-auth-/releases).

---

Parte del ecosistema **CRYPTA**: privacidad, arquitectura zero-knowledge y estética cyber-gothic minimalista.

## Seguridad

- **Cifrado AES-256-GCM** con contraseña maestra (PBKDF2, 600k iteraciones)
- **Zero-Knowledge:** cero conexiones a servidores externos
- **RFC 6238:** compatible con GitHub, Google, etc.
- **Auto-bloqueo**, clipboard seguro, anti-screenshot en Android
- Auditoría completa en [`SECURITY.md`](SECURITY.md)

## Características

- UI minimalista dark mode con acento púrpura
- **App nativa Android** — descarga APK e instala directo
- Escáner QR integrado
- Vanilla JS — sin frameworks pesados

## Desarrollo local

```bash
git clone https://github.com/enmanuelcanelon/crypta-auth-.git
cd crypta-auth-
npm install
npm run dev -- --host
```

Para compilar el APK manualmente, ver [`BUILD.md`](BUILD.md).

## Stack

- Vanilla JavaScript, HTML5, CSS
- [Vite](https://vitejs.dev/)
- [otpauth](https://github.com/hectorm/otpauth) · [html5-qrcode](https://github.com/mebjas/html5-qrcode)
- [Capacitor](https://capacitorjs.com/) (Android)

## Licencia

Open Source — ecosistema CRYPTA.
