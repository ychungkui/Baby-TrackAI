import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type Status = "verifying" | "success" | "error";

export default function Confirm() {
  const [status, setStatus] = useState<Status>("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  // 🌐 語言
  const getLang = () => {
    const lang = localStorage.getItem("i18nextLng");
    if (lang === "ms") return "ms";
    if (lang === "zh") return "zh";
    return "en";
  };

  const lang = getLang();

  const text = {
    en: {
      verifying: "Activating your account...",
      pleaseWait: "Please wait a moment.",
      success: "Email Verified!",
      successDesc: "Your account is now active.",
      login: "Go to Login",
      error: "Activation Failed",
      back: "Back to Sign Up",
      invalid: "Invalid or expired link.",
    },
    ms: {
      verifying: "Mengaktifkan akaun anda...",
      pleaseWait: "Sila tunggu sebentar.",
      success: "Emel Berjaya Disahkan!",
      successDesc: "Akaun anda kini aktif.",
      login: "Pergi ke Log Masuk",
      error: "Pengaktifan Gagal",
      back: "Kembali ke Daftar",
      invalid: "Pautan tidak sah atau tamat tempoh.",
    },
    zh: {
      verifying: "正在啟用您的賬號...",
      pleaseWait: "請稍候。",
      success: "驗證成功！",
      successDesc: "您的賬號已啟用。",
      login: "前往登入",
      error: "驗證失敗",
      back: "返回註冊",
      invalid: "連結無效或已過期。",
    },
  }[lang];

  useEffect(() => {
    let cancelled = false;

    const rawHash = window.location.hash;

    // ❗沒有 token
    if (!rawHash) {
      setErrorMsg(text.invalid);
      setStatus("error");
      return;
    }

    const hash = rawHash.replace("#", "");
    const params = new URLSearchParams(hash);
    const type = params.get("type");

    // 🔥 reset password flow（保留 token）
    if (type === "recovery") {
      window.location.href = "/reset-password" + window.location.hash;
      return;
    }

    const cleanUrl = () => {
      window.history.replaceState(null, "", window.location.pathname);
    };

    const verify = async () => {
      try {
        const errorDesc = params.get("error_description");
        if (errorDesc) {
          if (!cancelled) {
            setErrorMsg(errorDesc);
            setStatus("error");
          }
          cleanUrl();
          return;
        }

        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        // ✅ 成功（避免殘留登入狀態）
        if (access_token && refresh_token) {
          await supabase.auth.signOut(); // 🔥 修正：避免自動登入殘留

          cleanUrl();
          if (!cancelled) setStatus("success");

          setTimeout(() => {
            window.location.href = "/auth";
          }, 1500);

          return;
        }

        // fallback（極少情況）
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data.session) {
          await supabase.auth.signOut(); // 🔥 同樣處理

          cleanUrl();
          if (!cancelled) setStatus("success");

          setTimeout(() => {
            window.location.href = "/auth";
          }, 1500);

          return;
        }

        if (!cancelled) {
          setErrorMsg(text.invalid);
          setStatus("error");
        }

      } catch (err: any) {
        console.error(err);
        cleanUrl();
        if (!cancelled) {
          setErrorMsg(err.message || text.invalid);
          setStatus("error");
        }
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-[340px] text-center">

        <img
          src="/logo.jpg"
          alt="Baby TrackAI"
          className="w-20 mx-auto mb-4"
        />

        {status === "verifying" && (
          <>
            <Loader2 className="animate-spin mx-auto mb-3 text-blue-600" size={36} />
            <h2 className="text-lg font-semibold mb-2">
              {text.verifying}
            </h2>
            <p className="text-sm text-gray-500">
              {text.pleaseWait}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="mx-auto mb-3 text-green-600" size={44} />
            <h2 className="text-lg font-semibold mb-2 text-green-600">
              {text.success}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {text.successDesc}
            </p>

            <Link to="/auth">
              <Button className="w-full">
                {text.login}
              </Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto mb-3 text-red-600" size={44} />
            <h2 className="text-lg font-semibold mb-2 text-red-600">
              {text.error}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {errorMsg}
            </p>

            <Link to="/auth">
              <Button variant="outline" className="w-full">
                {text.back}
              </Button>
            </Link>
          </>
        )}

      </div>
    </div>
  );
}