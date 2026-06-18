import { Capacitor } from '@capacitor/core';
import { PrivacyScreen } from '@capacitor-community/privacy-screen';

export async function initNativeSecurity() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await PrivacyScreen.enable();
  } catch {
    /* plugin no disponible en web */
  }
}
