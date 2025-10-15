import type { ImageData } from './types.js';

export function cleanObject(obj: any): any {
  if (Array.isArray(obj)) return obj.map(cleanObject);
  if (obj && typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value != null && value !== '' && !(Array.isArray(value) && value.length === 0)) {
        cleaned[key] = cleanObject(value);
      }
    }
    return cleaned;
  }
  return obj;
}

export function collectImageData(obj: any): ImageData[] {
  const images: ImageData[] = [];
  const seenPaths = new Set<string>();

  function collect(obj: any) {
    if (Array.isArray(obj)) {
      obj.forEach(item => collect(item));
    } else if (obj && typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'imageData' && typeof value === 'string' && obj.imagePath) {
          if (!seenPaths.has(obj.imagePath)) {
            images.push({ path: obj.imagePath, data: value });
            seenPaths.add(obj.imagePath);
          }
        } else if (key === 'svgData' && obj.svgPath) {
          // Handle both string (combined SVG) and base64 encoded data
          if (typeof value === 'string' && !seenPaths.has(obj.svgPath)) {
            images.push({ path: obj.svgPath, data: value });
            seenPaths.add(obj.svgPath);
          }
        } else {
          collect(value);
        }
      }
    }
  }

  collect(obj);
  return images;
}

export function removeImageDataFromJson(obj: any): any {
  if (Array.isArray(obj)) return obj.map(removeImageDataFromJson);
  if (obj && typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'imageData' || key === 'svgData') {
        // Skip imageData and svgData, keep imagePath and svgPath
        continue;
      } else {
        cleaned[key] = removeImageDataFromJson(value);
      }
    }
    return cleaned;
  }
  return obj;
}