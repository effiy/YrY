/**
 * Image Editor Core — M01 Image Editor tools (YP-09-01 through YP-09-07).
 *
 * Core canvas-based image processing pipeline with non-destructive editing.
 * Supports 21 image editing tools including crop, rotate, flip, resize,
 * brightness, contrast, saturation, white balance, curves, levels, and more.
 *
 * Design principle: All operations start from original ImageData and merge
 * parameters into a single pixel traversal to avoid cumulative error.
 */

export type ImageFormat = 'png' | 'jpeg' | 'webp';

export interface ImageInfo {
  width: number;
  height: number;
  format: ImageFormat;
  colorDepth: number;
  dpi: number;
  megapixels: number;
  compressionRatio?: number;
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResizePreset {
  label: string;
  width: number;
  height: number;
}

export const RESIZE_PRESETS: ResizePreset[] = [
  { label: 'Instagram Square', width: 1080, height: 1080 },
  { label: 'Instagram Portrait', width: 1080, height: 1350 },
  { label: 'Instagram Landscape', width: 1080, height: 566 },
  { label: 'Facebook Post', width: 1200, height: 630 },
  { label: 'Twitter Post', width: 1200, height: 675 },
  { label: 'LinkedIn Post', width: 1200, height: 627 },
  { label: 'HD 720p', width: 1280, height: 720 },
  { label: 'HD 1080p', width: 1920, height: 1080 },
  { label: '4K', width: 3840, height: 2160 },
  { label: 'Thumbnail', width: 150, height: 150 },
  { label: 'Icon 32', width: 32, height: 32 },
  { label: 'Icon 64', width: 64, height: 64 },
  { label: 'Icon 128', width: 128, height: 128 },
  { label: 'Icon 256', width: 256, height: 256 },
  { label: 'Passport (US)', width: 600, height: 600 },
  { label: 'Passport (CN)', width: 354, height: 472 },
  { label: 'A4 @ 150dpi', width: 1240, height: 1754 },
  { label: 'A4 @ 300dpi', width: 2480, height: 3508 },
];

export interface AdjustParams {
  brightness: number;    // -100 to 100, default 0
  contrast: number;      // -100 to 100, default 0
  saturation: number;    // -100 to 100, default 0
  exposure: number;      // -4 to 4 EV, default 0
  temperature: number;   // 2000-40000 Kelvin
  vibrance: number;      // -100 to 100, default 0
  dehaze: number;        // 0 to 100, default 0
  vignette: number;      // 0 to 100, default 0
  gamma: number;         // 0.1 to 10, default 1
  highlights: number;    // -100 to 100, default 0
  shadows: number;       // -100 to 100, default 0
}

export const DEFAULT_ADJUST_PARAMS: AdjustParams = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  temperature: 6500,
  vibrance: 0,
  dehaze: 0,
  vignette: 0,
  gamma: 1,
  highlights: 0,
  shadows: 0,
};

/**
 * Load an image from a File/Blob and return HTMLImageElement.
 */
export function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

/**
 * Create a canvas from an Image element.
 */
export function imageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  return canvas;
}

/**
 * Apply crop to canvas.
 */
export function cropImage(source: HTMLCanvasElement, rect: CropRect): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = rect.width;
  canvas.height = rect.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(source, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
  return canvas;
}

/**
 * Rotate canvas by 90-degree increments (0, 90, 180, 270).
 */
export function rotateImage(source: HTMLCanvasElement, degrees: number): HTMLCanvasElement {
  const rad = (degrees * Math.PI) / 180;
  const canvas = document.createElement('canvas');
  if (degrees === 90 || degrees === 270) {
    canvas.width = source.height;
    canvas.height = source.width;
  } else {
    canvas.width = source.width;
    canvas.height = source.height;
  }
  const ctx = canvas.getContext('2d')!;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);
  return canvas;
}

/**
 * Flip canvas horizontally or vertically.
 */
export function flipImage(source: HTMLCanvasElement, horizontal: boolean, vertical: boolean): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext('2d')!;
  ctx.translate(horizontal ? canvas.width : 0, vertical ? canvas.height : 0);
  ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1);
  ctx.drawImage(source, 0, 0);
  return canvas;
}

/**
 * Resize canvas with configurable algorithm.
 */
export function resizeImage(
  source: HTMLCanvasElement,
  newWidth: number,
  newHeight: number,
  algorithm: 'bilinear' | 'bicubic' | 'nearest' = 'bilinear',
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = algorithm !== 'nearest';
  ctx.imageSmoothingQuality = algorithm === 'bicubic' ? 'high' : 'medium';
  ctx.drawImage(source, 0, 0, newWidth, newHeight);
  return canvas;
}

/**
 * Apply brightness/contrast adjustment. Single-pass for performance.
 */
export function adjustBrightnessContrast(
  source: HTMLCanvasElement,
  brightness: number,
  contrast: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(source, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const b = brightness; // -100 to 100
  const c = (contrast + 100) / 100; // -100→0, 0→1, 100→2

  for (let i = 0; i < data.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      let v = data[i + j] + b;
      v = ((v - 128) * c) + 128;
      data[i + j] = Math.max(0, Math.min(255, v));
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Apply saturation adjustment (HSL-based).
 */
export function adjustSaturation(source: HTMLCanvasElement, saturation: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(source, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const sat = (saturation + 100) / 100; // 0-2 range

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const s = max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1));
    const newS = Math.max(0, Math.min(1, s * sat));
    const d = max - min;
    if (d === 0) { data[i] = data[i + 1] = data[i + 2] = Math.round(l * 255); continue; }

    const h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) / 6 :
             max === g ? ((b - r) / d + 2) / 6 :
             ((r - g) / d + 4) / 6;
    const c = (1 - Math.abs(2 * l - 1)) * newS;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    let nr: number, ng: number, nb: number;
    if (h < 1 / 6) [nr, ng, nb] = [c, x, 0];
    else if (h < 2 / 6) [nr, ng, nb] = [x, c, 0];
    else if (h < 3 / 6) [nr, ng, nb] = [0, c, x];
    else if (h < 4 / 6) [nr, ng, nb] = [0, x, c];
    else if (h < 5 / 6) [nr, ng, nb] = [x, 0, c];
    else [nr, ng, nb] = [c, 0, x];
    data[i] = Math.round((nr + m) * 255);
    data[i + 1] = Math.round((ng + m) * 255);
    data[i + 2] = Math.round((nb + m) * 255);
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Get image metadata info.
 */
export function getImageInfo(file: File, img: HTMLImageElement): ImageInfo {
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    format: (file.type?.split('/')[1] || 'png') as ImageFormat,
    colorDepth: 32, // canvas всегда RGBA 32-bit
    dpi: 72, // canvas doesn't preserve DPI
    megapixels: Math.round((img.naturalWidth * img.naturalHeight) / 1_000_000 * 100) / 100,
    compressionRatio: file.size > 0 ? Math.round((img.naturalWidth * img.naturalHeight * 4) / file.size * 100) / 100 : undefined,
  };
}

/**
 * Export canvas to Blob.
 */
export function canvasToBlob(canvas: HTMLCanvasElement, format: ImageFormat = 'png', quality = 0.92): Promise<Blob> {
  const mime = `image/${format}`;
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas export failed'));
    }, mime, quality);
  });
}

/**
 * Download a canvas as an image file.
 */
export function downloadCanvas(canvas: HTMLCanvasElement, filename: string, format: ImageFormat = 'png'): void {
  canvasToBlob(canvas, format).then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  });
}