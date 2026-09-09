import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY
const RETRY_INTERVAL_MS = parseInt(process.env.RETRY_INTERVAL_MS || '1200000', 10)

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !WHATSAPP_API_URL || !WHATSAPP_API_KEY) {
  console.error('Missing required env vars. Check SUPABASE_URL, SUPABASE_SERVICE_KEY, WHATSAPP_API_URL, WHATSAPP_API_KEY.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function sendWhatsApp(phone, name, amount) {
  const res = await fetch(`${WHATSAPP_API_URL}/api/send-whatsapp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': WHATSAPP_API_KEY,
    },
    body: JSON.stringify({ phoneNumber: phone, name, amount }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`WhatsApp API responded ${res.status}: ${text}`)
  }
}

async function runSweep() {
  console.log(`[${new Date().toISOString()}] Checking for unsent chandha messages...`)

  const { data: pending, error } = await supabase
    .from('chandha_entries')
    .select('*')
    .eq('message_sent', false)

  if (error) {
    console.error('Failed to fetch pending entries:', error.message)
    return
  }

  if (!pending || pending.length === 0) {
    console.log('Nothing to retry.')
    return
  }

  console.log(`Found ${pending.length} unsent message(s). Retrying...`)

  for (const entry of pending) {
    try {
      await sendWhatsApp(entry.phone, entry.name, entry.amount)
      const { error: updateErr } = await supabase
        .from('chandha_entries')
        .update({ message_sent: true })
        .eq('id', entry.id)
      if (updateErr) {
        console.error(`Sent but failed to mark ${entry.id} as sent:`, updateErr.message)
      } else {
        console.log(`✓ Sent and marked: ${entry.name} (${entry.phone})`)
      }
    } catch (err) {
      console.error(`✗ Failed to send to ${entry.name} (${entry.phone}):`, err.message)
    }
    // small delay between sends to avoid hammering the WhatsApp API
    await new Promise(r => setTimeout(r, 2000))
  }
}

console.log(`Retry worker started. Checking every ${RETRY_INTERVAL_MS / 1000 / 60} minutes.`)
runSweep()
setInterval(runSweep, RETRY_INTERVAL_MS)
