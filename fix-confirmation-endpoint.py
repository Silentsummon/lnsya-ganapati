#!/usr/bin/env python3
import sys

path = "src/lib/whatsapp.js"

old = """export function triggerPoojaConfirmation(phoneNumber, name, date) {
  fetch(`${WHATSAPP_API_URL}/api/send-pooja-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': WHATSAPP_API_KEY,
    },
    body: JSON.stringify({ messageKind: 'confirmation', phoneNumber, name, date }),
  }).catch((err) => {
    console.warn('Pooja confirmation trigger failed:', err.message)
  })
}"""

new = """export function triggerPoojaConfirmation(phoneNumber, name, date) {
  const message = `Namaskar ${name} garu! 🙏 Your pooja slot has been confirmed for ${date}. We look forward to your presence. Thank you for being part of the Utsav!`
  fetch(`${WHATSAPP_API_URL}/api/send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': WHATSAPP_API_KEY,
    },
    body: JSON.stringify({ phoneNumber, message }),
  }).catch((err) => {
    console.warn('Pooja confirmation trigger failed:', err.message)
  })
}"""

with open(path, "r") as f:
    content = f.read()

if old not in content:
    print("ERROR: exact block not found — file may have changed. No edits made.")
    sys.exit(1)

content = content.replace(old, new)

with open(path, "w") as f:
    f.write(content)

print("triggerPoojaConfirmation updated to use /api/send-message.")
