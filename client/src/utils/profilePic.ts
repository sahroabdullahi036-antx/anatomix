const KEY = (u: string) => `anatomix_pfp_${u.toLowerCase().replace(/\s+/g, "_")}`;

export function loadLocalPfp(username: string): string | null {
  try { return localStorage.getItem(KEY(username)); } catch { return null; }
}

export function saveLocalPfp(username: string, dataUrl: string) {
  try { localStorage.setItem(KEY(username), dataUrl); } catch {}
}

export function removeLocalPfp(username: string) {
  try { localStorage.removeItem(KEY(username)); } catch {}
}

// Resize + center-crop an uploaded image into a small square JPEG data URL so it
// stays tiny enough to store in a Firestore user document.
export async function fileToThumbnail(file: File, size = 128, quality = 0.72): Promise<string> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(new Error("Could not read file"));
    r.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("Could not load image"));
    i.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const min = Math.min(img.width, img.height);
  const sx = (img.width - min) / 2;
  const sy = (img.height - min) / 2;
  ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);

  return canvas.toDataURL("image/jpeg", quality);
}
