export declare function getMyCart(email: string): Promise<{
    cart: {
        id: number;
        createdAt: Date;
        userId: number;
        items: {
            id: number;
            productVariant: {
                id: number;
                product: {
                    id: number;
                    title: string;
                    category: {
                        name: string;
                        id: number;
                        slug: string;
                    };
                    slug: string;
                    price: import("@prisma/client/runtime/client").Decimal;
                    discountPrice: import("@prisma/client/runtime/client").Decimal;
                    images: {
                        id: number;
                        imageUrl: string;
                    }[];
                };
                size: string;
                color: string;
                stock: number;
            };
            productVariantId: number;
            quantity: number;
        }[];
    } | null;
    summary: {
        totalItems: number;
        totalQuantity: number;
        subtotal: number;
    };
} | null>;
export declare function addItemToMyCart(email: string, productVariantId: number, quantity: number): Promise<{
    cart: {
        id: number;
        createdAt: Date;
        userId: number;
        items: {
            id: number;
            productVariant: {
                id: number;
                product: {
                    id: number;
                    title: string;
                    category: {
                        name: string;
                        id: number;
                        slug: string;
                    };
                    slug: string;
                    price: import("@prisma/client/runtime/client").Decimal;
                    discountPrice: import("@prisma/client/runtime/client").Decimal;
                    images: {
                        id: number;
                        imageUrl: string;
                    }[];
                };
                size: string;
                color: string;
                stock: number;
            };
            productVariantId: number;
            quantity: number;
        }[];
    } | null;
    summary: {
        totalItems: number;
        totalQuantity: number;
        subtotal: number;
    };
} | null>;
export declare function updateMyCartItemQuantity(email: string, productVariantId: number, quantity: number): Promise<{
    cart: {
        id: number;
        createdAt: Date;
        userId: number;
        items: {
            id: number;
            productVariant: {
                id: number;
                product: {
                    id: number;
                    title: string;
                    category: {
                        name: string;
                        id: number;
                        slug: string;
                    };
                    slug: string;
                    price: import("@prisma/client/runtime/client").Decimal;
                    discountPrice: import("@prisma/client/runtime/client").Decimal;
                    images: {
                        id: number;
                        imageUrl: string;
                    }[];
                };
                size: string;
                color: string;
                stock: number;
            };
            productVariantId: number;
            quantity: number;
        }[];
    } | null;
    summary: {
        totalItems: number;
        totalQuantity: number;
        subtotal: number;
    };
} | null>;
export declare function removeMyCartItem(email: string, productVariantId: number): Promise<{
    cart: {
        id: number;
        createdAt: Date;
        userId: number;
        items: {
            id: number;
            productVariant: {
                id: number;
                product: {
                    id: number;
                    title: string;
                    category: {
                        name: string;
                        id: number;
                        slug: string;
                    };
                    slug: string;
                    price: import("@prisma/client/runtime/client").Decimal;
                    discountPrice: import("@prisma/client/runtime/client").Decimal;
                    images: {
                        id: number;
                        imageUrl: string;
                    }[];
                };
                size: string;
                color: string;
                stock: number;
            };
            productVariantId: number;
            quantity: number;
        }[];
    } | null;
    summary: {
        totalItems: number;
        totalQuantity: number;
        subtotal: number;
    };
} | null>;
export declare function clearMyCart(email: string): Promise<{
    cart: {
        id: number;
        createdAt: Date;
        userId: number;
        items: {
            id: number;
            productVariant: {
                id: number;
                product: {
                    id: number;
                    title: string;
                    category: {
                        name: string;
                        id: number;
                        slug: string;
                    };
                    slug: string;
                    price: import("@prisma/client/runtime/client").Decimal;
                    discountPrice: import("@prisma/client/runtime/client").Decimal;
                    images: {
                        id: number;
                        imageUrl: string;
                    }[];
                };
                size: string;
                color: string;
                stock: number;
            };
            productVariantId: number;
            quantity: number;
        }[];
    } | null;
    summary: {
        totalItems: number;
        totalQuantity: number;
        subtotal: number;
    };
} | null>;
//# sourceMappingURL=cart.service.d.ts.map