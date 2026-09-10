const FUNCTION_URL = "https://waursplxmwepnsxqneig.supabase.co/functions/v1/whatsapp-send"

export async function sendThankYouMessage(phoneNumber, name, amount) {
  try {
    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "thankyou", phoneNumber, name, amount }),
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

export async function sendCustomMessage(phoneNumber, message) {
  try {
    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "custom", phoneNumber, message }),
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
