import { Upload } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name File upload module
 */
// Image upload
export const uploadImg = (params: FormData) => {
  return http.post<Upload.ResFileUrl>(PORT1 + `/file/upload/img`, params, { cancel: false });
};

// Video upload
export const uploadVideo = (params: FormData) => {
  return http.post<Upload.ResFileUrl>(PORT1 + `/file/upload/video`, params, { cancel: false });
};
