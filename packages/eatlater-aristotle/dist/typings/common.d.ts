import { OrderStatus } from './OrderStatus.enum';
export interface TokenPayload {
    userId: string;
}
export interface ReviewToken {
    listingId: string;
}
export interface ListingOption {
    name: string;
    price: string;
}
export interface PaymentInfo {
    bankName: string;
    bankAccountInfo: string;
    bankAccountNumber: string;
}
export interface VendorOperationSetting {
    startTime?: string;
    cutoffTime?: string;
    placementTime?: string;
    minOrder?: number;
}
export interface LocationCoordinates {
    coordinates: [string, string];
}
export interface ListingCategoryI {
    vendorId: string;
    name: string;
    tags: string[];
    isLive: boolean;
    listingsMenu: ListingMenuI[];
    createdAt: string;
    updatedAt: string;
}
export interface ListingOptionGroupI {
    vendorId: string;
    name: string;
    min: number;
    max: number;
    options: ListingOption[];
}
export interface ListingMenuI {
    vendorId: string;
    name: string;
    desc: string;
    price: string;
    serving: string;
    photo: string;
    isLive: boolean;
    isAvailable: boolean;
    isDeleted: boolean;
    optionGroups: ListingOption[];
    createdAt: string;
    updatedAt: string;
}
export interface OrderBreakDown {
    orderCost: number;
    systemFee: number;
    deliveryFee: number;
    vat: number;
}
export interface VendorI {
    firstName: string;
    lastName: string;
    email: string;
    businessEmail: string;
    password: string;
    phone: string;
    isValidated: boolean;
    status: 'ONLINE' | 'OFFLINE';
    businessName: string;
    businessLogo: string;
    businessAddress: string;
    settings: VendorSettingsI;
    location: {
        coordinates: [string, string];
    };
    createdAt: string;
    updatedAt: string;
}
export interface VendorSettingsI {
    vendorId: string;
    operations?: VendorOperationSetting;
    payment?: PaymentInfo;
}
export interface VendorUserI {
    isValidated: boolean;
    status: 'ONLINE' | 'OFFLINE';
    businessName: string;
    businessLogo: string;
    businessAddress: string;
    location: {
        coordinates: [string, string];
    };
}
export interface UserI {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    isValidated: boolean;
    createdAt: string;
    updatedAt: string;
    status: 'ONLINE' | 'OFFLINE';
    location: LocationCoordinates;
}
export interface ReviewI {
    reviewBody: string;
    listingId: ListingMenuI;
    vendorId: VendorI;
    reviewStars: number;
    orderId: OrderI;
    reviewerName: string;
    createdAt: string;
    updatedAt: string;
}
export interface OrderI {
    userId: UserI;
    listingsId: ListingMenuI;
    vendorId: VendorI;
    totalOrderValue: number;
    orderValuePayable: number;
    deliveryAddess: string;
    primaryContact: string;
    isThirdParty: boolean;
    createdAt: string;
    updatedAt: string;
    refId: number;
    options: string[];
    orderStatus: OrderStatus;
    orderBreakDown: OrderBreakDown;
}
