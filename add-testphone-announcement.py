#!/usr/bin/env python3
path = "src/store/appStore.js"

with open(path, "r") as f:
    content = f.read()

old = """  sendAnnouncement: async (message, mediaUrl, mediaType) => {
    const { chandha } = get()
    if (!message || !message.trim()) {
      return { success: false, error: 'Message is empty' }
    }

    // Dedupe by phone number, skip blanks
    const seen = new Set()
    const recipients = []
    for (const c of chandha) {
      const phone = (c.phone || '').trim()
      if (!phone) continue
      if (seen.has(phone)) continue
      seen.add(phone)
      recipients.push({ name: c.name, phone })
    }"""

new = """  sendAnnouncement: async (message, mediaUrl, mediaType, testPhone) => {
    const { chandha } = get()
    if (!message || !message.trim()) {
      return { success: false, error: 'Message is empty' }
    }

    let recipients = []
    if (testPhone && testPhone.trim()) {
      // TEST MODE: only send to this one number
      recipients = [{ name: 'Test', phone: testPhone.trim() }]
    } else {
      // Dedupe by phone number, skip blanks
      const seen = new Set()
      for (const c of chandha) {
        const phone = (c.phone || '').trim()
        if (!phone) continue
        if (seen.has(phone)) continue
        seen.add(phone)
        recipients.push({ name: c.name, phone })
      }
    }"""

if old not in content:
    print("WARNING: exact block not found, no changes made.")
else:
    content = content.replace(old, new)
    with open(path, "w") as f:
        f.write(content)
    print("sendAnnouncement now supports testPhone override.")
