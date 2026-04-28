import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n';
import { HeaderBranding } from '@/components/layout/HeaderBranding';

export default function DeleteAccount() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [deleting, setDeleting] = useState(false);

  if (!loading && !user) { navigate('/auth'); return null; }

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('delete-account', {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (res.error) throw res.error;

      await signOut();
      toast({
        title: t('delete_account.deleted'),
        description: t('delete_account.deleted_desc')
      });

      navigate('/landing');
    } catch (err: any) {
      toast({
        title: t('delete_account.delete_failed'),
        description: err.message || t('delete_account.delete_failed_desc'),
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ✅ Header（跟 Settings 一樣） */}
      <header className="sticky top-0 z-10 bg-blue-600 text-white">
        <div className="container flex flex-col gap-1 py-2 px-4">
          <div className="flex justify-center">
            <HeaderBranding className="text-white" />
          </div>
          <div className="flex justify-center">
            <h1 className="text-lg font-semibold">
              {language === 'ms'
                ? 'Padam Akaun'
                : language === 'zh'
                ? '刪除賬號'
                : 'Delete Account'}
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-10">

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1 as any)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t('delete_account.back')}
        </Button>

        <h1 className="text-2xl font-bold mb-6">
          {t('delete_account.title')}
        </h1>

        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('delete_account.warning')}</AlertTitle>
          <AlertDescription>
            {t('delete_account.warning_desc')}
          </AlertDescription>
        </Alert>

        <div className="space-y-3 text-sm text-muted-foreground mb-8">
          <p>{t('delete_account.will_delete')}</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>{t('delete_account.item_personal')}</li>
            <li>{t('delete_account.item_records')}</li>
            <li>{t('delete_account.item_photos')}</li>
            <li>{t('delete_account.item_ai')}</li>
            <li>{t('delete_account.item_sub')}</li>
          </ul>
          <p className="font-medium text-foreground mt-4">
            {t('delete_account.irreversible')}
          </p>
        </div>

        {/* ✅ 只這裡改 → 按鈕置中 */}
        <div className="flex justify-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="lg"
                disabled={deleting}
              >
                {deleting
                  ? t('delete_account.deleting')
                  : t('delete_account.delete_btn')}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t('delete_account.confirm_title')}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t('delete_account.confirm_desc')}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>
                  {t('common.cancel')}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t('delete_account.confirm_btn')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

      </div>
    </div>
  );
}