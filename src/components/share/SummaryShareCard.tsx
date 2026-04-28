import { forwardRef } from 'react';
import { format } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';
import logo from '@/assets/logo.jpg';
import freeBadge from '@/assets/icons/free-badge.png';
import vipBadge from '@/assets/icons/vip-badge.png';

interface SummaryShareCardProps {
  babyName: string;
  date: Date;
  summaryText: string;
  isPro?: boolean;
  language?: string;
}

const dateFormats: Record<string, { fmt: string; locale: any }> = {
  zh: { fmt: 'yyyy年MM月dd日 EEEE', locale: zhTW },
  en: { fmt: 'EEEE, MMMM d, yyyy', locale: enUS },
  ms: { fmt: 'EEEE, d MMMM yyyy', locale: enUS },
};

export const SummaryShareCard = forwardRef<HTMLDivElement, SummaryShareCardProps>(
  ({ babyName, date, summaryText, isPro = false, language = 'zh' }, ref) => {
    const dateFmt = dateFormats[language] || dateFormats.zh;
    const formattedDate = format(date, dateFmt.fmt, { locale: dateFmt.locale });

    const titleText = language === 'en'
      ? `${babyName}'s Day`
      : language === 'ms'
        ? `Hari ${babyName}`
        : `${babyName}的一天`;

    return (
      <div
        ref={ref}
        style={{
          width: 375,
          minHeight: 680,
          background: 'linear-gradient(160deg, hsl(222, 47%, 11%) 0%, hsl(217, 50%, 18%) 50%, hsl(222, 47%, 8%) 100%)',
          borderRadius: 16,
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#e2e8f0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'radial-gradient(circle, hsla(217, 71%, 53%, 0.15) 0%, transparent 70%)',
          }}
        />

        <div>
          <div style={{ fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.9, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <img src={logo} alt="Logo" style={{ width: 20, height: 20, borderRadius: 4 }} />
            Baby TrackAI
            {isPro ? <img src={vipBadge} alt="VIP" style={{ width: 20, height: 20 }} /> : <img src={freeBadge} alt="Free" style={{ width: 20, height: 20 }} />}
          </div>
          <div style={{ width: 40, height: 2, background: 'hsl(217, 71%, 53%)', borderRadius: 1, marginBottom: 20 }} />
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
            {titleText}
          </div>
          <div style={{ fontSize: 14, opacity: 0.5, marginBottom: 24 }}>
            {formattedDate}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            padding: '16px',
            background: 'hsla(217, 33%, 17%, 0.6)',
            borderRadius: 10,
            borderLeft: '3px solid hsl(217, 71%, 53%)',
          }}
        >
          <div style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {summaryText}
          </div>
        </div>
      </div>
    );
  }
);

SummaryShareCard.displayName = 'SummaryShareCard';
