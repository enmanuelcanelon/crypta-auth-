# Auditoría de Seguridad — CRYPTA Auth

## Resumen

CRYPTA Auth implementa autenticación TOTP offline con cifrado local. Este documento describe las medidas de seguridad y sus limitaciones.

## Medidas implementadas

### 1. Cifrado en reposo (AES-256-GCM)
- Los secretos TOTP se cifran con **AES-256-GCM** antes de guardarse.
- La clave se deriva con **PBKDF2-SHA256** (600.000 iteraciones).
- Un salt aleatorio de 16 bytes se almacena por separado (no es secreto).
- La contraseña maestra **nunca** se persiste en disco.

### 2. Zero-Knowledge / Sin red
- Cero peticiones a servidores externos (sin Google Fonts, analytics, CDNs).
- Todo el cálculo TOTP ocurre en el procesador local (RFC 6238).
- Content Security Policy estricta bloquea scripts y conexiones no autorizadas.

### 3. Bloqueo de aplicación
- Pantalla de bloqueo con contraseña maestra al iniciar.
- Auto-bloqueo tras 60 segundos de inactividad.
- Bloqueo automático al cambiar de app o apagar pantalla.
- Botón manual de bloqueo en el header.

### 4. Protección de clipboard
- Los códigos copiados se borran del portapapeles tras 30 segundos.

### 5. Hardening de UI
- Campos de clave secreta como `type="password"`.
- Sanitización de inputs contra XSS.
- Sin logs de secretos en producción (console eliminado en build).
- Menú contextual deshabilitado.
- `user-select: none` en tarjetas de tokens.

### 6. Android APK (Capacitor)
- `FLAG_SECURE` vía plugin Privacy Screen (bloquea capturas de pantalla).
- WebView debugging deshabilitado en release.
- HTTPS scheme para el WebView local.
- Build minificado y ofuscado con Terser.

## Limitaciones conocidas

| Riesgo | Mitigación parcial | Nota |
|--------|-------------------|------|
| Dispositivo con root/jailbreak | Ninguna app es 100% segura | Un atacante con acceso root puede extraer datos de memoria |
| Contraseña maestra débil | Usar 12+ caracteres aleatorios | PBKDF2 ralentiza fuerza bruta pero no la impide con contraseñas débiles |
| Malware en el dispositivo | Fuera del alcance de la app | Keyloggers pueden capturar la contraseña maestra |
| Pérdida de contraseña maestra | No hay recuperación | Por diseño: sin servidor, sin backdoor |
| Ingeniería inversa del APK | Ofuscación + cifrado | El binario puede analizarse; los secretos siguen cifrados |

## Recomendaciones de uso

1. Usa una contraseña maestra de al menos 12 caracteres con números y símbolos.
2. No compartas capturas de pantalla de códigos TOTP.
3. Mantén tu dispositivo actualizado y sin root.
4. Haz backup manual de tus claves secretas en un gestor de contraseñas separado.

## Verificación

```bash
# Build de producción
npm run build

# Verificar que no hay conexiones externas en el bundle
grep -r "http" dist/ --include="*.js" | grep -v "otpauth"
```
