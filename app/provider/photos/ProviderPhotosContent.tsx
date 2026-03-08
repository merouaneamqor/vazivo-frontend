"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, X, Image as ImageIcon, Loader2, ImagePlus } from "lucide-react";
import { useProviderBusiness } from "@/context/ProviderBusinessContext";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import toast from "react-hot-toast";

const PROVIDER_BUSINESSES_KEY = ["provider", "businesses"] as const;

interface GalleryImage {
  url: string;
  public_id: string;
}

export default function ProviderPhotosContent() {
  const queryClient = useQueryClient();
  const { selectedBusiness, isLoading: businessLoading } = useProviderBusiness();

  const imageUrls = useMemo(
    () => (selectedBusiness?.image_urls && Array.isArray(selectedBusiness.image_urls) ? selectedBusiness.image_urls : []) as string[],
    [selectedBusiness?.image_urls]
  );
  const logoUrl = selectedBusiness?.logo_url ?? null;

  const [photos, setPhotos] = useState<string[]>([]);
  const [photoMap, setPhotoMap] = useState<Map<string, string>>(new Map());
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadProgressCover, setUploadProgressCover] = useState<number | null>(null);
  const [uploadProgressGallery, setUploadProgressGallery] = useState<number | null>(null);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const extractPublicIdFromUrl = (url: string): string => {
    try {
      // Extract public_id from Cloudinary URL
      // Format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{public_id}.{ext}
      const match = url.match(/\/upload\/v\d+\/(.+?)(\.[^.]+)?$/);
      if (match && match[1]) {
        return match[1];
      }
      return "";
    } catch {
      return "";
    }
  };

  useEffect(() => {
    setPhotos(imageUrls);
    // Build photoMap from URLs by extracting public_id
    const newMap = new Map<string, string>();
    imageUrls.forEach(url => {
      const publicId = extractPublicIdFromUrl(url);
      if (publicId) {
        newMap.set(url, publicId);
      }
    });
    setPhotoMap(newMap);
  }, [imageUrls]);

  useEffect(() => {
    setCoverUrl(logoUrl);
  }, [logoUrl]);

  const refetchBusinesses = async () => {
    await queryClient.invalidateQueries({ queryKey: PROVIDER_BUSINESSES_KEY });
    return queryClient.refetchQueries({ queryKey: PROVIDER_BUSINESSES_KEY });
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBusiness) return;

    setUploadingCover(true);
    setUploadProgressCover(0);
    setError(null);
    try {
      const { business } = await api.updateBusinessWithFiles(
        selectedBusiness.id,
        {},
        { logo: file },
        {
          onProgress: (p) => setUploadProgressCover(p),
        }
      );
      setCoverUrl(business.logo_url ?? null);
      await refetchBusinesses();
      toast.success("Cover photo updated");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update cover photo";
      setError(msg);
      toast.error(msg);
    } finally {
      setUploadingCover(false);
      setUploadProgressCover(null);
      e.target.value = "";
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length || !selectedBusiness) return;

    setUploading(true);
    setUploadProgressGallery(0);
    setError(null);
    try {
      const data = await api.addBusinessPhotos(selectedBusiness.id, files, {
        onProgress: (p) => setUploadProgressGallery(p),
      });
      
      if (data.images && Array.isArray(data.images)) {
        // Update local state immediately for instant feedback
        const newPhotos = data.images.map(img => img.url);
        setPhotos(prev => [...prev, ...newPhotos]);
        
        // Update photoMap
        const newMap = new Map(photoMap);
        data.images.forEach(img => {
          newMap.set(img.url, img.public_id);
        });
        setPhotoMap(newMap);
        
        // Refetch to sync with server
        await refetchBusinesses();
        toast.success(`${data.images.length} photo(s) added`);
      }
      
      if (data.errors && data.errors.length > 0) {
        toast.error(data.errors.join(", "));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
      setUploadProgressGallery(null);
      e.target.value = "";
    }
  };

  const handleDeletePhoto = async (photoUrl: string) => {
    if (!selectedBusiness) return;

    // Try to get from map first, then extract from URL
    let publicId = photoMap.get(photoUrl);
    
    if (!publicId) {
      publicId = extractPublicIdFromUrl(photoUrl);
    }
    
    // If still no public_id, try a simpler extraction
    if (!publicId && photoUrl.includes('cloudinary.com')) {
      // Extract everything after /upload/v{version}/
      const parts = photoUrl.split('/upload/');
      if (parts[1]) {
        const afterUpload = parts[1].split('/').slice(1).join('/'); // Skip version
        publicId = afterUpload.replace(/\.[^.]+$/, ''); // Remove extension
      }
    }
    
    if (!publicId) {
      console.error("Failed to extract public_id from:", photoUrl);
      console.error("PhotoMap:", Array.from(photoMap.entries()));
      toast.error("Cannot delete: missing public ID");
      return;
    }

    console.log("Deleting image with public_id:", publicId);

    setDeletingUrl(photoUrl);
    setError(null);
    try {
      await api.removeBusinessPhoto(selectedBusiness.id, publicId);
      
      // Update local state immediately
      setPhotos(prev => prev.filter(p => p !== photoUrl));
      setPhotoMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(photoUrl);
        return newMap;
      });
      
      // Refetch to sync with server
      await refetchBusinesses();
      toast.success("Photo removed");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setDeletingUrl(null);
    }
  };

  if (businessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Photos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Showcase your work and attract more clients with high-quality images
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Cover Photo Section */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Cover photo</h2>
                <p className="mt-1 text-sm text-gray-500">
                  This is the main image clients see on your profile
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Cover Preview */}
              <div className="relative w-full sm:w-64 h-40 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                {coverUrl ? (
                  <>
                    <img
                      src={coverUrl}
                      alt="Cover photo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                      <button
                        onClick={() => coverInputRef.current?.click()}
                        className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium"
                      >
                        Change photo
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <ImagePlus className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No cover photo</p>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1">
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleCoverChange}
                  className="hidden"
                  disabled={uploadingCover}
                />
                
                {uploadProgressCover != null && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Uploading...</span>
                      <span>{uploadProgressCover}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${uploadProgressCover}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingCover ? (
                    <span className="flex items-center">
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Uploading...
                    </span>
                  ) : coverUrl ? (
                    "Replace cover photo"
                  ) : (
                    "Upload cover photo"
                  )}
                </button>
                
                <p className="mt-3 text-xs text-gray-500">
                  Recommended: 1200 x 630 pixels • PNG, JPEG, JPG • Max 5MB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Image gallery</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Showcase your best work to attract clients • {photos.length}/10 images
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {uploadProgressGallery != null && (
                  <div className="w-48">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgressGallery}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all"
                        style={{ width: `${uploadProgressGallery}%` }}
                      />
                    </div>
                  </div>
                )}
                
                <input
                  ref={galleryInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleGalleryUpload}
                  className="hidden"
                  disabled={uploading || photos.length >= 10}
                />
                
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploading || photos.length >= 10}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  title={photos.length >= 10 ? "Maximum 10 images reached" : "Add photos"}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : photos.length >= 10 ? (
                    "Maximum reached"
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Add photos
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {photos.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-1">No photos yet</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Upload high-quality images to showcase your work
                </p>
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploading}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Upload your first photo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div
                    key={`${photo}-${index}`}
                    className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
                  >
                    <img
                      src={photo}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {deletingUrl === photo && (
                      <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-10">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-600 mb-2" />
                        <span className="text-sm text-gray-600">Deleting...</span>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleDeletePhoto(photo)}
                      disabled={deletingUrl === photo}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 disabled:opacity-50 z-20"
                      aria-label="Delete photo"
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Tips Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Photography tips</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Use natural lighting and avoid harsh shadows</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Show your best work and recent results</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Keep images clear, focused, and high-resolution</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Include variety: venue, treatments, and results</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
