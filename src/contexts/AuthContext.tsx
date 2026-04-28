import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Purchases } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

type Profile = {
  id: string;
  is_pro: boolean;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const isRevenueCatConfigured = useRef(false);

  // =========================
  // RevenueCat 初始化
  // =========================
  const initRevenueCat = async () => {
    try {
      const isNative = Capacitor.getPlatform() !== 'web';
      if (!isNative) return;

      if (isRevenueCatConfigured.current) return;

      await Purchases.configure({
        apiKey: "goog_fqaEtNdcUIUxTcCqiKyjIOhPTKZ",
      });

      isRevenueCatConfigured.current = true;
    } catch (error) {
      console.error('RevenueCat init error:', error);
    }
  };

  // =========================
  // RevenueCat user 同步
  // =========================
  const syncRevenueCatUser = async (userId?: string) => {
    try {
      const isNative = Capacitor.getPlatform() !== 'web';
      if (!isNative) return;

      if (!userId) {
        await Purchases.logOut();
        return;
      }

      await Purchases.logIn({ appUserID: userId });
    } catch (error) {
      console.error('RC sync error:', error);
    }
  };

  // =========================
  // Profile
  // =========================
  const fetchProfile = (userId: string) => {
    setTimeout(async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, is_pro')
          .eq('user_id', userId)
          .single();

        if (data) {
          setProfile(data);
          localStorage.setItem('profile', JSON.stringify(data));
        } else {
          setProfile({ id: userId, is_pro: false });
        }
      } catch (err) {
        console.error('fetch profile error:', err);
      }
    }, 0);
  };

  const refreshProfile = async () => {
    if (!user?.id) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, is_pro')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile(data);
        localStorage.setItem('profile', JSON.stringify(data));
      } else {
        setProfile({ id: user.id, is_pro: false });
      }
    } catch (err) {
      console.error('refreshProfile error:', err);
    }
  };

  // =========================
  // Auth
  // =========================
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    localStorage.removeItem('profile');
    await supabase.auth.signOut();
  };

  // =========================
  // 初始化
  // =========================
  useEffect(() => {
    let isActive = true;

    try {
      const cached = localStorage.getItem('profile');
      if (cached) setProfile(JSON.parse(cached));
    } catch {}

    const init = async () => {
      await initRevenueCat();

      const { data: { session } } = await supabase.auth.getSession();

      if (!isActive) return;

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user?.id) {
        fetchProfile(session.user.id);
        syncRevenueCatUser(session.user.id);

        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 2000);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {

        const hash = window.location.hash;

        // ⭐ 核心：攔截 email confirm
        if (
          event === "SIGNED_IN" &&
          hash &&
          hash.includes("access_token") &&
          hash.includes("type=signup")
        ) {
          // 不 reload，不清 hash
          window.history.replaceState(null, "", "/confirm" + hash);
          return;
        }

        // ⭐ 正常流程
        if (!isActive) return;

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user?.id) {
          fetchProfile(session.user.id);
          syncRevenueCatUser(session.user.id);

          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 2000);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  // =========================
  // App Resume
  // =========================
  useEffect(() => {
    const isNative = Capacitor.getPlatform() !== 'web';
    if (!isNative) return;

    let sub: any;

    const initAppListener = async () => {
      const { App } = await import('@capacitor/app');

      sub = App.addListener('appStateChange', ({ isActive }) => {
        if (!isActive || !user) return;
        refreshProfile();
      });
    };

    initAppListener();

    return () => {
      if (sub) sub.remove();
    };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);