import { Linking, Platform } from 'react-native';
import { EmergencyContact } from './storage';

function buildSOSMessage(lat?: number, lng?: number): string {
  let msg = 'ALERTA SOS! Preciso de ajuda urgente!';
  if (lat !== undefined && lng !== undefined) {
    msg += ` Minha localização: https://maps.google.com/?q=${lat},${lng}`;
  }
  return msg;
}

export async function sendSMS(phone: string, message: string): Promise<boolean> {
  try {
    const separator = Platform.OS === 'ios' ? '&' : '?';
    const url = `sms:${phone}${separator}body=${encodeURIComponent(message)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function makeCall(phone: string): Promise<boolean> {
  try {
    const url = `tel:${phone}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function sendTelegram(username: string, message: string): Promise<boolean> {
  try {
    const url = `https://t.me/${username}?text=${encodeURIComponent(message)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function triggerSOS(
  contacts: EmergencyContact[],
  latitude?: number,
  longitude?: number,
): Promise<string[]> {
  const message = buildSOSMessage(latitude, longitude);
  const notified: string[] = [];

  for (const contact of contacts) {
    const smsSent = await sendSMS(contact.phone, message);
    if (smsSent) notified.push(contact.id);

    if (contact.whatsapp) {
      await sendWhatsApp(contact.whatsapp, message);
    }
  }

  return notified;
}
