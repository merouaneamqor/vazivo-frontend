"use client";

import { useState, useCallback, useRef } from "react";
import { getCloudinarySignParams, type CloudinaryUploadResult } from "@/lib/cloudinary-upload";

const CLOUD_NAME = "dqssnduni";
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "completed" | "error";
  result?: CloudinaryUploadResult;
  error?: string;
}

interface UseCloudinaryUploadOptions {
  folder: string;
  maxSizeMB?: number;
  onUploadComplete?: (result: CloudinaryUploadResult) => void;
  onUploadError?: (error: Error, file: File) => void;
}

/**
 * Hook for uploading files to Cloudinary with progress tracking.
 * Uses XMLHttpRequest for real-time progress updates.
 */
export function useCloudinaryUpload(options: UseCloudinaryUploadOptions) {
  const { folder, maxSizeMB = 10, onUploadComplete, onUploadError } = options;

  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const abortControllersRef = useRef<Map<string, () => void>>(new Map());

  const generateId = () => `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const uploadWithProgress = useCallback(
    async (file: File, uploadId: string): Promise<CloudinaryUploadResult> => {
      // Get signature from backend
      const sign = await getCloudinarySignParams(folder);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Store abort function
        abortControllersRef.current.set(uploadId, () => xhr.abort());

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadingFiles((prev) =>
              prev.map((f) => (f.id === uploadId ? { ...f, progress } : f))
            );
          }
        });

        xhr.addEventListener("load", () => {
          abortControllersRef.current.delete(uploadId);

          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              const result: CloudinaryUploadResult = {
                secure_url: data.secure_url,
                public_id: data.public_id,
                width: data.width,
                height: data.height,
                bytes: data.bytes,
              };
              resolve(result);
            } catch {
              reject(new Error("Failed to parse upload response"));
            }
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.error?.message || err.error || "Upload failed"));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener("error", () => {
          abortControllersRef.current.delete(uploadId);
          reject(new Error("Network error during upload"));
        });

        xhr.addEventListener("abort", () => {
          abortControllersRef.current.delete(uploadId);
          reject(new Error("Upload cancelled"));
        });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", sign.api_key);
        formData.append("timestamp", String(sign.timestamp));
        formData.append("signature", sign.signature);
        formData.append("folder", sign.folder);
        if (sign.public_id) formData.append("public_id", sign.public_id);

        xhr.open("POST", UPLOAD_URL);
        xhr.send(formData);
      });
    },
    [folder]
  );

  const upload = useCallback(
    async (file: File): Promise<CloudinaryUploadResult | null> => {
      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        const error = new Error(`File exceeds ${maxSizeMB}MB limit`);
        onUploadError?.(error, file);
        throw error;
      }

      const uploadId = generateId();

      // Add to uploading files
      setUploadingFiles((prev) => [
        ...prev,
        {
          id: uploadId,
          file,
          progress: 0,
          status: "uploading",
        },
      ]);

      try {
        const result = await uploadWithProgress(file, uploadId);

        // Update status to completed
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === uploadId ? { ...f, status: "completed", progress: 100, result } : f
          )
        );

        onUploadComplete?.(result);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Upload failed");

        // Update status to error
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === uploadId ? { ...f, status: "error", error: err.message } : f
          )
        );

        onUploadError?.(err, file);
        return null;
      }
    },
    [maxSizeMB, uploadWithProgress, onUploadComplete, onUploadError]
  );

  const uploadMultiple = useCallback(
    async (files: File[]): Promise<(CloudinaryUploadResult | null)[]> => {
      return Promise.all(files.map((file) => upload(file)));
    },
    [upload]
  );

  const cancelUpload = useCallback((uploadId: string) => {
    const abort = abortControllersRef.current.get(uploadId);
    if (abort) {
      abort();
    }
    setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
  }, []);

  const removeCompletedUpload = useCallback((uploadId: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
  }, []);

  const clearAll = useCallback(() => {
    // Abort all ongoing uploads
    abortControllersRef.current.forEach((abort) => abort());
    abortControllersRef.current.clear();
    setUploadingFiles([]);
  }, []);

  const isUploading = uploadingFiles.some((f) => f.status === "uploading");
  const hasErrors = uploadingFiles.some((f) => f.status === "error");

  return {
    upload,
    uploadMultiple,
    uploadingFiles,
    isUploading,
    hasErrors,
    cancelUpload,
    removeCompletedUpload,
    clearAll,
  };
}

export default useCloudinaryUpload;
