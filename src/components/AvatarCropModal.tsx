import Cropper from 'react-easy-crop';
import { useState } from 'react';
import { useLanguage } from '@/i18n'; // ✅ 正確：用你現在 App 的 i18n

interface Props {
  image: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}

export default function AvatarCropModal({ image, onCancel, onConfirm }: Props) {
  const { t } = useLanguage(); // ✅ 正確

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = (_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const createImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(img);
    });

  const getCroppedImg = async () => {
    const img = await createImage(image);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const size = 512;
    canvas.width = size;
    canvas.height = size;

    ctx?.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      size,
      size
    );

    ctx!.globalCompositeOperation = 'destination-in';
    ctx!.beginPath();
    ctx!.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx!.closePath();
    ctx!.fill();

    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png', 0.9);
    });
  };

  const handleConfirm = async () => {
    const blob = await getCroppedImg();
    onConfirm(blob);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
      <div className="bg-white p-5 rounded-xl w-[340px] shadow-xl relative">

        {/* Crop 區 */}
        <div className="relative w-full h-[260px] bg-black rounded-full overflow-hidden">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* 按鈕 */}
        <div className="flex justify-between items-center mt-5 bg-gray-100 p-3 rounded-lg relative z-[10000]">

          <button
            onClick={onCancel}
            className="px-4 py-2 bg-red-500 text-white rounded-md font-medium"
          >
            {t('common.cancel')}
          </button>

          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium"
          >
            {t('common.save')}
          </button>

        </div>
      </div>
    </div>
  );
}