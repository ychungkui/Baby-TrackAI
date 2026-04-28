import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/i18n';

export function AuthForm() {
  const { t } = useLanguage();

  const loginSchema = z.object({
    email: z.string().email(t('auth.valid_email')),
    password: z.string().min(6, t('auth.password_min')),
  });

  const signUpSchema = z.object({
    email: z.string().email(t('auth.valid_email')),
    password: z.string().min(6, t('auth.password_min')),
    confirmPassword: z.string().min(6, t('auth.password_min')),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.password_mismatch'),
    path: ['confirmPassword'],
  });

  type LoginFormData = z.infer<typeof loginSchema>;
  type SignUpFormData = z.infer<typeof signUpSchema>;

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  // ✅ 修復：補上 switchMode（你之前缺這個）
  const switchMode = (newMode: 'login' | 'signup' | 'forgot') => {
    setMode(newMode);
    loginForm.reset();
    signUpForm.reset();
    setForgotEmail('');
  };

  // LOGIN
  const handleLogin = async (data: LoginFormData) => {
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: t('auth.login_failed'),
          description: error.message,
        });
        return;
      }

      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  // SIGN UP
  const handleSignUp = async (data: SignUpFormData) => {
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: "https://www.babytrackai.com/confirm"
        },
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: t('auth.signup_failed'),
          description: error.message,
        });
        return;
      }

      toast({
        title: t('auth.signup_success'),
        description: t('auth.signup_success_desc'),
      });

      setMode('login');
    } finally {
      setIsLoading(false);
    }
  };

  // FORGOT PASSWORD
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    try {
      setIsLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: "https://www.babytrackai.com/reset-password",
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: t('auth.send_failed'),
          description: error.message,
        });
        return;
      }

      toast({
        title: t('auth.reset_sent'),
        description: t('auth.reset_sent_desc'),
      });

      setMode('login');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold">
          {mode === 'login'
            ? t('auth.welcome_back')
            : mode === 'signup'
            ? t('auth.create_account')
            : t('auth.forgot_password')}
        </CardTitle>
        <CardDescription>
          {mode === 'login'
            ? t('auth.login_desc')
            : mode === 'signup'
            ? t('auth.signup_desc')
            : t('auth.forgot_desc')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {mode === 'forgot' ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('auth.email')}</label>
              <Input
                type="email"
                placeholder="your@email.com"
                className="h-12"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('auth.sending')}
                </>
              ) : (
                t('auth.send_reset')
              )}
            </Button>
          </form>
        ) : mode === 'login' ? (
          <Form key="login" {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.email')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" className="h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.password')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t('auth.enter_password')} className="h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {t('auth.forgot_link')}
              </button>

              <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.logging_in')}
                  </>
                ) : (
                  t('auth.login')
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <Form key="signup" {...signUpForm}>
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
              <FormField
                control={signUpForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.email')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" className="h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={signUpForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.password')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t('auth.min_6_chars')} className="h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={signUpForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.confirm_password')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t('auth.re_enter_password')} className="h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.signing_up')}
                  </>
                ) : (
                  t('auth.signup')
                )}
              </Button>
            </form>
          </Form>
        )}

        <div className="mt-6 text-center">
          {mode === 'forgot' ? (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {t('auth.back_to_login')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {mode === 'login' ? t('auth.no_account') : t('auth.has_account')}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}