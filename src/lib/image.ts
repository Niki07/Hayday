// Browser-side image preparation for /api/extract (D-023): long edge 1600 px, JPEG 0.85.
// Drawing to a canvas also turns iPhone HEIC into JPEG and applies the photo's rotation.

export type PreparedFile = {
  base64: string; // no data: prefix
  mimeType: string;
  thumbnail?: string; // small JPEG data URL for display and sessionStorage
};

const MAX_EDGE = 1600;
const QUALITY = 0.85;
const THUMB_EDGE = 320;

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image_unreadable"));
    };
    img.src = url;
  });
}

function toJpegDataUrl(img: HTMLImageElement, maxEdge: number, quality: number): string {
  const longEdge = Math.max(img.naturalWidth, img.naturalHeight);
  const scale = Math.min(1, maxEdge / longEdge);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no_canvas");
  // JPEG has no transparency; a transparent PNG would otherwise turn black.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("file_unreadable"));
    reader.readAsDataURL(file);
  });
}

const stripPrefix = (dataUrl: string) => dataUrl.slice(dataUrl.indexOf(",") + 1);

/** Prepare a photo or PDF for upload. PDFs go as-is; images are downscaled to a JPEG. */
export async function prepareFile(file: File): Promise<PreparedFile> {
  if (file.type === "application/pdf") {
    return { base64: stripPrefix(await readAsDataUrl(file)), mimeType: "application/pdf" };
  }
  const img = await loadImage(file);
  return {
    base64: stripPrefix(toJpegDataUrl(img, MAX_EDGE, QUALITY)),
    mimeType: "image/jpeg",
    thumbnail: toJpegDataUrl(img, THUMB_EDGE, 0.7),
  };
}
