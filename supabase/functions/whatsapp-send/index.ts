// supabase/functions/whatsapp-send/index.ts
//
// Proxies all outbound WhatsApp sends so the API key never reaches the browser.
// Existing types: "thankyou" | "custom"
// NEW types added below: "pooja_confirmation" | "pooja_reminder"
//
// NOTE: swap WHATSAPP_POOJA_ENDPOINT below for the real path once you have the
// exact endpoint doc from the WhatsApp service. Body shape assumed:
//   { type: "confirmation" | "reminder", phoneNumber, name, date }
// Adjust field names to match whatever the endpoint actually expects.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const WHATSAPP_API_URL = Deno.env.get("WHATSAPP_API_URL")!; // e.g. https://whatsapp.navyukth.tech
const WHATSAPP_API_KEY = Deno.env.get("WHATSAPP_API_KEY")!;

const WHATSAPP_THANKYOU_ENDPOINT = "/api/send-whatsapp";
const WHATSAPP_CUSTOM_ENDPOINT = "/api/send-message";
// Placeholder — replace with the real path once you receive the endpoint spec
const WHATSAPP_POOJA_ENDPOINT = "/api/send-pooja-message";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, phoneNumber, name, amount, message, date } = body;

    let upstreamUrl: string;
    let upstreamBody: Record<string, unknown>;

    switch (type) {
      case "thankyou":
        upstreamUrl = `${WHATSAPP_API_URL}${WHATSAPP_THANKYOU_ENDPOINT}`;
        upstreamBody = { phoneNumber, name, amount };
        break;

      case "custom":
        upstreamUrl = `${WHATSAPP_API_URL}${WHATSAPP_CUSTOM_ENDPOINT}`;
        upstreamBody = { phoneNumber, message };
        break;

      case "pooja_confirmation":
        upstreamUrl = `${WHATSAPP_API_URL}${WHATSAPP_POOJA_ENDPOINT}`;
        upstreamBody = {
          messageKind: "confirmation", // adjust field name to match real endpoint
          phoneNumber,
          name,
          date,
        };
        break;

      case "pooja_reminder":
        upstreamUrl = `${WHATSAPP_API_URL}${WHATSAPP_POOJA_ENDPOINT}`;
        upstreamBody = {
          messageKind: "reminder", // adjust field name to match real endpoint
          phoneNumber,
          name,
          date,
        };
        break;

      default:
        return new Response(
          JSON.stringify({ error: `Unknown message type: ${type}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const upstreamRes = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": WHATSAPP_API_KEY,
      },
      body: JSON.stringify(upstreamBody),
    });

    const upstreamData = await upstreamRes.json().catch(() => ({}));

    return new Response(JSON.stringify(upstreamData), {
      status: upstreamRes.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
