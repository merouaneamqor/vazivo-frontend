"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

interface UploadedFile {
  signed_id: string;
  url: string;
  file: File;
}

interface UseFileUploadOptions {
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  onSuccess?: (files: UploadedFile[]) => void;
  onError?: (error: Error) => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const {
    maxFiles = 10,
    maxSizeMB = 10,
    acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
    onSuccess,
    onError,
  } = options;

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const results: UploadedFile[] = [];

      for (const file of files) {
        // Validate file
        if (!acceptedTypes.includes(file.type)) {
          throw new Error(`File type ${file.type} is not supported`);
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds ${maxSizeMB}MB limit`);
        }

        // Upload file
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        try {
          const result = await api.uploadFile(file);
          results.push({ ...result, file });
          setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
        } catch (error) {
          setUploadProgress((prev) => ({ ...prev, [file.name]: -1 }));
          throw error;
        }
      }

      return results;
    },
    onSuccess: (data) => {
      setUploadedFiles((prev) => [...prev, ...data].slice(0, maxFiles));
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });

  const upload = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remainingSlots = maxFiles - uploadedFiles.length;

      if (fileArray.length > remainingSlots) {
        throw new Error(`Can only upload ${remainingSlots} more file(s)`);
      }

      return uploadMutation.mutateAsync(fileArray);
    },
    [maxFiles, uploadedFiles.length, uploadMutation]
  );

  const removeFile = useCallback((signedId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.signed_id !== signedId));
  }, []);

  const clearFiles = useCallback(() => {
    setUploadedFiles([]);
    setUploadProgress({});
  }, []);

  return {
    upload,
    uploadedFiles,
    uploadProgress,
    isUploading: uploadMutation.isPending,
    error: uploadMutation.error,
    removeFile,
    clearFiles,
    // Get signed IDs for form submission
    signedIds: uploadedFiles.map((f) => f.signed_id),
  };
}

export default useFileUpload;
