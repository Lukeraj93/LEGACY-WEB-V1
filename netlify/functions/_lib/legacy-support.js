"use strict";

const LEGACY_SUPPORT_EMAIL = "support@legacycoaching.com.my";
const LEGACY_SUPPORT_WHATSAPP_NUMBER = "601139772862";
const LEGACY_SUPPORT_WHATSAPP_DISPLAY = "+60 11-3977 2862";
const LEGACY_SUPPORT_WHATSAPP_URL = `https://wa.me/${LEGACY_SUPPORT_WHATSAPP_NUMBER}`;
const LEGACY_OFFICE_ADDRESS = "No 11A Level 1 Jalan Telawi 3 Bangsar Baru, 59100 Kuala Lumpur, Wilayah Persekutuan Malaysia";

function buildSupportTextLines() {
  return [
    `Email: ${LEGACY_SUPPORT_EMAIL}`,
    `WhatsApp: ${LEGACY_SUPPORT_WHATSAPP_DISPLAY}`,
    `Office: ${LEGACY_OFFICE_ADDRESS}`,
  ];
}

module.exports = {
  LEGACY_OFFICE_ADDRESS,
  LEGACY_SUPPORT_EMAIL,
  LEGACY_SUPPORT_WHATSAPP_DISPLAY,
  LEGACY_SUPPORT_WHATSAPP_NUMBER,
  LEGACY_SUPPORT_WHATSAPP_URL,
  buildSupportTextLines,
};
