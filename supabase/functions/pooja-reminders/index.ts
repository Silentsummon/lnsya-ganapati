// supabase/functions/pooja-reminders/index.ts
//
// Scheduled Edge Function — set up via Supabase's cron scheduler to run daily
// at ~6 AM (see setup notes at the bottom). Finds everyone checked into a
// pooja slot happening TODAY or TOMORROW and sends them a reminder.
//
// Deploy: supabase functions deploy pooja-reminders
// Schedule: supabase functions deploy pooja-reminders --no-verify-jwt
//           then set up the cron trigger in the Supabase dashboard
//           (Edge Functions -> pooja-reminders -> Add cron schedule -> "0 0 * * *"
//           for 6 AM IST, since Supabase cron runs in UTC: 6:00 IST = 00:30 UTC,
//           so use "30 0 * * *")

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WHATSAPP_SEND_URL = `${SUPABASE_URL}/functions/v1/whatsapp-send`;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function todayAndTomorrowISO() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Build YYYY-MM-DD from local fields, same fix as Bug #3 in the doc —
  // avoid toISOString() which shifts the date in IST.
  const toDateStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  return [toDateStr(today), toDateStr(tomorrow)];
}

serve(async () => {
  try {
    const [todayStr, tomorrowStr] = todayAndTomorrowISO();

    // Find pooja_days happening today or tomorrow
    const { data: days, error: daysErr } = await supabase
      .from("pooja_days")
      .select("id, day_number, pooja_date")
      .in("pooja_date", [todayStr, tomorrowStr]);

    if (daysErr) throw daysErr;
    if (!days || days.length === 0) {
      return new Response(JSON.stringify({ message: "No poojas today or tomorrow." }), {
        status: 200,
      });
    }

    const dayIds = days.map((d) => d.id);

    // Find everyone checked into those days (both slots)
    const { data: checkins, error: checkinsErr } = await supabase
      .from("pooja_checkins")
      .select("id, name, phone, pooja_day_id")
      .in("pooja_day_id", dayIds);

    if (checkinsErr) throw checkinsErr;
    if (!checkins || checkins.length === 0) {
      return new Response(JSON.stringify({ message: "No check-ins to remind." }), {
        status: 200,
      });
    }

    const dayById = Object.fromEntries(days.map((d) => [d.id, d]));

    let sent = 0;
    let failed = 0;

    for (const checkin of checkins) {
      const day = dayById[checkin.pooja_day_id];
      const dateLabel =
        day.pooja_date === todayStr
          ? `today (${day.pooja_date})`
          : `tomorrow (${day.pooja_date})`;

      try {
        const res = await fetch(WHATSAPP_SEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "pooja_reminder",
            phoneNumber: checkin.phone,
            name: checkin.name,
            date: dateLabel,
          }),
        });
        if (res.ok) {
          sent++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }

      // Small delay between sends to avoid spam-flagging, same pattern as
      // broadcastEventAnnouncement in the store.
      await new Promise((r) => setTimeout(r, 1500));
    }

    return new Response(JSON.stringify({ total: checkins.length, sent, failed }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});

/**
 * SETUP NOTES:
 * - Needs SUPABASE_SERVICE_ROLE_KEY set as a secret for this function
 *   (same key your retry-worker.js already uses).
 * - This sends a reminder EVERY day a check-in matches today/tomorrow — so
 *   someone checked in for Day 3 gets ONE reminder when Day 3 is "tomorrow"
 *   and ONE more when it's "today". If you only want one reminder total,
 *   let me know and we can add a `reminder_sent` tracking column.
 */
