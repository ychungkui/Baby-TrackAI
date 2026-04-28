import { forwardRef } from 'react';
import { format } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';
import { RecordIcon } from '@/components/icons/RecordIcon';
import { RecordType } from '@/types';
import logo from '@/assets/logo.jpg';
import freeBadge from '@/assets/icons/free-badge.png';
import vipBadge from '@/assets/icons/vip-badge.png';

export interface ShareCardData {
  babyName: string;
  date: Date;
  sleepHours: number;
  sleepMinutes: number;
  sleepCount: number;
  feedingCount: number;
  feedingMl: number;
  nightWakeCount: number;
  diaperCount: number;
  bathCount: number;
  pottyCount: number;
  waterCount: number;
  waterMl: number;
  solidFoodCount: number;
  solidFoodGrams: number;
}

interface ShareCardProps {
  data: ShareCardData;
  isPro?: boolean;
  language?: string;
  t?: (key: string, params?: Record<string, string | number>) => string;
}

const dateFormats: Record<string, { fmt: string; locale: any }> = {
  zh: { fmt: 'yyyy年MM月dd日 EEEE', locale: zhTW },
  en: { fmt: 'EEEE, MMMM d, yyyy', locale: enUS },
  ms: { fmt: 'EEEE, d MMMM yyyy', locale: enUS },
};

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ data, isPro = false, language = 'zh', t }, ref) => {
    const dateFmt = dateFormats[language] || dateFormats.zh;
    const formattedDate = format(data.date, dateFmt.fmt, { locale: dateFmt.locale });

    const tr = (key: string) => t ? t(key) : key;

    const timesUnit = tr('common.times');
    const hoursUnit = tr('records.hours_short');
    const minsUnit = tr('records.mins_short');

    const sleepValue =
      data.sleepHours > 0 || data.sleepMinutes > 0
        ? `${data.sleepHours}${hoursUnit}${data.sleepMinutes}${minsUnit}`
        : `${data.sleepCount} ${timesUnit}`;

    const feedingValue =
      data.feedingMl > 0
        ? `${data.feedingCount} ${timesUnit} / ${data.feedingMl}ml`
        : `${data.feedingCount} ${timesUnit}`;

    const titleText = language === 'en'
      ? `${data.babyName}'s Day`
      : language === 'ms'
        ? `Hari ${data.babyName}`
        : `${data.babyName}的一天`;

    const stats: { label: string; value: string; type: RecordType; color: string }[] = [
      { label: tr('records.sleep'), value: sleepValue, type: 'sleep', color: '#7c6bf0' },
      { label: tr('records.feeding'), value: feedingValue, type: 'feeding', color: '#34d399' },
      { label: tr('records.night_wake'), value: `${data.nightWakeCount} ${timesUnit}`, type: 'night_wake', color: '#a855f7' },
      { label: tr('records.diaper'), value: `${data.diaperCount} ${timesUnit}`, type: 'diaper', color: '#38bdf8' },
      { label: tr('records.bath'), value: `${data.bathCount} ${timesUnit}`, type: 'bath', color: '#2dd4bf' },
      { label: tr('records.potty'), value: `${data.pottyCount} ${timesUnit}`, type: 'potty', color: '#d97706' },
      { label: tr('records.water'), value: data.waterMl > 0 ? `${data.waterCount} ${timesUnit} / ${data.waterMl}ml` : `${data.waterCount} ${timesUnit}`, type: 'water', color: '#3b82f6' },
      { label: tr('records.solid_food'), value: data.solidFoodGrams > 0 ? `${data.solidFoodCount} ${timesUnit} / ${data.solidFoodGrams}g` : `${data.solidFoodCount} ${timesUnit}`, type: 'solid_food', color: '#f97316' },
    ];

    return (
      <div
        ref={ref}
        style={{
          width: 375,
          height: 680,
          background: 'linear-gradient(160deg, hsl(222, 47%, 11%) 0%, hsl(217, 50%, 18%) 50%, hsl(222, 47%, 8%) 100%)',
          borderRadius: 16,
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
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
          <div style={{ fontSize: 14, opacity: 0.5 }}>
            {formattedDate}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {stats.map(({ label, value, type, color }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '8px 12px',
                background: 'hsla(217, 33%, 17%, 0.6)',
                borderRadius: 10,
                borderLeft: `3px solid ${color}`,
              }}
            >
              <RecordIcon type={type} className="w-6 h-6" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';
