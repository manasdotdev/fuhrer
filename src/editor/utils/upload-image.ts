/**
 * Default local upload: read file as a data URL so it persists in editor JSON.
 * Replace via ImageUpload / FileHandler `upload` option for real server uploads.
 */
export async function uploadImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Failed to read image file'));
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error('Failed to read image file'));
    };

    reader.readAsDataURL(file);
  });
}

export function imageAltFromFileName(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '') || 'image';
}
