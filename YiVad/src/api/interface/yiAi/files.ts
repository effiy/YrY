export interface WriteFilePayload {
  target_file: string;
  content: string;
  is_base64?: boolean;
}

export interface ReadFilePayload {
  target_file: string;
}

export interface ReadFileResponse {
  content: string;
  target_file: string;
  size?: number;
}

export interface OssUploadPayload {
  data_url: string;
  filename?: string;
  directory?: string;
}

export interface OssUploadResponse {
  url: string;
}