export interface CreateCategoryInput {
    name: string;
    slug: string;
}
export interface UpdateCategoryInput {
    name?: string;
    slug?: string;
}
export declare function getAllCategories(): Promise<{
    name: string;
    id: number;
    _count: {
        products: number;
    };
    slug: string;
}[]>;
export declare function getCategoryById(id: number): Promise<{
    name: string;
    id: number;
    _count: {
        products: number;
    };
    slug: string;
    products: {
        id: number;
        createdAt: Date;
        title: string;
        slug: string;
        price: import("@prisma/client/runtime/client").Decimal;
        discountPrice: import("@prisma/client/runtime/client").Decimal;
    }[];
} | null>;
export declare function getCategoryBySlug(slug: string): Promise<{
    name: string;
    id: number;
    _count: {
        products: number;
    };
    slug: string;
    products: {
        id: number;
        createdAt: Date;
        title: string;
        slug: string;
        price: import("@prisma/client/runtime/client").Decimal;
        discountPrice: import("@prisma/client/runtime/client").Decimal;
    }[];
} | null>;
export declare function createCategory(input: CreateCategoryInput): Promise<{
    name: string;
    id: number;
    _count: {
        products: number;
    };
    slug: string;
}>;
export declare function updateCategory(id: number, input: UpdateCategoryInput): Promise<{
    name: string;
    id: number;
    _count: {
        products: number;
    };
    slug: string;
}>;
export declare function deleteCategory(id: number): Promise<{
    name: string;
    id: number;
    _count: {
        products: number;
    };
    slug: string;
}>;
//# sourceMappingURL=category.service.d.ts.map