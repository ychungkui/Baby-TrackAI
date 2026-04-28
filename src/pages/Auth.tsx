import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/auth/AuthForm';
import { ArrowLeft } from 'lucide-react';
import logo from '@/assets/logo.jpg';
import { useLanguage } from '@/i18n';

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // ✅ Confirm 狀態
  const [showConfirm, setShowConfirm] = useState(false);
  const [checkedConfirm, setCheckedConfirm] = useState(false);

  // 🔥 先解析 URL（最關鍵）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const confirmed = params.get("confirmed");

    if (confirmed === "true") {
      setShowConfirm(true);
    }

    // ✅ 告訴系統：已經檢查過 URL
    setCheckedConfirm(true);

    // 清掉 URL（避免 refresh 還存在）
    window.history.replaceState({}, document.title, "/auth");
  }, []);

  // ✅ 控制是否跳首頁（修正 timing bug）
  useEffect(() => {
    // ❗ 一定要等 checkedConfirm 才能判斷
   const isEmailVerify = window.location.hash.includes("access_token");

if (!loading && user && !isEmailVerify) {
  navigate('/');
}
  }, [user, loading, showConfirm, checkedConfirm, navigate]);

  // ✅ Confirm 顯示 2 秒後再跳
  useEffect(() => {
    if (!loading && user && showConfirm) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, loading, showConfirm, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">
          {t('common.loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50/40 to-background px-4 py-8 relative">

      {/* 返回首頁 */}
      <Link
        to="/landing"
        className="absolute top-4 left-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('auth.back_to_home')}
      </Link>

      {/* Logo + Title */}
      <div className="mb-8 text-center">
        <img
          src={logo}
          alt="Baby TrackAI Logo"
          className="w-24 h-24 rounded-2xl mx-auto mb-4 object-cover shadow-md"
        />
        <h1 className="text-2xl font-bold text-foreground">
          Baby TrackAI
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('landing.hero_subtitle')}
        </p>
      </div>

      {/* ✅ Confirm 成功提示 */}
      {showConfirm && (
        <div className="mb-4 w-full max-w-sm p-4 bg-green-100 text-green-700 rounded-xl text-center shadow-sm">
          {t('auth.email_verified') || "✅ Email Verified! Your account is now active."}
        </div>
      )}

      {/* 登入表單 */}
      <AuthForm />

      {/* 條款 */}
      <p className="mt-8 text-xs text-muted-foreground text-center max-w-sm">
        {t('auth.agree_terms')}
      </p>
    </div>
  );
}