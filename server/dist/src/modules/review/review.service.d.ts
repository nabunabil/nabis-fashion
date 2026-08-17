export declare function getReviewsByProductId(productId: number, page?: number, limit?: number, includeHidden?: boolean): Promise<{
    reviews: {
        user: {
            name: string;
            id: number;
        };
        id: number;
        createdAt: Date;
        rating: number;
        comment: string;
        product: {
            id: number;
            title: string;
            slug: string;
        };
    }[];
    total: number;
    page: number;
    limit: number;
}>;
export declare function getAllReviews(page?: number, limit?: number, productId?: number, userId?: number): Promise<{
    reviews: {
        user: {
            name: string;
            id: number;
        };
        id: number;
        createdAt: Date;
        rating: number;
        comment: string;
        product: {
            id: number;
            title: string;
            slug: string;
        };
    }[];
    total: number;
    page: number;
    limit: number;
}>;
export declare function upsertMyReviewByEmail(email: string, productId: number, rating: number, comment: string): Promise<{
    user: {
        name: string;
        id: number;
    };
    id: number;
    createdAt: Date;
    rating: number;
    comment: string;
    product: {
        id: number;
        title: string;
        slug: string;
    };
} | null>;
export declare function deleteMyReviewByEmail(email: string, productId: number): Promise<{
    user: {
        name: string;
        id: number;
    };
    id: number;
    createdAt: Date;
    rating: number;
    comment: string;
    product: {
        id: number;
        title: string;
        slug: string;
    };
} | null>;
export declare function deleteReviewById(id: number): Promise<{
    user: {
        name: string;
        id: number;
    };
    id: number;
    createdAt: Date;
    rating: number;
    comment: string;
    product: {
        id: number;
        title: string;
        slug: string;
    };
}>;
export declare function setReviewHiddenById(id: number, hidden: boolean): Promise<{
    user: {
        name: string;
        id: number;
    };
    id: number;
    createdAt: Date;
    rating: number;
    comment: string;
    product: {
        id: number;
        title: string;
        slug: string;
    };
}>;
//# sourceMappingURL=review.service.d.ts.map