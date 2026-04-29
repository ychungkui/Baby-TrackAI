import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useBabyContext } from '@/contexts/BabyContext'
import { useRecords } from '@/hooks/useRecords'
import { useWeeklyRecords } from '@/hooks/useWeeklyRecords'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import shareIcon from '@/assets/icons/share.png'
import calenderIcon from '@/assets/icons/calender.png'
import baby1 from '@/assets/icons/baby1.png' // ✅ 新增

import { format, subDays, addDays, isToday, isFuture } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import { DayStatCards } from '@/components/summary/DayStatCards'
import { WeeklyTrendChart } from '@/components/summary/WeeklyTrendChart'
import { RecordTimeline } from '@/components/records/RecordTimeline'

import { BottomNav } from '@/components/layout/BottomNav'
import { BabySelector } from '@/components/baby/BabySelector'
import { AddBabyDialog } from '@/components/baby/AddBabyDialog'
import { ShareDialog } from '@/components/share/ShareDialog'
import { HeaderBranding } from '@/components/layout/HeaderBranding'

import { useLanguage } from '@/i18n'
import penIcon from '@/assets/icons/pen.png'

export default function DailySummary() {
  const { user, loading: authLoading } = useAuth()
  const { currentBaby, babies, loading: babiesLoading } = useBabyContext()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [addBabyOpen, setAddBabyOpen] = useState(false)

  const { records, loading: recordsLoading } = useRecords(selectedDate)
  const { data: weeklyData = [], isLoading: weeklyLoading } = useWeeklyRecords(selectedDate)

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth')
  }, [user, authLoading, navigate])

  const goToPreviousDay = () => setSelectedDate(prev => subDays(prev, 1))

  const goToNextDay = () =>
    setSelectedDate(prev => {
      const next = addDays(prev, 1)
      return isFuture(next) ? prev : next
    })

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      setCalendarOpen(false)
    }
  }

  if (authLoading || babiesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">
          {t('common.loading')}
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 to-background pb-20">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-blue-600 text-white">
        <div className="container flex flex-col gap-1 py-2 px-4">

          <div className="flex justify-center">
            <HeaderBranding className="text-white" />
          </div>

          <div className="flex items-center justify-between">
            <BabySelector onAddBaby={() => setAddBabyOpen(true)} showAddBaby={false} />

            <div className="flex items-center gap-1">
              {currentBaby && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShareOpen(true)}
                  disabled={records.length === 0}
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  <img src={shareIcon} alt="Share" className="w-5 h-5" />
                </Button>
              )}
              <span className="text-sm">
                {t('summary.title')}
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* Main */}
      <main className="container px-4 py-6 space-y-6">

        {/* 日期選擇 */}
{currentBaby && (
  <div className="flex items-center justify-center gap-2">
    <Button variant="ghost" size="icon" onClick={goToPreviousDay}>
      <ChevronLeft className="w-5 h-5" />
    </Button>

    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="min-w-[180px] justify-center gap-2 font-medium">
          <img src={calenderIcon} alt="Calendar" className="w-4 h-4" />
          {isToday(selectedDate)
            ? t('summary.today')
            : format(selectedDate, 'yyyy-MM-dd')}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={(date) => isFuture(date)}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>

    <Button
      variant="ghost"
      size="icon"
      onClick={goToNextDay}
      disabled={isToday(selectedDate)}
    >
      <ChevronRight className="w-5 h-5" />
    </Button>
  </div>
)}

        {/* 🔥 空狀態（完全升級版） */}
        {!currentBaby ? (
          <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center items-center text-center px-4 gap-5">

            <img
              src={baby1}
              alt="Baby"
              className="w-[200px] md:w-[240px] h-auto"
            />

            <h1 className="text-pink-500 font-bold text-3xl md:text-4xl leading-tight">
  {t('summary.empty_title')}
</h1>

<p className="text-pink-400 text-base md:text-lg font-medium mt-2">
  {t('summary.empty_subtitle')}
</p>

          <Button
  size="lg"
  onClick={() => setAddBabyOpen(true)}
  className="h-12 px-8 text-base flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
>
  <img src={penIcon} alt="pen" className="w-5 h-5" />
  {t('hero.cta')}
</Button>

          </div>
        ) : (
          <>
            {/* 今日統計 */}
            <section>
              <h2 className="font-semibold mb-3">
                {isToday(selectedDate)
                  ? t('summary.today_overview')
                  : t('summary.date_overview', { date: format(selectedDate, 'MM/dd') })}
              </h2>
              <DayStatCards
                records={records}
                loading={recordsLoading}
                selectedDate={selectedDate}
              />
            </section>

            {/* 週趨勢 */}
            <section>
              <h2 className="font-semibold mb-3">
                {t('summary.weekly_trend')}
              </h2>
              <div className="rounded-lg border border-border bg-card p-4">
                <WeeklyTrendChart data={weeklyData} loading={weeklyLoading} />
              </div>
            </section>

            {/* 記錄 */}
            <section>
              <h2 className="font-semibold mb-3">
                {t('summary.day_records')}
              </h2>
              <RecordTimeline
                records={records}
                selectedDate={selectedDate}
              />
            </section>
          </>
        )}

      </main>

      {/* Dialogs */}
      {currentBaby && (
        <ShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          babyName={currentBaby.name}
          date={selectedDate}
          records={records}
        />
      )}

      <AddBabyDialog
        open={addBabyOpen}
        onOpenChange={setAddBabyOpen}
      />

      <BottomNav />
    </div>
  )
}