/**
 * WhatsApp Notification Service
 * Uses Ultramsg API (https://ultramsg.com) to send WhatsApp messages.
 * 
 * Setup: 
 *   1. Sign up at https://ultramsg.com
 *   2. Create an instance and scan QR code with your WhatsApp
 *   3. Copy your Instance ID and Token into the portal Settings → WhatsApp section
 */

// ─── Storage Keys ────────────────────────────────────────────────────────────
const WA_INSTANCE_KEY = 'wa_instance_id';
const WA_TOKEN_KEY    = 'wa_token';
const WA_ENABLED_KEY  = 'wa_enabled';
const WA_PHONE_KEY    = 'wa_teacher_phone';

// ─── Config Accessors ────────────────────────────────────────────────────────
export function getWAConfig() {
  return {
    instanceId: localStorage.getItem(WA_INSTANCE_KEY) ?? '',
    token:      localStorage.getItem(WA_TOKEN_KEY) ?? '',
    enabled:    localStorage.getItem(WA_ENABLED_KEY) === 'true',
    teacherPhone: localStorage.getItem(WA_PHONE_KEY) ?? '',
  };
}

export function saveWAConfig(config: {
  instanceId: string;
  token: string;
  enabled: boolean;
  teacherPhone: string;
}) {
  localStorage.setItem(WA_INSTANCE_KEY,  config.instanceId);
  localStorage.setItem(WA_TOKEN_KEY,     config.token);
  localStorage.setItem(WA_ENABLED_KEY,   String(config.enabled));
  localStorage.setItem(WA_PHONE_KEY,     config.teacherPhone);
}

// ─── Core Send Function ───────────────────────────────────────────────────────
/**
 * Sends a WhatsApp message via Ultramsg API.
 * Falls back to console logging in demo mode (no credentials).
 * 
 * @param to   Phone number in international format: 201012345678 (no + sign)
 * @param body Arabic/English message text
 * @returns    true if sent (or demo), false on error
 */
export async function sendWhatsApp(to: string, body: string): Promise<boolean> {
  const { instanceId, token, enabled } = getWAConfig();

  if (!enabled) {
    console.log('[WhatsApp] Disabled — skipping send');
    return false;
  }

  // Demo mode: no credentials entered yet
  if (!instanceId || !token) {
    console.log(`[WhatsApp DEMO] Would send to ${to}:\n${body}`);
    return true; // return true so UI shows success toast
  }

  try {
    const res = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token,
        to,
        body,
      }),
    });
    const data = await res.json();
    if (data.sent === 'true' || data.id) {
      return true;
    }
    console.error('[WhatsApp] Ultramsg error:', data);
    return false;
  } catch (err) {
    console.error('[WhatsApp] Network error:', err);
    return false;
  }
}

// ─── Bulk Send ────────────────────────────────────────────────────────────────
/**
 * Send a WhatsApp message to multiple phone numbers.
 * Adds 500ms delay between each send to avoid rate limits.
 */
export async function sendWhatsAppBulk(
  phones: string[],
  body: string
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const phone of phones) {
    if (!phone || phone.length < 10) { failed++; continue; }
    const ok = await sendWhatsApp(normalizePhone(phone), body);
    if (ok) sent++; else failed++;
    await delay(500);
  }
  return { sent, failed };
}

// ─── Phone Normalizer ─────────────────────────────────────────────────────────
/**
 * Converts Egyptian mobile numbers to international format.
 * e.g. 01012345678 → 201012345678
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('20')) return digits;         // already international
  if (digits.startsWith('0'))  return '2' + digits;   // 0XXXXXXXXX → 20XXXXXXXXX
  return '20' + digits;                               // raw 10-digit
}

// ─── Message Templates ────────────────────────────────────────────────────────

export const WA_TEMPLATES = {
  /** New lesson uploaded */
  newLesson: (teacherName: string, unitTitle: string, lessonTitle: string) =>
    `📚 *درس جديد تم رفعه!*\n\n` +
    `الأستاذ *${teacherName}* أضاف درسًا جديدًا:\n` +
    `📖 الوحدة: ${unitTitle}\n` +
    `▶️ الدرس: ${lessonTitle}\n\n` +
    `ادخل على المنصة وشاهده الآن! 🎯`,

  /** Live lecture started */
  liveStarted: (teacherName: string, lectureTitle: string, link: string) =>
    `🔴 *البث المباشر بدأ الآن!*\n\n` +
    `الأستاذ *${teacherName}* بدأ المحاضرة:\n` +
    `🎓 ${lectureTitle}\n\n` +
    `🔗 رابط الانضمام:\n${link}\n\n` +
    `لا تفوتك الحصة! ⚡`,

  /** Live lecture reminder (30 min before) */
  liveReminder: (teacherName: string, lectureTitle: string) =>
    `⏰ *تذكير: المحاضرة المباشرة بعد 30 دقيقة*\n\n` +
    `🎓 ${lectureTitle}\n` +
    `مع الأستاذ *${teacherName}*\n\n` +
    `جهّز نفسك وافتح المنصة عشان ما تتأخرش! 📱`,

  /** Test result */
  testResult: (studentName: string, testTitle: string, score: number, total: number, passed: boolean) => {
    const pct  = Math.round((score / total) * 100);
    const icon = passed ? '✅' : '❌';
    const msg  = passed ? 'أحسنت! اجتزت الاختبار بنجاح 🎉' : 'لا تيأس، راجع الشرح وأعد المحاولة 💪';
    return (
      `${icon} *نتيجة اختبارك جاهزة!*\n\n` +
      `👤 ${studentName}\n` +
      `📝 ${testTitle}\n` +
      `📊 النتيجة: ${score}/${total} (${pct}%)\n\n` +
      `${msg}`
    );
  },

  /** Payment confirmed */
  paymentConfirmed: (studentName: string, amount: number, plan: string) =>
    `💳 *تم تأكيد دفعتك بنجاح!*\n\n` +
    `👤 ${studentName}\n` +
    `💰 المبلغ: ${amount} جنيه\n` +
    `📦 الباقة: ${plan}\n\n` +
    `اشتراكك فعّال الآن — ادخل وابدأ المذاكرة! 🚀`,

  /** Welcome / registration */
  welcome: (studentName: string, teacherName: string) =>
    `🎉 *أهلاً وسهلاً ${studentName}!*\n\n` +
    `تم تسجيلك بنجاح في منصة الأستاذ *${teacherName}*.\n\n` +
    `يمكنك الآن:\n` +
    `📚 مشاهدة الدروس\n` +
    `📝 حل الاختبارات\n` +
    `🔴 حضور الحصص المباشرة\n\n` +
    `بالتوفيق في رحلتك التعليمية! 🌟`,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
