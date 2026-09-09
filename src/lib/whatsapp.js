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
