import { useRef, useState } from 'react';
import { Baby as BabyIcon, ChevronDown, Plus, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useBabyContext } from '@/contexts/BabyContext';
import { useBabies } from '@/hooks/useBabies';
import { Baby as BabyType } from '@/types';
import { differenceInMonths, differenceInDays, addMonths } from 'date-fns';
import { useLanguage } from '@/i18n';
import AvatarCropModal from '@/components/AvatarCropModal';

function calculateAge(birthDate: string, t: (k: string) => string): string {
  const birth = new Date(birthDate);
  const today = new Date();
  const months = differenceInMonths(today, birth);
  const afterMonths = addMonths(birth, months);
  const days = differenceInDays(today, afterMonths);
  if (months === 0) return `${days}${t('baby.days')}`;
  return `${months}${t('baby.months')}${days}${t('baby.days')}`;
}

interface BabySelectorProps {
  onAddBaby: () => void;
  showAddBaby?: boolean;
}

export function BabySelector({ onAddBaby, showAddBaby = true }: BabySelectorProps) {
  const { babies, currentBaby, setCurrentBaby, loading } = useBabyContext();
  const { uploadAvatar } = useBabies();
  const { t } = useLanguage();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentBaby) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  // 🔥 核心修正：upload 後即時更新 UI
  const handleCropConfirm = async (blob: Blob) => {
    if (!currentBaby) return;

    const file = new File([blob], 'avatar.jpg', {
      type: 'image/jpeg',
    });

    try {
      const newUrl = await uploadAvatar(currentBaby.id, file);

      // ✅ 立即更新 currentBaby（關鍵）
      setCurrentBaby({
        ...currentBaby,
        avatar_url: newUrl,
      });

      setPreview(null);
    } catch (err) {
      console.error('Avatar upload failed', err);
    }
  };

  if (loading)
    return (
      <div className="flex items-center gap-2 text-white">
        <BabyIcon className="w-5 h-5 text-white" />
        <span className="text-sm text-white">{t('baby.loading')}</span>
      </div>
    );

  if (babies.length === 0)
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onAddBaby}
        className="gap-2 text-white hover:bg-white/10"
      >
        <Plus className="w-4 h-4" />
        {t('baby.add_new')}
      </Button>
    );

  return (
    <>
      <div className="flex items-center gap-3">
        {/* 👶 Avatar */}
        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
          <Avatar className="h-10 w-10 border-2 border-white/30">
            {currentBaby?.avatar_url ? (
              <AvatarImage
                src={currentBaby.avatar_url}
                alt={currentBaby.name}
                className="object-cover"
              />
            ) : null}

            <AvatarFallback className="bg-white/20 text-white font-bold text-sm">
              {currentBaby?.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>

          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-4 h-4 text-white" />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* 👶 Info */}
        <div className="flex items-center gap-1">
          <div className="flex flex-col">
            <span className="font-medium text-sm leading-tight text-white">
              {currentBaby?.name}
            </span>

            {currentBaby?.birth_date && (
              <span className="text-xs text-white/70 leading-tight">
                {calculateAge(currentBaby.birth_date, t)}
              </span>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 ml-1 text-white hover:bg-white/10"
              >
                <ChevronDown className="w-4 h-4 text-white" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-48">
              {babies.map((baby: BabyType) => (
                <DropdownMenuItem
                  key={baby.id}
                  onClick={() => setCurrentBaby(baby)}
                  className={currentBaby?.id === baby.id ? 'bg-accent' : ''}
                >
                  <Avatar className="h-6 w-6 mr-2">
                    {baby.avatar_url ? (
                      <AvatarImage src={baby.avatar_url} alt={baby.name} />
                    ) : null}

                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {baby.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {baby.name}
                </DropdownMenuItem>
              ))}

              {showAddBaby && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onAddBaby}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('baby.add_new')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 🔥 Crop Modal */}
      {preview && (
        <AvatarCropModal
          image={preview}
          onCancel={() => setPreview(null)}
          onConfirm={handleCropConfirm}
        />
      )}
    </>
  );
}