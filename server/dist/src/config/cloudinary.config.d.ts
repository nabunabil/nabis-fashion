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
export declare const uploadBufferToCloudinary: (buffer: Buffer, options?: UploadBufferOptions) => Promise<UploadedCloudinaryFile>;
export declare const deleteFileFromCloudinary: (filePath: string) => Promise<void>;
export {};
//# sourceMappingURL=cloudinary.config.d.ts.map