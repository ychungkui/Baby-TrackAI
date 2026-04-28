import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Crown, Infinity as InfinityIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import freeBadgeIcon from '@/assets/icons/free-badge.png';
import vipBadgeIcon from '@/assets/icons/vip-badge.png';
import { useLanguage } from '@/i18n';

export default function Subscription() {
  const { user, loading: authLoading } = useAuth();

  const {
    isPro,
    loading,
    checkoutLoading,
    checkout,
    manageSubscription,
    restorePurchases
  } = useSubscription();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t } = useLanguage();

  // ⭐ Checkout → 成功直接跳頁
 const handleCheckout = async () => {
  try {
    const success = await checkout();

    if (success) {
      navigate('/subscription/success');
    }

  } catch (err) {
    console.error('Checkout error:', err);
  }
};
  // ⭐⭐ 這就是你需要的 restore handler（已幫你整合好）
  const handleRestore = async () => {
    const result = await restorePurchases();

    if (result.success) {
      if (result.showSuccessPage) {
        // 👉 只有「真的從 Free → Pro」才跳成功頁
        navigate('/subscription/success');
      } else {
        // 👉 已經是 Pro，再按 restore → 只提示
        toast({
          title: t('subscription.restore_success'),
        });
      }
    } else {
      toast({
        title: t('subscription.restore_failed'),
      });
    }
  };

  const FREE_FEATURES = [
    { text: t('subscription.records_feature'), value: t('subscription.unlimited') },
    { text: t('subscription.summary_feature'), value: t('subscription.available') },
    { text: t('subscription.bedtime_feature'), value: t('subscription.bedtime_free') },
    { text: t('subscription.ai_feature'), value: t('subscription.chat_free') },
  ];

  const PRO_FEATURES = [
    { text: t('subscription.records_feature'), value: t('subscription.unlimited') },
    { text: t('subscription.summary_feature'), value: t('subscription.available') },
    { text: t('subscription.bedtime_feature'), value: t('subscription.unlimited'), highlight: true },
    { text: t('subscription.ai_feature'), value: t('subscription.unlimited'), highlight: true },
  ];

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
      toast({
        title: t('subscription.cancelled'),
        description: t('subscription.cancelled_desc'),
      });
    }
  }, [searchParams, toast, navigate, t]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">
          {t('common.loading')}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 to-background pb-20">
      
      <header className="sticky top-0 z-10 bg-blue-600 text-white">
        <div className="container flex items-center h-14 px-4 gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">
            {t('subscription.title')}
          </h1>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <img src={freeBadgeIcon} alt="Free" className="w-6 h-6" />
                {t('subscription.free_plan')}
              </CardTitle>
            </div>
            <p className="text-2xl font-bold">
              $0
              <span className="text-sm font-normal text-muted-foreground">
                {t('subscription.per_month')}
              </span>
            </p>
          </CardHeader>

          <CardContent>
            <ul className="space-y-2.5">
              {FREE_FEATURES.map((f) => (
                <li key={f.text} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1">{f.text}</span>
                  <span className="text-muted-foreground">{f.value}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-white shadow-xl scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <img src={vipBadgeIcon} alt="VIP" className="w-6 h-6" />
                {t('subscription.pro_plan')}
              </CardTitle>

              <Badge className="bg-yellow-400 text-white text-xs">
                {t('subscription.most_popular')}
              </Badge>
            </div>

            <p className="text-3xl font-extrabold text-primary">
              $9.99
              <span className="text-sm font-normal text-muted-foreground">
                {t('subscription.per_month_usd')}
              </span>
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <ul className="space-y-2.5">
              {PRO_FEATURES.map((f) => (
                <li key={f.text} className="flex items-center gap-2 text-sm">
                  {f.highlight ? (
                    <InfinityIcon className="w-4 h-4 text-primary flex-shrink-0" />
                  ) : (
                    <Check className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="flex-1">{f.text}</span>
                  <span className={f.highlight ? 'text-primary font-medium' : 'text-muted-foreground'}>
                    {f.value}
                  </span>
                </li>
              ))}
            </ul>

            {isPro ? (
              <div className="space-y-2">
                <Button className="w-full gap-2" disabled>
                  <Check className="w-4 h-4" />
                  {t('subscription.already_upgraded')}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={manageSubscription}
                >
                  {t('subscription.manage_sub')}
                </Button>
              </div>
            ) : (
              <Button
                className="w-full gap-2 text-lg py-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold shadow-lg hover:scale-105 transition"
                onClick={handleCheckout}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('subscription.preparing')}
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    {t('subscription.upgrade_now')}
                  </>
                )}
              </Button>
            )}

            {/* ⭐ 這裡已改成 handleRestore */}
            <Button
              variant="ghost"
              className="w-full text-xs text-muted-foreground"
              onClick={handleRestore}
            >
              {t('subscription.restore')}
            </Button>

          </CardContent>
        </Card>

      </main>

      <BottomNav />
    </div>
  );
}