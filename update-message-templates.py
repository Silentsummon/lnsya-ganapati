#!/usr/bin/env python3
import sys

path = "src/lib/whatsapp.js"

old_confirmation = """export function triggerPoojaConfirmation(phoneNumber, name, date) {
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

new_confirmation = """export function triggerPoojaConfirmation(phoneNumber, name, date) {
  const message = `Namaskar ${name} garu and family! 🙏
This is Lakshmi Narasima Swamy Youth Association. We're happy to confirm your pooja slot for ${date}. We look forward to welcoming you and your family and having you be a part of this year's Utsav. Thank you for joining us!
Jai Ganesh! 🕉️`
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

old_reminder = """export function triggerPoojaReminder(phoneNumber, name, date) {
  const message = `Namaskar ${name} garu! 🙏 This is a reminder that your pooja is scheduled for ${date}. Please make sure to arrive on time. See you there!`
  fetch(`${WHATSAPP_API_URL}/api/send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': WHATSAPP_API_KEY,
    },
    body: JSON.stringify({ phoneNumber, message }),
  }).catch((err) => {
    console.warn('Pooja reminder trigger failed:', err.message)
  })
}"""

new_reminder = """export function triggerPoojaReminder(phoneNumber, name, date) {
  const message = `Namaskar ${name} garu and family! 🙏
This is a gentle reminder from Lakshmi Narasima Swamy Youth Association that your pooja is scheduled for ${date}. We kindly request you to arrive on time for your allotted slot. We look forward to welcoming you and your family at the Utsav!
Jai Ganesh! 🕉️`
  fetch(`${WHATSAPP_API_URL}/api/send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': WHATSAPP_API_KEY,
    },
    body: JSON.stringify({ phoneNumber, message }),
  }).catch((err) => {
    console.warn('Pooja reminder trigger failed:', err.message)
  })
}"""

with open(path, "r") as f:
    content = f.read()

made_changes = False

if old_confirmation in content:
    content = content.replace(old_confirmation, new_confirmation)
    made_changes = True
    print("Confirmation template updated.")
else:
    print("WARNING: confirmation block not found as expected — skipped.")

if old_reminder in content:
    content = content.replace(old_reminder, new_reminder)
    made_changes = True
    print("Reminder template updated.")
else:
    print("WARNING: reminder block not found as expected — skipped.")

if made_changes:
    with open(path, "w") as f:
        f.write(content)
    print("File saved.")
else:
    print("No changes made — nothing matched.")
