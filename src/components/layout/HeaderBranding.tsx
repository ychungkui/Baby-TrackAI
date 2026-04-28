import logo from '@/assets/logo.png';
import freeBadge from '@/assets/icons/free-badge.png';
import vipBadge from '@/assets/icons/vip-badge.png';
import { useSubscription } from '@/hooks/useSubscription';

export function HeaderBranding({ className }: { className?: string }) {
  const { isPro } = useSubscription();

  return (
    <div className={`flex items-center gap-1.5 ${className || ''}`}>
      <img src={logo} alt="Baby TrackAI" className="w-7 h-6 rounded" />
      <span className="text-sm font-semibold">Baby TrackAI</span>
      <img
        src={isPro ? vipBadge : freeBadge}
        alt={isPro ? 'VIP' : 'Free'}
        className="w-5 h-5"
      />
    </div>
  );
}
