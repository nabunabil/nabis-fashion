type UpdateMyProfileInput = {
    name?: string;
    phone?: string;
    image?: string | null;
};
export declare function getUserProfileByEmail(email: string): Promise<{
    name: string;
    id: number;
    email: string;
    phone: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    image: string | null;
    status: string | null;
} | null>;
export interface UserQueryOptions {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    role?: string | undefined;
}
export declare function getPaginatedUsers(options?: UserQueryOptions): Promise<{
    users: {
        name: string;
        id: number;
        email: string;
        phone: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
        image: string | null;
        status: string | null;
    }[];
    totalUsers: number;
    totalPages: number;
    currentPage: number;
    limit: number;
}>;
export declare function getAllUsers(limit?: number, offset?: number): Promise<{
    name: string;
    id: number;
    email: string;
    phone: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    image: string | null;
    status: string | null;
}[]>;
export declare function getUserById(id: number): Promise<{
    name: string;
    id: number;
    email: string;
    phone: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    image: string | null;
    status: string | null;
} | null>;
export declare function getUserCount(): Promise<number>;
export declare function deleteUserById(id: number): Promise<{
    name: string;
    id: number;
    email: string;
    phone: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    image: string | null;
    status: string | null;
}>;
export declare function updateUserRoleById(id: number, role: string): Promise<{
    name: string;
    id: number;
    email: string;
    phone: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    image: string | null;
    status: string | null;
}>;
export declare function updateUserProfileByEmail(email: string, input: UpdateMyProfileInput): Promise<{
    name: string;
    id: number;
    email: string;
    phone: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    image: string | null;
    status: string | null;
}>;
export {};
//# sourceMappingURL=user.service.d.ts.map