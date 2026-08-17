import { v2 as cloudinary } from "cloudinary";
import type { UploadApiOptions } from "cloudinary";
import streamifier from "streamifier";
import { env } from "../lib/env";

const cloudName = env.cloudinaryCloudName;
const apiKey = env.cloudinaryApiKey;
const apiSecret = env.cloudinaryApiSecret;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

type UploadBufferOptions = {
  folder?: string;
  filename?: string;
  resourceType?: "image" | "raw" | "auto";
  optimizeImage?: boolean;
};

type UploadedCloudinaryFile = {
  secureUrl: string;
  publicId: string;
};

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  options: UploadBufferOptions = {},
): Promise<UploadedCloudinaryFile> => {
  if (!cloudName || !apiKey || !apiSecret) {
    const base64 = buffer.toString("base64");
    const dataUrl = `data:image/webp;base64,${base64}`;
    return {
      secureUrl: dataUrl,
      publicId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadOptions: UploadApiOptions = {
      resource_type: options.resourceType ?? "image",
      use_filename: Boolean(options.filename),
      unique_filename: true,
      format: "webp",
      ...(options.folder ? { folder: options.folder } : {}),
      ...(options.filename ? { filename_override: options.filename } : {}),
      ...(options.optimizeImage
        ? {
            transformation: [
              {
                format: "webp",
                quality: "auto",
              },
            ],
          }
        : {}),
    };
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error || !result?.secure_url || !result.public_id) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

function extractPublicId(filePath: string): string | null {
  if (!filePath) {
    return null;
  }

  const withoutQuery = filePath.split("?")[0] ?? filePath;
  const uploadMarker = "/upload/";
  const markerIndex = withoutQuery.indexOf(uploadMarker);

  if (markerIndex < 0) {
    return null;
  }

  const afterUpload = withoutQuery.slice(markerIndex + uploadMarker.length);
  const segments = afterUpload.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const versionPattern = /^v\d+$/;
  const firstSegment = segments[0];
  if (firstSegment && versionPattern.test(firstSegment)) {
    segments.shift();
  }

  if (segments.length === 0) {
    return null;
  }

  const joined = segments.join("/");
  return joined.replace(/\.[^/.]+$/, "");
}

export const deleteFileFromCloudinary = async (
  filePath: string,
): Promise<void> => {
  const publicId = extractPublicId(filePath);

  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    if (env.nodeEnv === "development") {
      console.warn("Cloudinary cleanup failed", error);
    }
  }
};
