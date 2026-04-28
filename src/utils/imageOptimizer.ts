export type ImageType = 'avatar' | 'photo';

export const optimizeImage = async (file: File, type: ImageType): Promise<Blob> => {
  const img = new Image();
  const imageUrl = URL.createObjectURL(file);

  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
    img.src = imageUrl;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  let targetWidth = img.width;
  let targetHeight = img.height;
  let quality = 0.8;

  if (type === 'avatar') {
    targetWidth = 300;
    targetHeight = 300;
    quality = 0.7;
  }

  if (type === 'photo') {
    const maxSize = 1080;

    if (img.width > maxSize || img.height > maxSize) {
      const ratio = Math.min(maxSize / img.width, maxSize / img.height);
      targetWidth = img.width * ratio;
      targetHeight = img.height * ratio;
    }

    quality = 0.75;
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob as Blob), 'image/jpeg', quality);
  });
};