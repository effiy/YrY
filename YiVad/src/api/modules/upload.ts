import { Upload } from "@/api/interface/index";
import http from "@/api";

/**
 * @name File upload module — calls YiAi file endpoints
 */
// Image upload
export const uploadImg = (params: FormData) => {
  return http.post<Upload.ResFileUrl>(`/upload-image-to-oss`, params, { cancel: false });
};

// Video upload
export const uploadVideo = (params: FormData) => {
  return http.post<Upload.ResFileUrl>(`/upload-image-to-oss`, params, { cancel: false });
};
