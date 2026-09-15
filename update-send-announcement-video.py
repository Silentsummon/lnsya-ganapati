#!/usr/bin/env python3
path = "src/store/appStore.js"

with open(path, "r") as f:
    content = f.read()

old = """  sendAnnouncement: async (message, imageUrl) => {
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
    }

    let imageBlob = null
    if (imageUrl) {
      try {
        const res = await fetch(imageUrl)
        imageBlob = await res.blob()
      } catch (err) {
        console.warn('Failed to fetch announcement image for sending:', err.message)
      }
    }

    let sent = 0
    let failed = 0
    const failedRecipients = []

    for (const r of recipients) {
      try {
        let res
        if (imageBlob) {
          const formData = new FormData()
          formData.append('phoneNumber', r.phone)
          const file = new File([imageBlob], 'announcement.jpg', { type: imageBlob.type || 'image/jpeg' })
          formData.append('file', file)
          formData.append('caption', message)
          res = await fetch('https://whatsapp.navyukth.tech/api/send-media', {
            method: 'POST',
            headers: { 'X-API-Key': 'Wx7qWhDE0QnHm8kj7QdR8U9eGZQxwnMWxnmIW7jJXfY=' },
            body: formData,
          })
        } else {
          res = await fetch('https://whatsapp.navyukth.tech/api/send-message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': 'Wx7qWhDE0QnHm8kj7QdR8U9eGZQxwnMWxnmIW7jJXfY=',
            },
            body: JSON.stringify({ phoneNumber: r.phone, message }),
          })
        }
        if (res.ok) {
          sent++
        } else {
          failed++
          failedRecipients.push({ name: r.name, phone: r.phone })
        }
      } catch (err) {
        failed++
        failedRecipients.push({ name: r.name, phone: r.phone })
      }

      if (r !== recipients[recipients.length - 1]) {
        const delay = Math.floor(Math.random() * 5001) + 5000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    return { success: true, total: recipients.length, sent, failed, failedRecipients }
  },"""

new = """  sendAnnouncement: async (message, mediaUrl, mediaType) => {
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
    }

    let mediaBlob = null
    if (mediaUrl) {
      try {
        const res = await fetch(mediaUrl)
        mediaBlob = await res.blob()
      } catch (err) {
        console.warn('Failed to fetch announcement media for sending:', err.message)
      }
    }

    let sent = 0
    let failed = 0
    const failedRecipients = []

    for (const r of recipients) {
      try {
        let res
        if (mediaBlob) {
          const formData = new FormData()
          formData.append('phoneNumber', r.phone)

          let file
          if (mediaType === 'video') {
            // Explicitly force video/mp4, matching the working reference implementation
            file = new File([mediaBlob], 'announcement.mp4', { type: 'video/mp4' })
          } else {
            file = new File([mediaBlob], 'announcement.jpg', { type: mediaBlob.type || 'image/jpeg' })
          }
          formData.append('file', file)
          formData.append('caption', message)

          res = await fetch('https://whatsapp.navyukth.tech/api/send-media', {
            method: 'POST',
            headers: { 'X-API-Key': 'Wx7qWhDE0QnHm8kj7QdR8U9eGZQxwnMWxnmIW7jJXfY=' },
            body: formData,
          })
        } else {
          res = await fetch('https://whatsapp.navyukth.tech/api/send-message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': 'Wx7qWhDE0QnHm8kj7QdR8U9eGZQxwnMWxnmIW7jJXfY=',
            },
            body: JSON.stringify({ phoneNumber: r.phone, message }),
          })
        }
        if (res.ok) {
          sent++
        } else {
          failed++
          failedRecipients.push({ name: r.name, phone: r.phone })
        }
      } catch (err) {
        failed++
        failedRecipients.push({ name: r.name, phone: r.phone })
      }

      if (r !== recipients[recipients.length - 1]) {
        const delay = Math.floor(Math.random() * 5001) + 5000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    return { success: true, total: recipients.length, sent, failed, failedRecipients }
  },"""

if old not in content:
    print("WARNING: exact sendAnnouncement block not found, no changes made.")
else:
    content = content.replace(old, new)
    with open(path, "w") as f:
        f.write(content)
    print("sendAnnouncement updated with video support.")
