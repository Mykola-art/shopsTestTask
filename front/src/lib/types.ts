export interface AuthFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    email: string;
    password: string;
    confirmPassword: string;
}

export interface UserPayload {
    userId: number;
    email: string;
    role: string;
    isHaveStores: boolean;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    userPayload: UserPayload
}


export interface ApiError {
    statusCode: number;
    message: string;
    error?: string;
}

export interface OperatingHours {
    [day: string]: {
        from: string;
        to: string;
    };
}

export interface StoreAdmin {
    id: number;
    email: string;
    password: string;
    role: string;
    refreshToken: string | null;
    stores: string[];
}

export interface ProductModifierOption {
    name: string;
    priceDelta: number;
}

export interface ProductModifier {
    name: string;
    options: ProductModifierOption[];
}

export interface Product {
    id: number;
    store: string;
    storeId: number;
    name: string;
    price: number;
    description: string;
    availability: OperatingHours;
    modifiers: ProductModifier[];
    cacheTTL: number;
    createdAt: string;
    updatedAt: string;
}

export interface Store {
    id: number;
    slug: string;
    name: string;
    address: string;
    timezone: string;
    lat: number;
    lng: number;
    operatingHours: OperatingHours;
    admin: StoreAdmin;
    products: Product[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateStoreData {
    slug: string;
    name: string;
    address: string;
    timezone: string;
    lat?: number;
    lng?: number;
    operatingHours: OperatingHours;
}

export interface UpdateStoreData {
    slug?: string;
    name?: string;
    address?: string;
    timezone?: string;
    lat?: number;
    lng?: number;
    operatingHours?: OperatingHours;
}

export interface StoresResponse {
    meta: {
        page: number;
        pageSize: number;
        totalPages: number;
        total: number;
    };
    items: Store[];
}

export interface StoresFilter {
    page?: number;
    limit?: number;
    timezone?: string;
    name?: string;
    address?: string;
    day?: string;
    from?: string;
    to?: string;
}