/**
 * 🔥 Growth Photos 壓縮（大圖用）
 */
export async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');

      const MAX_WIDTH = 1280;
      const MAX_HEIGHT = 1280;

      let width = img.width;
      let height = img.height;

      // 🔥 Resize
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      // 🔥 壓縮輸出
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);

          const compressed = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
            type: 'image/jpeg',
          });

          resolve(compressed);
        },
        'image/jpeg',
        0.7
      );
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 👶 Avatar 專用（正方形裁切 + 壓縮）
 */
export async function processAvatar(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');

      const SIZE = 300; // 🔥 avatar尺寸

      canvas.width = SIZE;
      canvas.height = SIZE;

      const ctx = canvas.getContext('2d');

      // 🔥 中心裁切
      const minSide = Math.min(img.width, img.height);
      const sx = (img.width - minSide) / 2;
      const sy = (img.height - minSide) / 2;

      ctx?.drawImage(
        img,
        sx,
        sy,
        minSide,
        minSide,
        0,
        0,
        SIZE,
        SIZE
      );

      // 🔥 壓縮
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);

          const compressed = new File([blob], 'avatar.jpg', {
            type: 'image/jpeg',
          });

          resolve(compressed);
        },
        'image/jpeg',
        0.7
      );
    };

    reader.readAsDataURL(file);
  });
}