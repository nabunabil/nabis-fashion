import multer from "multer";
import { AppError } from "../shared/errors/appError";

const MB = 1024 * 1024;

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
  "image/bmp",
  "image/svg+xml",
]);

const DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const CHECKIN_DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type UploadPreset = {
  maxFiles: number;
  maxFileSizeMb: number;
  allowedMimeTypes: Set<string>;
  label: string;
};

function createUpload(preset: UploadPreset) {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      files: preset.maxFiles,
      fileSize: preset.maxFileSizeMb * MB,
    },
    fileFilter: (_req, file, cb) => {
      if (!preset.allowedMimeTypes.has(file.mimetype)) {
        cb(
          new AppError(
            400,
            `Invalid file type. Allowed ${preset.label} types only`,
            "INVALID_FILE_TYPE",
          ),
        );
        return;
      }

      cb(null, true);
    },
  });
}

export function toSafeBaseFileName(originalName: string): string {
  const withoutExtension = originalName
    .split(".")
    .slice(0, -1)
    .join(".")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return withoutExtension || "file";
}

export function buildUniqueFileName(originalName: string): string {
  const baseName = toSafeBaseFileName(originalName);
  const nonce = Math.random().toString(36).slice(2, 8);

  return `${nonce}-${Date.now()}-${baseName}`;
}

export const imageUpload = createUpload({
  maxFiles: 10,
  maxFileSizeMb: 10,
  allowedMimeTypes: IMAGE_MIME_TYPES,
  label: "image",
});

export const documentUpload = createUpload({
  maxFiles: 5,
  maxFileSizeMb: 10,
  allowedMimeTypes: DOCUMENT_MIME_TYPES,
  label: "document",
});

export const mixedUpload = createUpload({
  maxFiles: 10,
  maxFileSizeMb: 10,
  allowedMimeTypes: new Set([...IMAGE_MIME_TYPES, ...DOCUMENT_MIME_TYPES]),
  label: "image/document",
});

export const checkinDocumentUpload = createUpload({
  maxFiles: 2,
  maxFileSizeMb: 5,
  allowedMimeTypes: CHECKIN_DOCUMENT_MIME_TYPES,
  label: "PDF or image",
});

const PROFILE_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const profileImageUpload = createUpload({
  maxFiles: 1,
  maxFileSizeMb: 5,
  allowedMimeTypes: PROFILE_IMAGE_MIME_TYPES,
  label: "image (JPEG, PNG, or WebP)",
});

import type { RequestHandler } from "express";

// Accept both single 'image' and multiple 'images' or array
export const productImageUpload: RequestHandler = imageUpload.any();
