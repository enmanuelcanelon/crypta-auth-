# Compilar APK — CRYPTA Auth

## Requisitos

1. **Node.js** 18+ (ya instalado)
2. **JDK 17** — OpenJDK
3. **Android SDK** — Platform 34+ y Build-Tools

### Arch Linux (CachyOS)

```bash
sudo pacman -S jdk-openjdk android-sdk android-sdk-build-tools android-sdk-platform-tools
export ANDROID_HOME=/opt/android-sdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
sdkmanager "platforms;android-34" "build-tools;34.0.0"
```

### Ubuntu / Debian

```bash
sudo apt install openjdk-17-jdk
# Instalar Android Studio o command-line tools
```

## Compilar APK de prueba (debug)

```bash
cd crypta-auth--main
npm install
npm run apk:debug
```

El APK estará en:
`android/app/build/outputs/apk/debug/app-debug.apk`

## Instalar en el teléfono

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

O copia el archivo `.apk` al teléfono y ábrelo (activa "Orígenes desconocidos" si hace falta).

## APK de producción (firmado)

Para publicar o uso personal permanente, genera un keystore y firma:

```bash
keytool -genkey -v -keystore crypta-release.keystore -alias crypta -keyalg RSA -keysize 2048 -validity 10000
```

Crea `android/keystore.properties`:

```properties
storeFile=../crypta-release.keystore
storePassword=TU_PASSWORD
keyAlias=crypta
keyPassword=TU_PASSWORD
```

Luego configura signing en `android/app/build.gradle` y ejecuta:

```bash
npm run apk:release
```

## Alternativa sin compilar: PWA

Si no quieres instalar el SDK de Android, puedes usar la PWA:

```bash
npm run build
npm run preview -- --host
```

Abre la IP en el navegador del móvil → **Añadir a pantalla de inicio**.
