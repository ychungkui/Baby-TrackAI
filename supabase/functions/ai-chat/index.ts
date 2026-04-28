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

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const langPrompts: Record<string, {
  noRecords: string;
  systemBase: string;
  replyLang: string;
  ageLabel: (name: string, age: string, birthDate: string) => string;
  disclaimer: string;
  typeLabels: Record<string, string>;
}> = {
  zh: {
    noRecords: "目前沒有最近 7 天的紀錄。",
    systemBase: `你是一位專業且溫暖的育兒顧問 AI 助手。你的名字是「寶寶助手」。

你的角色：
- 幫助家長回答育兒相關問題
- 提供溫暖、鼓勵、專業的建議
- 以繁體中文回答
- 保持簡潔，重點突出
- 不要過度擔憂或製造焦慮`,
    replyLang: "繁體中文",
    ageLabel: (name, age, birthDate) => `\n\n寶寶的基本資料：\n- 名字：${name}\n- 年齡：${age}（出生日期：${birthDate}）\n\n請根據寶寶的年齡階段，提供適合該月齡的育兒建議。不同月齡的發展重點不同，請注意區分。`,
    disclaimer: "⚠️ 此建議僅供參考，不構成醫療建議。如有健康疑慮，請諮詢專業醫師。",
    typeLabels: { sleep: "睡眠", feeding: "餵奶", night_wake: "夜醒", diaper: "尿布", bath: "沐浴", potty: "便壺", water: "喝水", solid_food: "輔食" },
  },
  en: {
    noRecords: "No records from the last 7 days.",
    systemBase: `You are a professional and warm parenting consultant AI assistant. Your name is "Baby Assistant".

Your role:
- Help parents answer parenting-related questions
- Provide warm, encouraging, professional advice
- Reply in English
- Keep it concise and focused
- Don't over-worry or create anxiety`,
    replyLang: "English",
    ageLabel: (name, age, birthDate) => `\n\nBaby's info:\n- Name: ${name}\n- Age: ${age} (Birth date: ${birthDate})\n\nPlease provide age-appropriate parenting advice based on the baby's developmental stage.`,
    disclaimer: "⚠️ This advice is for reference only and does not constitute medical advice. If you have health concerns, please consult a professional doctor.",
    typeLabels: { sleep: "Sleep", feeding: "Feeding", night_wake: "Night Wake", diaper: "Diaper", bath: "Bath", potty: "Potty", water: "Water", solid_food: "Solid Food" },
  },
  ms: {
    noRecords: "Tiada rekod daripada 7 hari terakhir.",
    systemBase: `Anda adalah pembantu AI perunding keibubapaan yang profesional dan mesra. Nama anda ialah "Pembantu Bayi".

Peranan anda:
- Membantu ibu bapa menjawab soalan berkaitan keibubapaan
- Memberikan nasihat yang mesra, menggalakkan, dan profesional
- Jawab dalam Bahasa Melayu
- Ringkas dan fokus
- Jangan terlalu risau atau menimbulkan kebimbangan`,
    replyLang: "Bahasa Melayu",
    ageLabel: (name, age, birthDate) => `\n\nMaklumat bayi:\n- Nama: ${name}\n- Umur: ${age} (Tarikh lahir: ${birthDate})\n\nSila berikan nasihat keibubapaan yang sesuai berdasarkan peringkat perkembangan bayi.`,
    disclaimer: "⚠️ Nasihat ini untuk rujukan sahaja dan tidak membentuk nasihat perubatan. Jika ada kebimbangan kesihatan, sila rujuk doktor profesional.",
    typeLabels: { sleep: "Tidur", feeding: "Penyusuan", night_wake: "Bangun Malam", diaper: "Lampin", bath: "Mandi", potty: "Pispot", water: "Air", solid_food: "Makanan Pepejal" },
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

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, babyId, babyName, babyBirthDate, language } = await req.json() as {
      messages: ChatMessage[];
      babyId: string;
      babyName?: string;
      babyBirthDate?: string;
      language?: string;
    };

    const lang = (language && langPrompts[language]) ? language : "zh";
    const cfg = langPrompts[lang];

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing messages parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!babyId) {
      return new Response(
        JSON.stringify({ error: "Missing babyId parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDate = sevenDaysAgo.toISOString();

    const { data: records, error: recordsError } = await supabase
      .from("records")
      .select("*")
      .eq("baby_id", babyId)
      .gte("start_time", startDate)
      .order("start_time", { ascending: true });

    if (recordsError) {
      console.error("Error fetching records:", recordsError);
    }

    const recordsSummary = records && records.length > 0
      ? prepareRecordsSummary(records as RecordData[], cfg.typeLabels)
      : cfg.noRecords;

    console.log(`AI chat: ${records?.length || 0} records found for baby ${babyId}`);

    let ageInfo = "";
    if (babyBirthDate) {
      const birth = new Date(babyBirthDate);
      const now = new Date();
      let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
      let days = now.getDate() - birth.getDate();
      if (days < 0) {
        months--;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (months < 0) { months = 0; days = 0; }
      const years = Math.floor(months / 12);
      const remainMonths = months % 12;
      const ageParts: string[] = [];
      if (lang === "zh") {
        if (years > 0) ageParts.push(`${years}歲`);
        if (remainMonths > 0) ageParts.push(`${remainMonths}個月`);
        if (days > 0 || ageParts.length === 0) ageParts.push(`${days}天`);
      } else if (lang === "ms") {
        if (years > 0) ageParts.push(`${years} tahun`);
        if (remainMonths > 0) ageParts.push(`${remainMonths} bulan`);
        if (days > 0 || ageParts.length === 0) ageParts.push(`${days} hari`);
      } else {
        if (years > 0) ageParts.push(`${years} year${years > 1 ? 's' : ''}`);
        if (remainMonths > 0) ageParts.push(`${remainMonths} month${remainMonths > 1 ? 's' : ''}`);
        if (days > 0 || ageParts.length === 0) ageParts.push(`${days} day${days > 1 ? 's' : ''}`);
      }
      ageInfo = cfg.ageLabel(babyName || "Baby", ageParts.join(" "), babyBirthDate);
    }

    const babyLabel = babyName || "Baby";
    const systemPrompt = `${cfg.systemBase}
${ageInfo}

${lang === "zh" ? `以下是 ${babyLabel} 最近 7 天的行為紀錄摘要，請在回答時參考：` : lang === "ms" ? `Berikut adalah ringkasan rekod aktiviti ${babyLabel} 7 hari terakhir, sila rujuk semasa menjawab:` : `Here is ${babyLabel}'s activity record summary for the last 7 days, please reference when answering:`}

${recordsSummary}

${lang === "zh" ? "重要規則：" : lang === "ms" ? "Peraturan penting:" : "Important rules:"}
- ${lang === "zh" ? "每次回覆的結尾都要附加一行：" : lang === "ms" ? "Setiap jawapan mesti berakhir dengan satu baris:" : "Every reply must end with:"}「${cfg.disclaimer}」
- ${lang === "zh" ? "如果問題與育兒無關，請禮貌地引導回育兒話題" : lang === "ms" ? "Jika soalan tidak berkaitan keibubapaan, arahkan kembali dengan sopan" : "If the question is not related to parenting, politely redirect back to parenting topics"}
- ${lang === "zh" ? "回答字數控制在 300 字以內" : lang === "ms" ? "Had jawapan 300 patah perkataan" : "Keep answers under 300 words"}`;

    const aiMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ];

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.2",
        messages: aiMessages,
        max_completion_tokens: 800,
        temperature: 0.7,
      }),
    });

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
      console.error("OpenAI API error:", aiResponse.status, errorText);
      throw new Error("AI service error");
    }

    const aiData = await aiResponse.json();
    const reply = aiData.choices?.[0]?.message?.content || "";

    console.log("AI chat response generated successfully");

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ai-chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function prepareRecordsSummary(records: RecordData[], typeLabels: Record<string, string>): string {
  const lines: string[] = [];

  const byDate: Record<string, RecordData[]> = {};
  for (const record of records) {
    const date = record.start_time.split("T")[0];
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(record);
  }

  for (const [date, dayRecords] of Object.entries(byDate).sort()) {
    lines.push(`\n📅 ${date}:`);

    const byType: Record<string, RecordData[]> = {};
    for (const r of dayRecords) {
      if (!byType[r.type]) byType[r.type] = [];
      byType[r.type].push(r);
    }

    if (byType.sleep) {
      let totalMinutes = 0;
      for (const r of byType.sleep) {
        const notes = r.notes as { duration_minutes?: number } | null;
        if (notes?.duration_minutes) totalMinutes += notes.duration_minutes;
      }
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      lines.push(`  ${typeLabels.sleep || "Sleep"}: ${byType.sleep.length}x, ${hours}h${mins}m`);
    }

    if (byType.feeding) {
      let totalMl = 0;
      for (const r of byType.feeding) {
        const notes = r.notes as { amount_ml?: number } | null;
        if (notes?.amount_ml) totalMl += notes.amount_ml;
      }
      lines.push(`  ${typeLabels.feeding || "Feeding"}: ${byType.feeding.length}x, ${totalMl}ml`);
    }

    if (byType.night_wake) {
      let totalMinutes = 0;
      for (const r of byType.night_wake) {
        const notes = r.notes as { duration_minutes?: number } | null;
        if (notes?.duration_minutes) totalMinutes += notes.duration_minutes;
      }
      lines.push(`  ${typeLabels.night_wake || "Night Wake"}: ${byType.night_wake.length}x, ${totalMinutes}min`);
    }

    if (byType.diaper) {
      lines.push(`  ${typeLabels.diaper || "Diaper"}: ${byType.diaper.length}x`);
    }
  }

  return lines.join("\n");
}
