import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBabyContext } from '@/contexts/BabyContext';
import { useBabies } from '@/hooks/useBabies';
import { useSubscription } from '@/hooks/useSubscription';
import { useLanguage, LANGUAGE_LABELS, Language } from '@/i18n';
import { BottomNav } from '@/components/layout/BottomNav';
import { EditBabyDialog } from '@/components/baby/EditBabyDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { ChevronRight } from 'lucide-react';
import logo from '@/assets/logo.jpg';
import freeBadge from '@/assets/icons/free-badge.png';
import vipBadge from '@/assets/icons/vip-badge.png';
import mailIcon from '@/assets/icons/mail.png';
import languageIcon from '@/assets/icons/language.png';
import babyIcon from '@/assets/icons/baby2.png';
import aboutIcon from '@/assets/icons/about.png';
import exitIcon from '@/assets/icons/exit.png';
import trashIcon from '@/assets/icons/trash.png';
import penIcon from '@/assets/icons/pen.png';
import { HeaderBranding } from '@/components/layout/HeaderBranding';
import { Baby } from '@/types';

export default function Settings() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { babies } = useBabyContext();
  const { deleteBaby, isDeleting } = useBabies();
  const { isPro } = useSubscription();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [editingBaby, setEditingBaby] = useState<Baby | null>(null);
  const [deletingBaby, setDeletingBaby] = useState<Baby | null>(null);
  const [langDialogOpen, setLangDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => { await signOut(); navigate('/auth'); };

  const handleDelete = async () => {
    if (!deletingBaby) return;
    try { await deleteBaby(deletingBaby.id); setDeletingBaby(null); } catch {}
  };

  const getAvatarClasses = (gender: string | null) => {
    if (gender === 'male') return 'bg-blue-100 text-blue-600';
    if (gender === 'female') return 'bg-pink-100 text-pink-600';
    return 'bg-muted text-muted-foreground';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 to-background pb-20">
      <header className="sticky top-0 z-10 bg-blue-600 text-white">
        <div className="container flex flex-col gap-1 py-2 px-4">
          <div className="flex justify-center"><HeaderBranding className="text-white" /></div>
          <div className="flex justify-center">
            <h1 className="text-lg font-semibold">{t('settings.title')}</h1>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Account */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <img src={mailIcon} alt="Mail" className="w-8 h-5" />
              {t('settings.account_info')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm">{user.email}</span>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setLangDialogOpen(true)}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <img src={languageIcon} alt="Language" className="w-8 h-8" />
                {t('settings.language')}
              </CardTitle>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">{LANGUAGE_LABELS[language]}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Subscription */}
        <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate('/subscription')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <img src={isPro ? vipBadge : freeBadge} alt={isPro ? 'VIP' : 'Free'} className="w-8 h-8" />
                {t('settings.subscription_plan')}
              </CardTitle>
              <ChevronRight className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('subscription.current_plan')}</span>
              <Badge variant={isPro ? 'default' : 'secondary'}>{isPro ? 'Pro' : 'Free'}</Badge>
            </div>
            {!isPro && <p className="text-xs text-muted-foreground mt-2">{t('subscription.upgrade_pro')}</p>}
          </CardContent>
        </Card>

        {/* Baby Management */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <img src={babyIcon} alt="Baby" className="w-8 h-8" />
              {t('settings.baby_management')}
            </CardTitle>
            <CardDescription>{t('settings.baby_count', { count: babies.length })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {babies.map((baby) => (
                <div key={baby.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/50">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={getAvatarClasses(baby.gender)}>{baby.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{baby.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{baby.birth_date}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingBaby(baby)}>
                    <img src={penIcon} alt="Edit" className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeletingBaby(baby)}>
                    <img src={trashIcon} alt="Delete" className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <img src={aboutIcon} alt="About" className="w-8 h-8" />
              {t('settings.about')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Baby TrackAI Logo" className="w-12 h-12 rounded-xl object-cover shadow-sm" />
              <div>
                <p className="text-sm font-medium">Baby TrackAI</p>
                <p className="text-xs text-muted-foreground">{t('settings.version')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Button 
  className="w-full bg-blue-600 text-white hover:bg-blue-700"
  onClick={handleSignOut}
>
          <img src={exitIcon} alt="Sign out" className="w-6 h-6 mr-2" />
          {t('settings.sign_out')}
        </Button>

        <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive" onClick={() => navigate('/delete-account')}>
          <img src={trashIcon} alt="Delete" className="w-6 h-6 mr-2" />
          {t('settings.delete_account')}
        </Button>
      </main>

      <BottomNav />

      <EditBabyDialog baby={editingBaby} open={!!editingBaby} onOpenChange={(open) => !open && setEditingBaby(null)} />

      <AlertDialog open={!!deletingBaby} onOpenChange={(open) => !open && setDeletingBaby(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.delete_confirm')}</AlertDialogTitle>
            <AlertDialogDescription>{t('settings.delete_baby_desc', { name: deletingBaby?.name || '' })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? t('settings.deleting') : t('settings.confirm_delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Language Dialog */}
      <Dialog open={langDialogOpen} onOpenChange={setLangDialogOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>{t('settings.select_language')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {(Object.keys(LANGUAGE_LABELS) as Language[]).map((lang) => (
              <Button
                key={lang}
                variant={language === lang ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => { setLanguage(lang); setLangDialogOpen(false); }}
              >
                {LANGUAGE_LABELS[lang]}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
