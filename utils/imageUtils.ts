/**
 * 画像を圧縮・リサイズするユーティリティ
 */

export const compressImage = async (
    base64Str: string,
    maxWidth = 800, // API制限を考慮して小さめに設定
    quality = 0.7
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64Str;

        img.onload = () => {
            let width = img.width;
            let height = img.height;

            // アスペクト比を維持してリサイズ
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas context failure'));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            // JPEGとして圧縮 (quality 0.0 - 1.0)
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedBase64);
        };

        img.onerror = (e) => {
            reject(new Error('Image load failed'));
        };
    });
};
