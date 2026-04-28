import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n';

export default function Terms() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <Button variant="ghost" size="sm" onClick={() => navigate('/landing')} className="mb-6"><ArrowLeft className="w-4 h-4 mr-1" /> {t('common.back')}</Button>
        <h1 className="text-2xl font-bold mb-6">{t('terms.title')}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t('terms.last_updated')}</p>
        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          {(['s1','s2','s3','s4','s5','s6','s7','s8','s9','s10'] as const).map((key) => (
            <section key={key}>
              <h2 className="text-base font-semibold text-foreground mb-2">{t(`terms.${key}_title`)}</h2>
              <p className="whitespace-pre-line">{t(`terms.${key}`)}</p>
              {key === 's10' && <p className="mt-1">{t('terms.email_label')}<a href="mailto:contact@babytrackai.com" className="text-primary underline">contact@babytrackai.com</a></p>}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
