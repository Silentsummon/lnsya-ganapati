const WHATSAPP_API_URL = "https://whatsapp.navyukth.tech"
const WHATSAPP_API_KEY = "Wx7qWhDE0QnHm8kj7QdR8U9eGZQxwnMWxnmIW7jJXfY="

export function triggerWhatsAppSend(phoneNumber, name, amount) {
  fetch(`${WHATSAPP_API_URL}/api/send-whatsapp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': WHATSAPP_API_KEY,
    },
    body: JSON.stringify({ phoneNumber, name, amount }),
  }).catch((err) => {
    console.warn('WhatsApp trigger failed, retry-worker will pick it up:', err.message)
  })
}

export function triggerPoojaConfirmation(phoneNumber, name, date) {
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
}

export function triggerPoojaReminder(phoneNumber, name, date) {
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
}
