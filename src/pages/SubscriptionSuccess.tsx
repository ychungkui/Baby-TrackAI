import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import vipBadge from '@/assets/icons/vip-badge.png';
import { Home, PartyPopper, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/i18n';

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // ⭐ 安全載入（避免白屏）
  useEffect(() => {
    import('canvas-confetti')
      .then((confetti) => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.5, y: 0.65 },
        });
      })
      .catch(() => {});
  }, []);

  // ⭐ 只負責顯示，不做訂閱判斷
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 6000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 to-background flex items-center justify-center px-4">
      <Card className="max-w-sm w-full text-center border-primary/30 bg-gradient-to-br from-white to-primary/5 shadow-2xl rounded-2xl">
        <CardContent className="pt-10 pb-8 space-y-6">

          <div className="flex justify-center">
            <PartyPopper
              className="
                w-16 h-16
                text-transparent
                bg-clip-text
                bg-gradient-to-r
                from-red-500 via-yellow-400 via-green-400 to-blue-500
                drop-shadow-xl
                animate-bounce
              "
            />
          </div>

          <h1 className="text-2xl font-bold">
            {t('subscription_success.title')}
          </h1>

          <div className="flex justify-center">
            <img src={vipBadge} alt="VIP" className="w-16 h-16" />
          </div>

          <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            {t('subscription_success.activated')}
          </div>

          <p className="text-sm text-muted-foreground">
            {t('subscription_success.desc')}
          </p>

          <Button onClick={() => navigate('/')} className="w-full">
            <Home className="w-4 h-4" />
            {t('subscription_success.back_home')}
          </Button>

          <p className="text-xs text-muted-foreground">
            {t('subscription_success.redirecting')}
          </p>

        </CardContent>
      </Card>
    </div>
  );
}