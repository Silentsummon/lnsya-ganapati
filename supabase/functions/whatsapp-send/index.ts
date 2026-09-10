import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const WHATSAPP_API_URL = "https://whatsapp.navyukth.tech"
const WHATSAPP_API_KEY = Deno.env.get("WHATSAPP_API_KEY")

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { type, phoneNumber, name, amount, message } = await req.json()

    let endpoint = ""
    let body = {}

    if (type === "thankyou") {
      endpoint = "/api/send-whatsapp"
      body = { phoneNumber, name, amount }
    } else if (type === "custom") {
      endpoint = "/api/send-message"
      body = { phoneNumber, message }
    } else {
      return new Response(JSON.stringify({ success: false, error: "Invalid type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const response = await fetch(`${WHATSAPP_API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": WHATSAPP_API_KEY,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: response.ok ? 200 : response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
