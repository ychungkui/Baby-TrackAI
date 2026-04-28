import { useRef, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { format } from 'date-fns';
import { BabyRecord, FeedingNotes, WaterNotes, SolidFoodNotes } from '@/types';
import { calcDayDurationMinutes } from '@/lib/sleep-utils';
import type { ShareCardData } from '@/components/share/ShareCard';

interface UseShareCardOptions {
  babyName: string;
  date: Date;
  records: BabyRecord[];
}

export function useShareCard({ babyName, date, records }: UseShareCardOptions) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const cardData: ShareCardData = (() => {
    const sleepRecords = records.filter(r => r.type === 'sleep');
    const feedingRecords = records.filter(r => r.type === 'feeding');
    const nightWakeRecords = records.filter(r => r.type === 'night_wake');
    const diaperRecords = records.filter(r => r.type === 'diaper');
    const bathRecords = records.filter(r => r.type === 'bath');
    const pottyRecords = records.filter(r => r.type === 'potty');
    const waterRecords = records.filter(r => r.type === 'water');
    const solidFoodRecords = records.filter(r => r.type === 'solid_food');

    // Use calcDayDurationMinutes for cross-midnight sleep splitting
    const totalSleepMinutes = sleepRecords.reduce((sum, r) => {
      const notes = r.notes as { duration_minutes?: number };
      if (!notes.duration_minutes) return sum;
      return sum + calcDayDurationMinutes(r.start_time, notes.duration_minutes, date);
    }, 0);

    const totalMl = feedingRecords.reduce((sum, r) => {
      const notes = r.notes as FeedingNotes;
      return sum + (notes.amount_ml || 0);
    }, 0);

    const totalWaterMl = waterRecords.reduce((sum, r) => {
      const notes = r.notes as WaterNotes;
      return sum + (notes.amount_ml || 0);
    }, 0);

    const totalFoodGrams = solidFoodRecords.reduce((sum, r) => {
      const notes = r.notes as SolidFoodNotes;
      return sum + (notes.amount_grams || 0);
    }, 0);

    return {
      babyName,
      date,
      sleepHours: Math.floor(totalSleepMinutes / 60),
      sleepMinutes: totalSleepMinutes % 60,
      sleepCount: sleepRecords.length,
      feedingCount: feedingRecords.length,
      feedingMl: totalMl,
      nightWakeCount: nightWakeRecords.length,
      diaperCount: diaperRecords.length,
      bathCount: bathRecords.length,
      pottyCount: pottyRecords.length,
      waterCount: waterRecords.length,
      waterMl: totalWaterMl,
      solidFoodCount: solidFoodRecords.length,
      solidFoodGrams: totalFoodGrams,
    };
  })();

  const generateImage = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    setGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const res = await fetch(dataUrl);
      return await res.blob();
    } catch (err) {
      console.error('Failed to generate image:', err);
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  const download = useCallback(async () => {
    const blob = await generateImage();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${babyName}-${format(date, 'yyyy-MM-dd')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generateImage, babyName, date]);

  const share = useCallback(async () => {
    const blob = await generateImage();
    if (!blob) return;

    const file = new File([blob], `${babyName}-${format(date, 'yyyy-MM-dd')}.png`, {
      type: 'image/png',
    });

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: `${babyName}`,
          text: `${babyName} ${format(date, 'yyyy-MM-dd')}`,
          files: [file],
        });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${babyName}-${format(date, 'yyyy-MM-dd')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generateImage, babyName, date]);

  return {
    open,
    setOpen,
    cardRef,
    cardData,
    generating,
    download,
    share,
  };
}
