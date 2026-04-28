import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RecordData {
  id: string;
  baby_id: string;
  type: string;
  start_time: string;
  end_time: string | null;
  notes: Record<string, unknown> | null;
}

const langConfig: Record<string, {
  noRecords: string;
  systemPrompt: string;
  userPrompt: (name: string, summary: string) => string;
  typeLabels: Record<string, string>;
  sleepLabel: (count: number, h: number, m: number) => string;
  feedingLabel: (count: number, ml: number) => string;
  nightWakeLabel: (count: number, mins: number) => string;
  diaperLabel: (count: number, wet: number, dirty: number, both: number) => string;
  timelineHeader: string;
}> = {
  zh: {
    noRecords: "今天還沒有任何紀錄。開始記錄寶寶的活動吧！",
    systemPrompt: `你是一位專業且溫暖的育兒顧問。你的任務是分析寶寶一天的活動數據，並提供簡潔、有洞察力的睡前總結。

語氣要求：
- 溫暖、鼓勵、專業
- 不要過度擔憂或製造焦慮
- 用繁體中文回答
- 保持簡潔，重點突出

回答格式：
1. 一句話概括今天的整體狀況（用 emoji 開頭）
2. 2-3 個關鍵觀察點
3. 一個溫馨的睡前建議或鼓勵

字數限制：總共不超過 200 字`,
    userPrompt: (name, summary) => `這是 ${name} 今天的活動紀錄：\n\n${summary}\n\n請提供今天的睡前總結。`,
    typeLabels: { sleep: "睡眠", feeding: "餵奶", night_wake: "夜醒", diaper: "尿布", bath: "沐浴", potty: "便壺", water: "喝水", solid_food: "輔食" },
    sleepLabel: (count, h, m) => `睡眠：共 ${count} 次，總計 ${h} 小時 ${m} 分鐘`,
    feedingLabel: (count, ml) => `餵奶：共 ${count} 次，總計 ${ml} ml`,
    nightWakeLabel: (count, mins) => `夜醒：共 ${count} 次，總計 ${mins} 分鐘`,
    diaperLabel: (count, wet, dirty, both) => `尿布：共 ${count} 次（濕 ${wet}、髒 ${dirty}、兩者 ${both}）`,
    timelineHeader: "\n時間軸：",
  },
  en: {
    noRecords: "No records yet today. Start recording your baby's activities!",
    systemPrompt: `You are a professional and warm parenting consultant. Your task is to analyze the baby's daily activity data and provide a concise, insightful bedtime summary.

Tone:
- Warm, encouraging, professional
- Don't over-worry or create anxiety
- Reply in English
- Keep it concise and focused

Format:
1. One sentence overview of today (start with emoji)
2. 2-3 key observations
3. One warm bedtime suggestion or encouragement

Word limit: no more than 200 words total`,
    userPrompt: (name, summary) => `Here are ${name}'s activity records for today:\n\n${summary}\n\nPlease provide today's bedtime summary.`,
    typeLabels: { sleep: "Sleep", feeding: "Feeding", night_wake: "Night Wake", diaper: "Diaper", bath: "Bath", potty: "Potty", water: "Water", solid_food: "Solid Food" },
    sleepLabel: (count, h, m) => `Sleep: ${count} times, total ${h}h ${m}m`,
    feedingLabel: (count, ml) => `Feeding: ${count} times, total ${ml} ml`,
    nightWakeLabel: (count, mins) => `Night Wake: ${count} times, total ${mins} minutes`,
    diaperLabel: (count, wet, dirty, both) => `Diaper: ${count} times (wet ${wet}, dirty ${dirty}, both ${both})`,
    timelineHeader: "\nTimeline:",
  },
  ms: {
    noRecords: "Belum ada rekod hari ini. Mula merekod aktiviti bayi anda!",
    systemPrompt: `Anda adalah perunding keibubapaan yang profesional dan mesra. Tugas anda adalah menganalisis data aktiviti harian bayi dan memberikan ringkasan waktu tidur yang ringkas dan berwawasan.

Nada:
- Mesra, menggalakkan, profesional
- Jangan terlalu risau atau menimbulkan kebimbangan
- Jawab dalam Bahasa Melayu
- Ringkas dan fokus

Format:
1. Satu ayat gambaran keseluruhan hari ini (mulakan dengan emoji)
2. 2-3 pemerhatian utama
3. Satu cadangan waktu tidur yang mesra atau galakan

Had perkataan: tidak lebih daripada 200 patah perkataan`,
    userPrompt: (name, summary) => `Berikut adalah rekod aktiviti ${name} hari ini:\n\n${summary}\n\nSila berikan ringkasan waktu tidur hari ini.`,
    typeLabels: { sleep: "Tidur", feeding: "Penyusuan", night_wake: "Bangun Malam", diaper: "Lampin", bath: "Mandi", potty: "Pispot", water: "Air", solid_food: "Makanan Pepejal" },
    sleepLabel: (count, h, m) => `Tidur: ${count} kali, jumlah ${h}j ${m}m`,
    feedingLabel: (count, ml) => `Penyusuan: ${count} kali, jumlah ${ml} ml`,
    nightWakeLabel: (count, mins) => `Bangun Malam: ${count} kali, jumlah ${mins} minit`,
    diaperLabel: (count, wet, dirty, both) => `Lampin: ${count} kali (basah ${wet}, kotor ${dirty}, kedua-dua ${both})`,
    timelineHeader: "\nGaris Masa:",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Supabase environment variables are not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { babyId, babyName, date, dayStart, dayEnd, localDate, timezoneOffset, language } = await req.json();
    const lang = (language && langConfig[language]) ? language : "zh";
    const cfg = langConfig[lang];

    if (!babyId) {
      return new Response(
        JSON.stringify({ error: "Missing babyId parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const targetDate = localDate || date || new Date().toISOString().split("T")[0];
    const startBound = dayStart || `${targetDate}T00:00:00.000Z`;
    const endBound = dayEnd || `${targetDate}T23:59:59.999Z`;

    const { data: records, error: recordsError } = await supabase
      .from("records")
      .select("*")
      .eq("baby_id", babyId)
      .gte("start_time", startBound)
      .lte("start_time", endBound)
      .order("start_time", { ascending: true });

    if (recordsError) {
      console.error("Error fetching records:", recordsError);
      throw new Error("Failed to fetch records");
    }

    const prevDayStart = new Date(new Date(startBound).getTime() - 24 * 60 * 60 * 1000).toISOString();
    const { data: carryOverRecords } = await supabase
      .from("records")
      .select("*")
      .eq("baby_id", babyId)
      .gte("start_time", prevDayStart)
      .lt("start_time", startBound)
      .in("type", ["sleep", "night_wake"])
      .order("start_time", { ascending: true });

    const validCarryOver = (carryOverRecords || []).filter((r: RecordData) => {
      const notes = r.notes as { duration_minutes?: number } | null;
      if (!notes?.duration_minutes) return false;
      const endTime = new Date(r.start_time).getTime() + notes.duration_minutes * 60000;
      return endTime > new Date(startBound).getTime();
    });

    const allRecords = [...(records || []), ...validCarryOver] as RecordData[];

    if (allRecords.length === 0) {
      return new Response(
        JSON.stringify({
          summary: cfg.noRecords,
          hasRecords: false,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recordsSummary = prepareRecordsSummary(allRecords, timezoneOffset ?? 0, startBound, endBound, cfg);

    const aiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-5.2",
          messages: [
            { role: "system", content: cfg.systemPrompt },
            { role: "user", content: cfg.userPrompt(babyName || "Baby", recordsSummary) },
          ],
          max_completion_tokens: 500,
          temperature: 0.7,
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI service busy, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI quota exhausted" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const summary = aiData.choices?.[0]?.message?.content || "";

    console.log("Bedtime summary generated successfully for baby:", babyId);

    return new Response(
      JSON.stringify({
        summary,
        hasRecords: true,
        recordCount: allRecords.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("bedtime-summary error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function prepareRecordsSummary(records: RecordData[], timezoneOffset: number, startBound: string, endBound: string, cfg: typeof langConfig["zh"]): string {
  const lines: string[] = [];

  const byType: Record<string, RecordData[]> = {};
  for (const record of records) {
    if (!byType[record.type]) {
      byType[record.type] = [];
    }
    byType[record.type].push(record);
  }

  if (byType.sleep) {
    let totalMinutes = 0;
    const targetDayStart = new Date(startBound).getTime();
    const targetDayEnd = new Date(endBound).getTime();
    for (const r of byType.sleep) {
      const notes = r.notes as { duration_minutes?: number } | null;
      if (notes?.duration_minutes) {
        const recStart = new Date(r.start_time).getTime();
        const recEnd = recStart + notes.duration_minutes * 60000;
        const overlapStart = Math.max(recStart, targetDayStart);
        const overlapEnd = Math.min(recEnd, targetDayEnd);
        if (overlapEnd > overlapStart) {
          totalMinutes += Math.round((overlapEnd - overlapStart) / 60000);
        }
      }
    }
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    lines.push(cfg.sleepLabel(byType.sleep.length, hours, mins));
  }

  if (byType.feeding) {
    let totalMl = 0;
    for (const r of byType.feeding) {
      const notes = r.notes as { amount_ml?: number } | null;
      if (notes?.amount_ml) {
        totalMl += notes.amount_ml;
      }
    }
    lines.push(cfg.feedingLabel(byType.feeding.length, totalMl));
  }

  if (byType.night_wake) {
    let totalMinutes = 0;
    for (const r of byType.night_wake) {
      const notes = r.notes as { duration_minutes?: number } | null;
      if (notes?.duration_minutes) {
        totalMinutes += notes.duration_minutes;
      }
    }
    lines.push(cfg.nightWakeLabel(byType.night_wake.length, totalMinutes));
  }

  if (byType.diaper) {
    const types: Record<string, number> = { wet: 0, dirty: 0, both: 0 };
    for (const r of byType.diaper) {
      const notes = r.notes as { diaper_type?: string } | null;
      const dt = notes?.diaper_type || "wet";
      types[dt] = (types[dt] || 0) + 1;
    }
    lines.push(cfg.diaperLabel(byType.diaper.length, types.wet, types.dirty, types.both));
  }

  lines.push(cfg.timelineHeader);
  for (const record of records) {
    const utcDate = new Date(record.start_time);
    const localDate = new Date(utcDate.getTime() - timezoneOffset * 60000);
    const time = localDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    });
    lines.push(`- ${time} ${cfg.typeLabels[record.type] || record.type}`);
  }

  return lines.join("\n");
}
