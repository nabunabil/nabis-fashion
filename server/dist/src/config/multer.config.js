"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productImageUpload = exports.profileImageUpload = exports.checkinDocumentUpload = exports.mixedUpload = exports.documentUpload = exports.imageUpload = void 0;
exports.toSafeBaseFileName = toSafeBaseFileName;
exports.buildUniqueFileName = buildUniqueFileName;
const multer_1 = __importDefault(require("multer"));
const appError_1 = require("../shared/errors/appError");
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
function createUpload(preset) {
    return (0, multer_1.default)({
        storage: multer_1.default.memoryStorage(),
        limits: {
            files: preset.maxFiles,
            fileSize: preset.maxFileSizeMb * MB,
        },
        fileFilter: (_req, file, cb) => {
            if (!preset.allowedMimeTypes.has(file.mimetype)) {
                cb(new appError_1.AppError(400, `Invalid file type. Allowed ${preset.label} types only`, "INVALID_FILE_TYPE"));
                return;
            }
            cb(null, true);
        },
    });
}
function toSafeBaseFileName(originalName) {
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
function buildUniqueFileName(originalName) {
    const baseName = toSafeBaseFileName(originalName);
    const nonce = Math.random().toString(36).slice(2, 8);
    return `${nonce}-${Date.now()}-${baseName}`;
}
exports.imageUpload = createUpload({
    maxFiles: 10,
    maxFileSizeMb: 10,
    allowedMimeTypes: IMAGE_MIME_TYPES,
    label: "image",
});
exports.documentUpload = createUpload({
    maxFiles: 5,
    maxFileSizeMb: 10,
    allowedMimeTypes: DOCUMENT_MIME_TYPES,
    label: "document",
});
exports.mixedUpload = createUpload({
    maxFiles: 10,
    maxFileSizeMb: 10,
    allowedMimeTypes: new Set([...IMAGE_MIME_TYPES, ...DOCUMENT_MIME_TYPES]),
    label: "image/document",
});
exports.checkinDocumentUpload = createUpload({
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
exports.profileImageUpload = createUpload({
    maxFiles: 1,
    maxFileSizeMb: 5,
    allowedMimeTypes: PROFILE_IMAGE_MIME_TYPES,
    label: "image (JPEG, PNG, or WebP)",
});
// Accept both single 'image' and multiple 'images' or array
exports.productImageUpload = exports.imageUpload.any();
//# sourceMappingURL=multer.config.js.map