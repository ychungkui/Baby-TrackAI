import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n';

export default function Privacy() {
  const navigate = useNavigate();
  const { t, tArray } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <Button variant="ghost" size="sm" onClick={() => navigate('/landing')} className="mb-6"><ArrowLeft className="w-4 h-4 mr-1" /> {t('common.back')}</Button>
        <h1 className="text-2xl font-bold mb-6">{t('privacy.title')}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t('privacy.last_updated')}</p>
        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">{t('privacy.s1_title')}</h2>
            <p>{t('privacy.s1')}</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">{tArray('privacy.s1_items').map((item, i) => <li key={i}>{item}</li>)}</ul>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">{t('privacy.s2_title')}</h2>
            <p>{t('privacy.s2')}</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">{tArray('privacy.s2_items').map((item, i) => <li key={i}>{item}</li>)}</ul>
          </section>
          <section><h2 className="text-base font-semibold text-foreground mb-2">{t('privacy.s3_title')}</h2><p>{t('privacy.s3')}</p></section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">{t('privacy.s4_title')}</h2>
            <p>{t('privacy.s4')}</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">{tArray('privacy.s4_items').map((item, i) => <li key={i}>{item}</li>)}</ul>
            <p className="mt-2">{t('privacy.s4_note')}</p>
          </section>
          <section><h2 className="text-base font-semibold text-foreground mb-2">{t('privacy.s5_title')}</h2><p>{t('privacy.s5')}</p></section>
          <section><h2 className="text-base font-semibold text-foreground mb-2">{t('privacy.s6_title')}</h2><p>{t('privacy.s6')}</p></section>
          <section><h2 className="text-base font-semibold text-foreground mb-2">{t('privacy.s7_title')}</h2><p>{t('privacy.s7')}</p></section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">{t('privacy.s8_title')}</h2>
            <p>{t('privacy.s8')}</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">{tArray('privacy.s8_items').map((item, i) => <li key={i}>{item}</li>)}</ul>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">{t('privacy.s9_title')}</h2>
            <p>{t('privacy.s9')}</p>
            <Button variant="destructive" className="mt-3" onClick={() => navigate('/delete-account')}>{t('privacy.delete_btn')}</Button>
          </section>
          <section><h2 className="text-base font-semibold text-foreground mb-2">{t('privacy.s10_title')}</h2><p>{t('privacy.s10')}</p></section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">{t('privacy.s11_title')}</h2>
            <p>{t('privacy.s11')}</p>
            <p className="mt-1">{t('privacy.email_label')}<a href="mailto:contact@babytrackai.com" className="text-primary underline">contact@babytrackai.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
