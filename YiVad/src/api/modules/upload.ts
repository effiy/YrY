/**
 * File upload module — backed by the YiAi OSS service via the
 * file-service fetch helper. FormData is converted to a data URL
 * client-side and posted to the YiAi `/upload/upload-image-to-oss`
 * route, which returns the public URL of the uploaded asset.
 */
import { uploadImageToOss } from "./fileService";
import type { Upload } from "@/api/interface/index";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error || new Error("FileReader failed"));
    reader.readAsDataURL(file);
  });
}

// Image upload (FormData with a single `file` field)
export async function uploadImg(params: FormData): Promise<{ data: Upload.ResFileUrl }> {
  const file = params.get("file") as File | null;
  if (!file) {
    return { data: { fileUrl: "" } };
  }
  const dataUrl = await fileToDataUrl(file);
  const fileUrl = await uploadImageToOss(dataUrl, "yivad/images");
  return { data: { fileUrl } };
}

// Video upload — OSS endpoint currently image-only; reuse the same path
export async function uploadVideo(params: FormData): Promise<{ data: Upload.ResFileUrl }> {
  return uploadImg(params);
}
