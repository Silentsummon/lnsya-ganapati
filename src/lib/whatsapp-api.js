const WHATSAPP_API_URL = "https://whatsapp.navyukth.tech"
const WHATSAPP_API_KEY = import.meta.env.VITE_WHATSAPP_API_KEY

/**
 * Send the templated "thank you for your contribution" message
 */
export async function sendThankYouMessage(phoneNumber, name, amount) {
  try {
    const response = await fetch(`${WHATSAPP_API_URL}/api/send-whatsapp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": WHATSAPP_API_KEY,
      },
      body: JSON.stringify({ phoneNumber, name, amount }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("WhatsApp error:", data.error)
      return { success: false, error: data.error }
    }

    return data
  } catch (error) {
    console.error("WhatsApp request failed:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Send any custom text message
 */
export async function sendCustomMessage(phoneNumber, message) {
  try {
    const response = await fetch(`${WHATSAPP_API_URL}/api/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": WHATSAPP_API_KEY,
      },
      body: JSON.stringify({ phoneNumber, message }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("WhatsApp error:", data.error)
      return { success: false, error: data.error }
    }

    return data
  } catch (error) {
    console.error("WhatsApp request failed:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Check if the WhatsApp bot is currently connected before sending
 */
export async function checkWhatsAppHealth() {
  try {
    const response = await fetch(`${WHATSAPP_API_URL}/health`)
    const data = await response.json()
    return data.whatsapp_ready
  } catch {
    return false
  }
}
