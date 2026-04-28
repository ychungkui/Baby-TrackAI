import { GrowthPhoto } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useLanguage } from '@/i18n';
import penIcon from '@/assets/icons/pen.png';
import trashIcon from '@/assets/icons/trash.png';

interface PhotoCardProps { photo: GrowthPhoto; onEdit: (photo: GrowthPhoto) => void; onDelete: (photo: GrowthPhoto) => void; }

export function PhotoCard({ photo, onEdit, onDelete }: PhotoCardProps) {
  const { t } = useLanguage();
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square overflow-hidden"><img src={photo.image_url} alt={photo.caption || t('growth.growth_photo')} className="w-full h-full object-cover" loading="lazy" /></div>
      <div className="p-3 space-y-1">
        {photo.caption && <p className="text-sm text-foreground line-clamp-2">{photo.caption}</p>}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{format(new Date(photo.taken_at), 'yyyy/MM/dd')}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(photo)}><img src={penIcon} alt="Edit" className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(photo)}><img src={trashIcon} alt="Delete" className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
