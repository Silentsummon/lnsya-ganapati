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

const POOJA_DATES = {
  1: '14th Sept 2026, Monday',
  2: '15th Sept 2026, Tuesday',
  3: '16th Sept 2026, Wednesday',
  4: '17th Sept 2026, Thursday',
  5: '18th Sept 2026, Friday',
  6: '19th Sept 2026, Saturday',
  7: '20th Sept 2026, Sunday',
  8: '21st Sept 2026, Monday',
  9: '22nd Sept 2026, Tuesday',
  10: '23rd Sept 2026, Wednesday',
  11: '24th Sept 2026, Thursday',
}

export function triggerPoojaConfirmation(phoneNumber, name, dayNumber) {
  const date = POOJA_DATES[dayNumber] || `Day ${dayNumber}`
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
