export type AddressPayload = {
    label?: string;
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
    isDefault?: boolean;
};
export declare function listUserAddresses(email: string): Promise<{
    name: string;
    id: number;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    city: string;
    country: string;
    label: string;
    street: string;
    state: string;
    zip: string;
    isDefault: boolean;
}[]>;
export declare function createUserAddress(email: string, data: AddressPayload): Promise<{
    name: string;
    id: number;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    city: string;
    country: string;
    label: string;
    street: string;
    state: string;
    zip: string;
    isDefault: boolean;
}>;
export declare function updateUserAddress(email: string, id: number, data: AddressPayload): Promise<{
    name: string;
    id: number;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    city: string;
    country: string;
    label: string;
    street: string;
    state: string;
    zip: string;
    isDefault: boolean;
}>;
export declare function setDefaultUserAddress(email: string, id: number): Promise<{
    name: string;
    id: number;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    city: string;
    country: string;
    label: string;
    street: string;
    state: string;
    zip: string;
    isDefault: boolean;
}>;
export declare function deleteUserAddress(email: string, id: number): Promise<{
    success: boolean;
}>;
//# sourceMappingURL=address.service.d.ts.map