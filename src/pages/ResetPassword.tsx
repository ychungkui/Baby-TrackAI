import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.jpg';
import { useLanguage } from '@/i18n';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => { if (event === 'PASSWORD_RECOVERY') setIsRecovery(true); setChecked(true); });
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) setIsRecovery(true);
    setChecked(true);
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast({ variant: 'destructive', title: t('common.error'), description: t('reset_password.password_min') }); return; }
    if (password !== confirmPassword) { toast({ variant: 'destructive', title: t('common.error'), description: t('reset_password.password_mismatch') }); return; }
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);
    if (error) { toast({ variant: 'destructive', title: t('reset_password.reset_failed'), description: error.message }); return; }
    toast({ title: t('reset_password.reset_success'), description: t('reset_password.reset_success_desc') });
    navigate('/auth');
  };

  if (!checked) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-muted-foreground">{t('common.loading')}</div></div>;

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <img src={logo} alt="Baby TrackAI" className="w-16 h-16 rounded-xl mb-6 object-cover shadow-md" />
        <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="text-center"><CardTitle>{t('reset_password.invalid_link')}</CardTitle><CardDescription>{t('reset_password.invalid_desc')}</CardDescription></CardHeader>
          <CardContent><Link to="/auth"><Button className="w-full"><ArrowLeft className="mr-2 h-4 w-4" />{t('reset_password.back_to_login')}</Button></Link></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <img src={logo} alt="Baby TrackAI" className="w-16 h-16 rounded-xl mb-6 object-cover shadow-md" />
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur">
        <CardHeader className="text-center"><CardTitle className="text-2xl font-bold">{t('reset_password.title')}</CardTitle><CardDescription>{t('reset_password.desc')}</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="password">{t('reset_password.new_password')}</Label><Input id="password" type="password" placeholder={t('auth.min_6_chars')} className="h-12" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="confirmPassword">{t('reset_password.confirm_new')}</Label><Input id="confirmPassword" type="password" placeholder={t('reset_password.re_enter')} className="h-12" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
            <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('reset_password.resetting')}</> : t('reset_password.confirm_reset')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
