import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBabyContext } from '@/contexts/BabyContext';
import { useRecords } from '@/hooks/useRecords';
import babyIcon from '@/assets/icons/baby.png';
import penIcon from '@/assets/icons/pen.png';
import reportIcon from '@/assets/icons/report.png';
import { Button } from '@/components/ui/button';
import { BabySelector } from '@/components/baby/BabySelector';
import { AddBabyDialog } from '@/components/baby/AddBabyDialog';
import { QuickActions } from '@/components/records/QuickActions';
import { RecordDialog } from '@/components/records/RecordDialog';
import { RecordTimeline } from '@/components/records/RecordTimeline';
import { TodaySummary } from '@/components/home/TodaySummary';
import { BedtimeSummary } from '@/components/home/BedtimeSummary';
import { SummaryHistoryDialog } from '@/components/summary/SummaryHistoryDialog';
import { RecordType } from '@/types';
import { BottomNav } from '@/components/layout/BottomNav';
import { HeaderBranding } from '@/components/layout/HeaderBranding';
import { useLanguage } from '@/i18n';

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const { babies, currentBaby, loading: babiesLoading } = useBabyContext();
  const { records, loading: recordsLoading, deleteRecord, isDeleting } = useRecords();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [addBabyOpen, setAddBabyOpen] = useState(false);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [selectedRecordType, setSelectedRecordType] = useState<RecordType | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<import('@/types').BabyRecord | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/landing');
  }, [user, authLoading, navigate]);

  const handleQuickRecord = (type: RecordType) => {
    setEditingRecord(null);
    setSelectedRecordType(type);
    setRecordDialogOpen(true);
  };

  const handleEditRecord = (record: import('@/types').BabyRecord) => {
    setEditingRecord(record);
    setSelectedRecordType(record.type);
    setRecordDialogOpen(true);
  };

  if (authLoading || babiesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">
          {t('common.loading')}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 to-background pb-20">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-blue-600 text-white">
        <div className="container flex flex-col gap-1 py-2 px-4">
          <div className="flex justify-center">
            <HeaderBranding className="text-white" />
          </div>

          <div className="flex items-center justify-between">
            <BabySelector onAddBaby={() => setAddBabyOpen(true)} />

            {currentBaby && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setHistoryOpen(true)}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <img src={reportIcon} alt="Report" className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container px-4 py-6">

        {/* 🔥 Hero（多語正確版） */}
        {babies.length === 0 ? (
          <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center items-center text-center px-4 gap-5">

            <img 
              src={babyIcon} 
              alt="Baby"
              className="w-[200px] md:w-[240px] h-auto"
            />

            <h1 className="text-3xl md:text-4xl font-bold text-blue-600 leading-tight">
              {t('hero.title')}
            </h1>

            <p className="text-blue-400 text-base md:text-lg font-medium">
              {t('hero.subtitle')}
            </p>

            <Button 
              onClick={() => setAddBabyOpen(true)} 
              className="h-12 px-8 text-base flex items-center gap-2"
            >
              <img src={penIcon} alt="Add" className="w-5 h-5" />
              {t('hero.cta')}
            </Button>

          </div>

        ) : currentBaby ? (

          <div className="space-y-6">

            <section>
              <BedtimeSummary 
                babyId={currentBaby.id} 
                babyName={currentBaby.name} 
              />
            </section>

            <section>
              <h2 className="font-semibold mb-3">
                {t('home.today_overview')}
              </h2>
              <TodaySummary records={records} loading={recordsLoading} />
            </section>

            <section>
              <h2 className="font-semibold mb-3">
                {t('home.quick_record')}
              </h2>
              <QuickActions onRecord={handleQuickRecord} />
            </section>

            <section>
              <h2 className="font-semibold mb-3">
                {t('home.today_records')}
              </h2>
              <RecordTimeline 
                records={records} 
                onDelete={deleteRecord} 
                onEdit={handleEditRecord} 
                isDeleting={isDeleting} 
              />
            </section>

          </div>

        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {t('home.select_baby')}
          </div>
        )}

      </main>

      {/* Dialogs */}
      <AddBabyDialog 
        open={addBabyOpen} 
        onOpenChange={setAddBabyOpen} 
      />

      <RecordDialog 
        open={recordDialogOpen} 
        onOpenChange={(open) => {
          setRecordDialogOpen(open);
          if (!open) setEditingRecord(null);
        }} 
        recordType={selectedRecordType} 
        editRecord={editingRecord} 
      />

      {currentBaby && (
        <SummaryHistoryDialog 
          open={historyOpen} 
          onOpenChange={setHistoryOpen} 
          babyId={currentBaby.id} 
          babyName={currentBaby.name} 
        />
      )}

      <BottomNav />
    </div>
  );
}