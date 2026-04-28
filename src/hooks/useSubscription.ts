import { useState, useEffect, useCallback } from 'react';
import { Purchases } from '@revenuecat/purchases-capacitor';
import { supabase } from '@/integrations/supabase/client';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { useLanguage } from '@/i18n';

export function useSubscription() {
  const { t } = useLanguage();

  const [isPro, setIsPro] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const isNative = Capacitor.getPlatform() !== 'web';

  // =========================
  // ⭐ 只保留 login（避免 anonymous）
  // =========================
  const ensureLoggedIn = async () => {
    try {
      if (!isNative) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const info = await Purchases.getCustomerInfo();

      if (info.originalAppUserId !== user.id) {
        await Purchases.logIn({ appUserID: user.id });
      }
    } catch (err) {
      console.error('ensureLoggedIn error:', err);
    }
  };

  // =========================
  // ⭐ 改：完全用 Supabase 判斷
  // =========================
  const checkSubscription = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('is_pro')
          .eq('user_id', user.id)
          .single();

        const isActive = data?.is_pro ?? false;

        setIsPro(isActive);
      } else {
        setIsPro(false);
      }

    } catch (err) {
      console.error('Profile check error:', err);
      setIsPro(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // =========================
  // ⭐ checkout 保留（購買還是走 RC）
  // =========================
  const checkout = useCallback(async () => {
    setCheckoutLoading(true);

    try {
      if (!isNative) {
        alert(t('subscription.mobile_only'));
        return false;
      }

      await ensureLoggedIn();

      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages[0];

      if (!pkg) {
        alert(t('subscription.no_package'));
        return false;
      }

      await Purchases.purchasePackage({ aPackage: pkg });

      // ⭐ 等 webhook 同步（關鍵）
      await new Promise(res => setTimeout(res, 2000));

      await checkSubscription();

      return true;

    } catch (err: any) {
      if (!err?.userCancelled) {
        alert(t('subscription.purchase_failed'));
      }
      return false;
    } finally {
      setCheckoutLoading(false);
    }
  }, [checkSubscription, isNative, t]);

  // =========================
  // ⭐⭐ 核心：Supabase restore
  // =========================
  const restorePurchases = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, showSuccessPage: false };
      }

      // ⭐ 等 webhook（避免你現在遇到的延遲問題）
      await new Promise(res => setTimeout(res, 2000));

      const { data, error } = await supabase
        .from('profiles')
        .select('is_pro')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      const isPro = data?.is_pro === true;

      setIsPro(isPro);

      return {
        success: isPro,
        showSuccessPage: isPro,
      };

    } catch (err) {
      console.error('Restore error:', err);
      return {
        success: false,
        showSuccessPage: false,
      };
    }
  }, []);

  // =========================
  // manage subscription（不動）
  // =========================
  const manageSubscription = useCallback(async () => {
    try {
      if (!isNative) return;

      await Browser.open({
        url: 'https://play.google.com/store/account/subscriptions'
      });

    } catch (err) {
      console.error('Manage subscription error:', err);
    }
  }, [isNative]);

  return {
    isPro,
    subscriptionEnd,
    loading,
    checkoutLoading,
    checkout,
    manageSubscription,
    restorePurchases,
  };
}