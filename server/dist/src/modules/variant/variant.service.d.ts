export type VariantInput = {
    productId: number;
    sku: string;
    size: string;
    color: string;
    stock: number;
};
export declare function listVariants(productId?: number): import("@prisma/client").Prisma.PrismaPromise<({
    product: {
        id: number;
        title: string;
        slug: string;
    };
} & {
    id: number;
    productId: number;
    sku: string;
    size: string;
    color: string;
    stock: number;
})[]>;
export declare function getVariant(id: number): import("@prisma/client").Prisma.Prisma__ProductVariantClient<({
    product: {
        id: number;
        title: string;
        slug: string;
    };
} & {
    id: number;
    productId: number;
    sku: string;
    size: string;
    color: string;
    stock: number;
}) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
export declare function createVariant(input: VariantInput): Promise<{
    product: {
        id: number;
        title: string;
        slug: string;
    };
} & {
    id: number;
    productId: number;
    sku: string;
    size: string;
    color: string;
    stock: number;
}>;
export declare function updateVariant(id: number, input: Partial<VariantInput>): Promise<{
    product: {
        id: number;
        title: string;
        slug: string;
    };
} & {
    id: number;
    productId: number;
    sku: string;
    size: string;
    color: string;
    stock: number;
}>;
export declare function deleteVariant(id: number): Promise<{
    id: number;
    productId: number;
    sku: string;
    size: string;
    color: string;
    stock: number;
}>;
//# sourceMappingURL=variant.service.d.ts.map