import { NavLink } from '@/components/NavLink';
import { useLanguage } from '@/i18n';
import navHomeIcon from '@/assets/icons/nav-home.png';
import navSummaryIcon from '@/assets/icons/nav-summary.png';
import navGrowthIcon from '@/assets/icons/nav-growth.png';
import navChatIcon from '@/assets/icons/nav-chat.png';
import navSettingsIcon from '@/assets/icons/nav-settings.png';

export function BottomNav() {
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border safe-area-bottom">
      <div className="container flex items-center justify-around h-16 px-4">
        <NavLink to="/" className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors text-muted-foreground" activeClassName="text-primary bg-primary/10">
          <img src={navHomeIcon} alt="Home" className="w-6 h-6" />
          <span className="text-[10px] font-medium">{t('nav.home')}</span>
        </NavLink>
        <NavLink to="/summary" className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors text-muted-foreground" activeClassName="text-primary bg-primary/10">
          <img src={navSummaryIcon} alt="Summary" className="w-6 h-6" />
          <span className="text-[10px] font-medium">{t('nav.summary')}</span>
        </NavLink>
        <NavLink to="/growth" className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors text-muted-foreground" activeClassName="text-primary bg-primary/10">
          <img src={navGrowthIcon} alt="Growth" className="w-6 h-6" />
          <span className="text-[10px] font-medium">{t('nav.growth')}</span>
        </NavLink>
        <NavLink to="/chat" className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors text-muted-foreground" activeClassName="text-primary bg-primary/10">
          <img src={navChatIcon} alt="AI Chat" className="w-6 h-6" />
          <span className="text-[10px] font-medium">{t('nav.ai_assistant')}</span>
        </NavLink>
        <NavLink to="/settings" className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors text-muted-foreground" activeClassName="text-primary bg-primary/10">
          <img src={navSettingsIcon} alt="Settings" className="w-6 h-6" />
          <span className="text-[10px] font-medium">{t('nav.settings')}</span>
        </NavLink>
      </div>
    </nav>
  );
}
