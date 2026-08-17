export interface VariantInput {
    size: string;
    color?: string;
    stock: number;
    sku?: string;
}
export interface CreateProductInput {
    title: string;
    slug: string;
    description: string;
    price: number;
    discountPrice: number;
    categoryId: number;
    variants?: VariantInput[];
}
export interface UpdateProductInput {
    title?: string;
    slug?: string;
    description?: string;
    price?: number;
    discountPrice?: number;
    categoryId?: number;
    variants?: VariantInput[];
}
export interface CreateProductImageInput {
    productId: number;
    imageUrl: string;
    publicId?: string | null;
}
export interface ProductQueryOptions {
    page?: number | undefined;
    limit?: number | undefined;
    category?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    search?: string | undefined;
    sortBy?: string | undefined;
}
export declare function getPaginatedProducts(options?: ProductQueryOptions): Promise<{
    products: {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        _count: {
            variants: number;
            images: number;
            reviews: number;
        };
        category: {
            name: string;
            id: number;
            slug: string;
        };
        slug: string;
        description: string;
        price: import("@prisma/client/runtime/client").Decimal;
        discountPrice: import("@prisma/client/runtime/client").Decimal;
        categoryId: number;
        variants: {
            id: number;
            sku: string;
            size: string;
            color: string;
            stock: number;
        }[];
        images: {
            id: number;
            imageUrl: string;
            publicId: string | null;
        }[];
    }[];
    totalProducts: number;
    totalPages: number;
    currentPage: number;
    limit: number;
}>;
export declare function getAllProducts(limit?: number, offset?: number): Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    _count: {
        variants: number;
        images: number;
        reviews: number;
    };
    category: {
        name: string;
        id: number;
        slug: string;
    };
    slug: string;
    description: string;
    price: import("@prisma/client/runtime/client").Decimal;
    discountPrice: import("@prisma/client/runtime/client").Decimal;
    categoryId: number;
    variants: {
        id: number;
        sku: string;
        size: string;
        color: string;
        stock: number;
    }[];
    images: {
        id: number;
        imageUrl: string;
        publicId: string | null;
    }[];
}[]>;
export declare function getHomepageCategoryProducts(): Promise<{
    products: {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        _count: {
            reviews: number;
        };
        category: {
            name: string;
            id: number;
            slug: string;
        };
        slug: string;
        description: string;
        price: import("@prisma/client/runtime/client").Decimal;
        discountPrice: import("@prisma/client/runtime/client").Decimal;
        categoryId: number;
        variants: {
            id: number;
            size: string;
            color: string;
            stock: number;
        }[];
        images: {
            id: number;
            imageUrl: string;
            publicId: string | null;
        }[];
    }[];
    name: string;
    id: number;
    slug: string;
}[]>;
export declare function searchProducts(q: string, limit?: number, offset?: number): Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    _count: {
        variants: number;
        images: number;
        reviews: number;
    };
    category: {
        name: string;
        id: number;
        slug: string;
    };
    slug: string;
    description: string;
    price: import("@prisma/client/runtime/client").Decimal;
    discountPrice: import("@prisma/client/runtime/client").Decimal;
    categoryId: number;
    variants: {
        id: number;
        size: string;
        color: string;
        stock: number;
    }[];
    images: {
        id: number;
        imageUrl: string;
    }[];
}[]>;
export declare function getProductById(id: number): Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    _count: {
        reviews: number;
    };
    category: {
        name: string;
        id: number;
        slug: string;
    };
    slug: string;
    description: string;
    price: import("@prisma/client/runtime/client").Decimal;
    discountPrice: import("@prisma/client/runtime/client").Decimal;
    categoryId: number;
    variants: {
        id: number;
        sku: string;
        size: string;
        color: string;
        stock: number;
    }[];
    images: {
        id: number;
        imageUrl: string;
        publicId: string | null;
    }[];
    reviews: {
        user: {
            name: string;
            id: number;
        };
        id: number;
        createdAt: Date;
        rating: number;
        comment: string;
    }[];
} | null>;
export declare function getProductBySlug(slug: string): Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    _count: {
        reviews: number;
    };
    category: {
        name: string;
        id: number;
        slug: string;
    };
    slug: string;
    description: string;
    price: import("@prisma/client/runtime/client").Decimal;
    discountPrice: import("@prisma/client/runtime/client").Decimal;
    categoryId: number;
    variants: {
        id: number;
        sku: string;
        size: string;
        color: string;
        stock: number;
    }[];
    images: {
        id: number;
        imageUrl: string;
        publicId: string | null;
    }[];
    reviews: {
        user: {
            name: string;
            id: number;
        };
        id: number;
        createdAt: Date;
        rating: number;
        comment: string;
    }[];
} | null>;
export declare function createProduct(input: CreateProductInput): Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    slug: string;
    description: string;
    price: import("@prisma/client/runtime/client").Decimal;
    discountPrice: import("@prisma/client/runtime/client").Decimal;
    categoryId: number;
}>;
export declare function updateProduct(id: number, input: UpdateProductInput): Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    slug: string;
    description: string;
    price: import("@prisma/client/runtime/client").Decimal;
    discountPrice: import("@prisma/client/runtime/client").Decimal;
    categoryId: number;
}>;
export declare function syncProductVariants(productId: number, variants: VariantInput[]): Promise<void>;
export declare function deleteProduct(id: number): Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    slug: string;
    description: string;
    price: import("@prisma/client/runtime/client").Decimal;
    discountPrice: import("@prisma/client/runtime/client").Decimal;
    categoryId: number;
}>;
export declare function getProductImages(productId: number): Promise<{
    id: number;
    productId: number;
    imageUrl: string;
    publicId: string | null;
}[]>;
export declare function addProductImage(input: CreateProductImageInput): Promise<{
    id: number;
    productId: number;
    imageUrl: string;
    publicId: string | null;
}>;
export declare function removeProductImage(id: number): Promise<{
    id: number;
    productId: number;
    imageUrl: string;
    publicId: string | null;
}>;
//# sourceMappingURL=product.service.d.ts.map