import multer from "multer";
export declare function toSafeBaseFileName(originalName: string): string;
export declare function buildUniqueFileName(originalName: string): string;
export declare const imageUpload: multer.Multer;
export declare const documentUpload: multer.Multer;
export declare const mixedUpload: multer.Multer;
export declare const checkinDocumentUpload: multer.Multer;
export declare const profileImageUpload: multer.Multer;
import type { RequestHandler } from "express";
export declare const productImageUpload: RequestHandler;
//# sourceMappingURL=multer.config.d.ts.map