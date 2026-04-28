import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const body = await req.json();

    console.log("📩 RevenueCat event:", body);

    const event = body.event;
    const userId = event.app_user_id;

    if (!userId) {
      console.error("❌ No userId from RevenueCat");
      return new Response("No userId", { status: 400 });
    }

    console.log("👤 User ID:", userId);
    console.log("📦 Event type:", event.type);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 🎯 判斷 subscription 狀態
    const isActive =
      event.type === "INITIAL_PURCHASE" ||
      event.type === "RENEWAL" ||
      event.type === "UNCANCELLATION";

    const isCancelled =
      event.type === "CANCELLATION" ||
      event.type === "EXPIRATION";

    // =========================
    // ✅ 🔥 正确：用 user_id（不是 id）
    // =========================

    if (isActive) {
      const { data, error } = await supabase
        .from("profiles")
        .update({ is_pro: true })
        .eq("user_id", userId)
        .select();

      console.log("🧪 update result:", data);

      if (error) {
        console.error("❌ Update error:", error);
      } else if (!data || data.length === 0) {
        console.error("❌ No matching user found in profiles!");
      } else {
        console.log("✅ User upgraded to PRO:", userId);
      }
    }

    if (isCancelled) {
      const { data, error } = await supabase
        .from("profiles")
        .update({ is_pro: false })
        .eq("user_id", userId)
        .select();

      console.log("🧪 cancel result:", data);

      if (error) {
        console.error("❌ Cancel update error:", error);
      } else if (!data || data.length === 0) {
        console.error("❌ No matching user found (cancel)!");
      } else {
        console.log("⬇️ User downgraded:", userId);
      }
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("❌ Webhook error:", err);
    return new Response("Error", { status: 500 });
  }
});