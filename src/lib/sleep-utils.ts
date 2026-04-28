import { startOfDay, endOfDay } from 'date-fns';

/**
 * 計算一筆帶有 duration 的記錄在指定日期內的實際分鐘數。
 * 用於跨午夜睡眠拆分：例如 22:00 開始睡 540 分鐘，
 * 在當天只算 120 分鐘（22:00-00:00），隔天算 420 分鐘（00:00-07:00）。
 */
export function calcDayDurationMinutes(
  startTime: string,
  durationMinutes: number,
  targetDate: Date
): number {
  if (!durationMinutes || durationMinutes <= 0) return 0;

  const start = new Date(startTime).getTime();
  const end = start + durationMinutes * 60000;
  const dayStart = startOfDay(targetDate).getTime();
  const dayEnd = endOfDay(targetDate).getTime();

  const overlapStart = Math.max(start, dayStart);
  const overlapEnd = Math.min(end, dayEnd);

  if (overlapEnd <= overlapStart) return 0;
  return Math.round((overlapEnd - overlapStart) / 60000);
}
