import { useState } from 'react';
import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Moon, ClipboardList, MessageCircle, Camera, Heart, Brain, Eclipse, Menu, X, Globe, TrendingUp, Share2, BarChart3, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import logo from '@/assets/logo.jpg';
import freeBadgeIcon from '@/assets/icons/free-badge.png';
import vipBadgeIcon from '@/assets/icons/vip-badge.png';
import { useLanguage, LANGUAGE_LABELS, Language } from '@/i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Landing() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langDialogOpen, setLangDialogOpen] = useState(false);

  const features = [
    { icon: Moon, title: t('landing.feature_bedtime'), desc: t('landing.feature_bedtime_desc') },
    { icon: ClipboardList, title: t('landing.feature_record'), desc: t('landing.feature_record_desc') },
    { icon: MessageCircle, title: t('landing.feature_chat'), desc: t('landing.feature_chat_desc') },
    { icon: Camera, title: t('landing.feature_growth'), desc: t('landing.feature_growth_desc') },
    { icon: TrendingUp, title: t('landing.feature_trend'), desc: t('landing.feature_trend_desc') },
    { icon: Share2, title: t('landing.feature_share'), desc: t('landing.feature_share_desc') },
    { icon: BarChart3, title: t('landing.feature_summary'), desc: t('landing.feature_summary_desc') },
    { icon: ImagePlus, title: t('landing.feature_share_card'), desc: t('landing.feature_share_card_desc') },
  ];

  const differentiators = [
    { icon: Heart, title: t('landing.diff_peace'), desc: t('landing.diff_peace_desc') },
    { icon: Brain, title: t('landing.diff_ai'), desc: t('landing.diff_ai_desc') },
    { icon: Eclipse, title: t('landing.diff_night'), desc: t('landing.diff_night_desc') },
  ];

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 to-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="w-10" />
          <div className="flex items-center gap-2">
            <img src={logo} alt="Baby TrackAI" className="w-7 h-7 rounded-lg object-cover" />
            <span className="font-semibold">Baby TrackAI</span>
          </div>
          <Button variant="ghost" size="icon" className="w-10 h-10" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Expandable menu */}
        {menuOpen && (
          <div className="border-t border-border bg-background px-4 py-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('landing.language')}</span>
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLangDialogOpen(true)}>
                <Globe className="w-4 h-4" />
                <span className="text-sm">{LANGUAGE_LABELS[language]}</span>
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('landing.login')}</span>
              <Button variant="ghost" size="sm" onClick={() => { setMenuOpen(false); navigate('/auth'); }}>
                {t('landing.login')}
              </Button>
            </div>
            <Button className="w-full" onClick={() => { setMenuOpen(false); navigate('/auth'); }}>
              {t('landing.get_started')}
            </Button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <img
          src={logo}
          alt="Baby TrackAI Logo"
          className="w-24 h-24 rounded-2xl object-cover shadow-lg mb-6"
        />
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Baby TrackAI</h1>
        <p className="text-lg md:text-xl text-primary font-medium mb-2">
          {t('landing.hero_subtitle')}
        </p>
        <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
          {t('landing.hero_desc')}
        </p>
        <div className="flex gap-3">
          <Button size="lg" onClick={() => navigate('/auth')}>
            {t('landing.free_start')}
          </Button>
          <Button size="lg" variant="outline" onClick={scrollToFeatures}>
            {t('landing.learn_more')}
          </Button>
        </div>
      </section>

      {/* Core Features — 8 cards in 2x4 grid */}
      <section id="features" className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">{t('landing.core_features')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f) => (
            <Card key={f.title} className="border-border bg-card">
              <CardContent className="flex flex-col items-center text-center p-5 gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Value Proposition */}
      <section className="px-6 py-16 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">{t('landing.why_choose')}</h2>
        <div className="space-y-6">
          {differentiators.map((d) => (
            <div key={d.title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <d.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{d.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="px-6 py-16 max-w-2xl mx-auto">
  <h2 className="text-2xl font-bold text-center mb-8">
    {t('landing.pricing_title')}
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    {/* Free */}
    <Card className="border-border bg-card">
      <CardContent className="p-6 space-y-3">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <img src={freeBadgeIcon} alt="Free" className="w-5 h-5" />
          {t('subscription.free_plan')}
        </h3>
        <p className="text-2xl font-bold">$0</p>
        <ul className="text-sm text-muted-foreground space-y-1.5">
          <li>✓ {t('subscription.records_feature')} — {t('subscription.unlimited')}</li>
          <li>✓ {t('subscription.summary_feature')} — {t('subscription.available')}</li>
          <li>✓ {t('subscription.bedtime_feature')} — {t('subscription.bedtime_free')}</li>
          <li>✓ {t('subscription.ai_feature')} — {t('subscription.chat_free')}</li>
        </ul>
      </CardContent>
    </Card>

    {/* Pro */}
    <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-white shadow-xl scale-105">
      <CardContent className="p-6 space-y-4">

        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-primary flex items-center gap-2">
            <img src={vipBadgeIcon} alt="VIP" className="w-6 h-6" />
            {t('subscription.pro_plan')}
          </h3>

          <span className="bg-yellow-400 text-white text-xs px-2 py-1 rounded">
  {t('subscription.most_popular')}
</span>
        </div>

        <p className="text-3xl font-extrabold text-primary">
          $9.99
          <span className="text-sm font-normal text-muted-foreground">
            {t('subscription.per_month_usd')}
          </span>
        </p>

        <ul className="text-sm space-y-2.5">
          <li className="flex items-center gap-2">
            ✓ {t('subscription.records_feature')}
            <span className="ml-auto text-muted-foreground">{t('subscription.unlimited')}</span>
          </li>

          <li className="flex items-center gap-2">
            ✓ {t('subscription.summary_feature')}
            <span className="ml-auto text-muted-foreground">{t('subscription.available')}</span>
          </li>

          <li className="flex items-center gap-2">
            <span className="text-primary">∞</span>
            {t('subscription.bedtime_feature')}
            <span className="ml-auto text-primary font-medium">{t('subscription.unlimited')}</span>
          </li>

          <li className="flex items-center gap-2">
            <span className="text-primary">∞</span>
            {t('subscription.ai_feature')}
            <span className="ml-auto text-primary font-medium">{t('subscription.unlimited')}</span>
          </li>
        </ul>

        <Button
  className="w-full gap-2 text-lg py-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold shadow-lg hover:scale-105 transition"
  onClick={() => navigate('/auth')}
>
  <Crown className="w-4 h-4" />
  {t('subscription.upgrade_now')}
</Button>

      </CardContent>
    </Card>

        </div>
        
      </section>

      {/* CTA Footer */}
      <section className="px-6 py-16 text-center">
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {t('landing.cta_text')}
        </p>
        <Button size="lg" onClick={() => navigate('/auth')}>
          {t('landing.cta_button')}
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 text-center">
          <img src={logo} alt="Baby TrackAI" className="w-10 h-10 rounded-lg object-cover" />
          <div className="flex gap-4 text-sm">
            <a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">{t('landing.terms')}</a>
            <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">{t('landing.privacy')}</a>
          </div>
          <p className="text-sm text-muted-foreground">Email: <a href="mailto:contact@babytrackai.com" className="hover:text-foreground transition-colors">contact@babytrackai.com</a></p>
          <p className="text-sm text-muted-foreground">Website: <a href="https://www.babytrackai.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">https://www.babytrackai.com</a></p>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Baby TrackAI. All rights reserved.</p>
        </div>
      </footer>

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
