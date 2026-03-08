/**
 * Client-side Cloudinary signed upload.
 * 1. Call Rails POST /api/v1/uploads/cloudinary-sign (or /api/v1/cloudinary/signature) for signature.
 * 2. POST file directly to Cloudinary.
 * 3. Return secure_url and public_id.
 */

const CLOUD_NAME = "dqssnduni";
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Always use full backend URL to ensure requests go to API
 */
function getApiBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "http://localhost:3000/api/v1";
  const trimmed = base.replace(/\/+$/, "");
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
}

export interface CloudinarySignResponse {
  signature: string;
  api_key: string;
  timestamp: number;
  folder: string;
  public_id?: string;
  cloud_name?: string;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  bytes?: number;
}

/**
 * Get signed upload params from Rails (use uploads/cloudinary-sign or cloudinary/signature).
 */
export async function getCloudinarySignParams(
  folder: string,
  options: { publicId?: string; resourceType?: string } = {},
  accessToken?: string
): Promise<CloudinarySignResponse> {
  const baseUrl = getApiBaseUrl();
  const body: Record<string, string> = { folder };
  if (options.publicId) body.public_id = options.publicId;
  if (options.resourceType) body.resource_type = options.resourceType;

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${baseUrl}/uploads/cloudinary-sign`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to get Cloudinary signature");
  }

  return res.json();
}

/**
 * Upload a file directly to Cloudinary using signed params from Rails.
 */
export async function uploadToCloudinary(
  file: File,
  folder: string,
  options: { publicId?: string; accessToken?: string } = {}
): Promise<CloudinaryUploadResult> {
  const sign = await getCloudinarySignParams(folder, { publicId: options.publicId }, options.accessToken);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sign.api_key);
  formData.append("timestamp", String(sign.timestamp));
  formData.append("signature", sign.signature);
  formData.append("folder", sign.folder);
  if (sign.public_id) formData.append("public_id", sign.public_id);

  const res = await fetch(UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || err.error || "Cloudinary upload failed");
  }

  const data = await res.json();
  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
  };
}
