import { CSSProperties } from 'react';
import { RecordType } from '@/types';
import sleepIcon from '@/assets/icons/sleep.png';
import feedingIcon from '@/assets/icons/feeding.png';
import nightWakeIcon from '@/assets/icons/night-wake.png';
import diaperIcon from '@/assets/icons/diaper.png';
import bathIcon from '@/assets/icons/bath.png';
import pottyIcon from '@/assets/icons/potty.png';
import waterIcon from '@/assets/icons/water.png';
import solidFoodIcon from '@/assets/icons/solid-food.png';

const iconMap: Record<RecordType, string> = {
  sleep: sleepIcon,
  feeding: feedingIcon,
  night_wake: nightWakeIcon,
  diaper: diaperIcon,
  bath: bathIcon,
  potty: pottyIcon,
  water: waterIcon,
  solid_food: solidFoodIcon,
};

interface RecordIconProps {
  type: RecordType;
  className?: string;
  style?: CSSProperties;
}

export function RecordIcon({ type, className, style }: RecordIconProps) {
  const src = iconMap[type];
  if (!src) return null;

  return (
    <img
      src={src}
      alt={type}
      className={className}
      style={{ objectFit: 'contain', ...style }}
    />
  );
}
