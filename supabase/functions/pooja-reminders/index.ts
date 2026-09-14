import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WHATSAPP_API_URL = Deno.env.get("WHATSAPP_API_URL")!;
const WHATSAPP_API_KEY = Deno.env.get("WHATSAPP_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const POOJA_DATES: Record<number, { label: string; realDate: string }> = {
  1: { label: "14th Sept 2026, Monday", realDate: "2026-09-14" },
  2: { label: "15th Sept 2026, Tuesday", realDate: "2026-09-15" },
  3: { label: "16th Sept 2026, Wednesday", realDate: "2026-09-16" },
  4: { label: "17th Sept 2026, Thursday", realDate: "2026-09-17" },
  5: { label: "18th Sept 2026, Friday", realDate: "2026-09-18" },
  6: { label: "19th Sept 2026, Saturday", realDate: "2026-09-19" },
  7: { label: "20th Sept 2026, Sunday", realDate: "2026-09-20" },
  8: { label: "21st Sept 2026, Monday", realDate: "2026-09-21" },
  9: { label: "22nd Sept 2026, Tuesday", realDate: "2026-09-22" },
  10: { label: "23rd Sept 2026, Wednesday", realDate: "2026-09-23" },
  11: { label: "24th Sept 2026, Thursday", realDate: "2026-09-24" },
};

function todayAndTomorrowISO() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const toDateStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return [toDateStr(today), toDateStr(tomorrow)];
}

serve(async () => {
  try {
    const [todayStr, tomorrowStr] = todayAndTomorrowISO();

    const relevantDayNumbers = Object.entries(POOJA_DATES)
      .filter(([, v]) => v.realDate === todayStr || v.realDate === tomorrowStr)
      .map(([k]) => Number(k));

    if (relevantDayNumbers.length === 0) {
      return new Response(JSON.stringify({ message: "No poojas today or tomorrow." }), { status: 200 });
    }

    const { data: days, error: daysErr } = await supabase
      .from("pooja_days")
      .select("id, day_number")
      .in("day_number", relevantDayNumbers);

    if (daysErr) throw daysErr;
    if (!days || days.length === 0) {
      return new Response(JSON.stringify({ message: "No matching pooja_days rows." }), { status: 200 });
    }

    const dayIds = days.map((d) => d.id);
    const dayNumberById = Object.fromEntries(days.map((d) => [d.id, d.day_number]));

    const { data: checkins, error: checkinsErr } = await supabase
      .from("pooja_checkins")
      .select("id, name, phone, pooja_day_id, message_stage")
      .in("pooja_day_id", dayIds)
      .neq("message_stage", "reminder_sent");

    if (checkinsErr) throw checkinsErr;
    if (!checkins || checkins.length === 0) {
      return new Response(JSON.stringify({ message: "No check-ins to remind." }), { status: 200 });
    }

    let sent = 0;
    let failed = 0;

    for (const checkin of checkins) {
      const dayNumber = dayNumberById[checkin.pooja_day_id];
      const dateInfo = POOJA_DATES[dayNumber];
      const dateLabel = dateInfo?.label || `Day ${dayNumber}`;
      const isToday = dateInfo?.realDate === todayStr;
      const isTomorrow = dateInfo?.realDate === tomorrowStr;
      const whenPhrase = isToday
        ? `today (${dateLabel})`
        : isTomorrow
        ? `tomorrow (${dateLabel})`
        : dateLabel;

      const message = `Namaskar ${checkin.name} garu and family! 🙏
This is a gentle reminder from Lakshmi Narasima Swamy Youth Association that your pooja is scheduled for ${whenPhrase}. We kindly request you to arrive on time for your allotted slot. We look forward to welcoming you and your family at the Utsav!
Jai Ganesh! 🕉️`;

      try {
        const res = await fetch(`${WHATSAPP_API_URL}/api/send-message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": WHATSAPP_API_KEY,
          },
          body: JSON.stringify({ phoneNumber: checkin.phone, message }),
        });

        if (res.ok) {
          sent++;
          await supabase.from("pooja_checkins").update({ message_stage: "reminder_sent" }).eq("id", checkin.id);
        } else {
          failed++;
        }
      } catch {
        failed++;
      }

      await new Promise((r) => setTimeout(r, 1500));
    }

    return new Response(JSON.stringify({ total: checkins.length, sent, failed }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
