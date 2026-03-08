"use client";

import React, { useCallback, useRef } from "react";
import { Upload, X, Loader2, AlertCircle, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface FileUploadProps {
  onFilesSelected: (files: FileList | File[]) => void;
  uploadedFiles?: Array<{ signed_id: string; url: string; file: File }>;
  uploadProgress?: Record<string, number>;
  onRemoveFile?: (signedId: string) => void;
  isUploading?: boolean;
  error?: Error | null;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  onFilesSelected,
  uploadedFiles = [],
  uploadProgress = {},
  onRemoveFile,
  isUploading = false,
  error,
  maxFiles = 10,
  maxSizeMB = 10,
  accept = "image/*",
  multiple = true,
  className,
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFilesSelected(e.target.files);
        // Reset input to allow selecting the same file again
        e.target.value = "";
      }
    },
    [onFilesSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled || isUploading) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected, disabled, isUploading]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const remainingSlots = maxFiles - uploadedFiles.length;
  const canUpload = remainingSlots > 0 && !disabled && !isUploading;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => canUpload && inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          canUpload
            ? "cursor-pointer hover:border-primary hover:bg-muted/50"
            : "cursor-not-allowed opacity-50",
          "border-muted-foreground/25"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={!canUpload}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
          ) : (
            <Upload className="h-10 w-10 text-muted-foreground" />
          )}

          <div className="text-sm">
            <span className="font-medium text-foreground">Click to upload</span>
            <span className="text-muted-foreground"> or drag and drop</span>
          </div>

          <p className="text-xs text-muted-foreground">
            {accept.includes("image") ? "PNG, JPG, GIF, WebP" : "Files"} up to{" "}
            {maxSizeMB}MB
            {maxFiles > 1 && ` (${remainingSlots} of ${maxFiles} remaining)`}
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error.message}</span>
        </div>
      )}

      {/* Uploaded files preview */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {uploadedFiles.map((file) => (
            <div
              key={file.signed_id}
              className="relative group rounded-lg overflow-hidden border bg-muted"
            >
              {file.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.url}
                  alt={file.file.name}
                  className="w-full h-24 object-cover"
                />
              ) : (
                <div className="w-full h-24 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              {/* Progress overlay */}
              {uploadProgress[file.file.name] !== undefined &&
                uploadProgress[file.file.name] < 100 &&
                uploadProgress[file.file.name] >= 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-sm font-medium">
                      {uploadProgress[file.file.name]}%
                    </div>
                  </div>
                )}

              {/* Error overlay */}
              {uploadProgress[file.file.name] === -1 && (
                <div className="absolute inset-0 bg-destructive/50 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              )}

              {/* Remove button */}
              {onRemoveFile && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(file.signed_id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}

              {/* File name */}
              <div className="p-1 text-xs truncate text-center bg-background/80">
                {file.file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
