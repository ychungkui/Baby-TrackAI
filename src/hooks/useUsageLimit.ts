import { useState, useCallback, useEffect } from 'react';
import { useSubscription } from './useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const FREE_LIMITS = {
  bedtime: 3,
  chat: 3,
} as const;

interface UsageCounts {
  free_bedtime_used: number;
  free_chat_used: number;
}

export function useUsageLimit() {
  const { isPro, loading: subLoading } = useSubscription();
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageCounts>({ free_bedtime_used: 0, free_chat_used: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchUsage = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('free_bedtime_used, free_chat_used')
        .eq('user_id', user.id)
        .single();
      if (data) setUsage({ free_bedtime_used: (data as any).free_bedtime_used ?? 0, free_chat_used: (data as any).free_chat_used ?? 0 });
      setLoading(false);
    };
    fetchUsage();
  }, [user]);

  const canUseBedtimeSummary = isPro || usage.free_bedtime_used < FREE_LIMITS.bedtime;
  const canUseAiChat = isPro || usage.free_chat_used < FREE_LIMITS.chat;
  const remainingBedtime = isPro ? Infinity : Math.max(0, FREE_LIMITS.bedtime - usage.free_bedtime_used);
  const remainingChat = isPro ? Infinity : Math.max(0, FREE_LIMITS.chat - usage.free_chat_used);

  const incrementBedtime = useCallback(async () => {
    if (!user) return;
    const newCount = usage.free_bedtime_used + 1;
    setUsage(prev => ({ ...prev, free_bedtime_used: newCount }));
    await (supabase as any).rpc('increment_usage', { column_name: 'free_bedtime_used', user_uid: user.id });
  }, [user, usage.free_bedtime_used]);

  const incrementChat = useCallback(async () => {
    if (!user) return;
    const newCount = usage.free_chat_used + 1;
    setUsage(prev => ({ ...prev, free_chat_used: newCount }));
    await (supabase as any).rpc('increment_usage', { column_name: 'free_chat_used', user_uid: user.id });
  }, [user, usage.free_chat_used]);

  return {
    isPro,
    loading: subLoading || loading,
    canUseBedtimeSummary,
    canUseAiChat,
    remainingBedtime,
    remainingChat,
    incrementBedtime,
    incrementChat,
    limits: FREE_LIMITS,
  };
}
