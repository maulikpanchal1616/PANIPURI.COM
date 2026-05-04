// Global type extensions for NextAuth
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
  }
}

// App types
export interface CartItem {
  dishId: string;
  name: string;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  quantity: number;
  vendorId: string;
  vendorName: string;
  isVeg: boolean;
  notes?: string;
}

export interface DishWithVendor {
  id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  isSpicy: boolean;
  isFeatured: boolean;
  rating: number;
  totalOrders: number;
  prepTime: number;
  tags: string[];
  vendor: {
    id: string;
    businessName: string;
    logoUrl?: string;
    rating: number;
    address: string;
  };
}

export interface VendorWithDishes {
  id: string;
  businessName: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  totalOrders: number;
  isApproved: boolean;
  isActive: boolean;
  dishes: DishWithVendor[];
  subVendors: SubVendorType[];
}

export interface SubVendorType {
  id: string;
  stallName: string;
  stallType: string;
  description?: string;
  imageUrl?: string;
  address: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  openTime: string;
  closeTime: string;
  dishes?: DishWithVendor[];
}

export interface OrderWithDetails {
  id: string;
  status: string;
  totalAmount: number;
  deliveryFee: number;
  deliveryAddress: string;
  createdAt: string;
  estimatedTime: number;
  vendor: {
    businessName: string;
    logoUrl?: string;
    latitude: number;
    longitude: number;
  };
  items: {
    id: string;
    quantity: number;
    price: number;
    dish: {
      name: string;
      imageUrl?: string;
    };
  }[];
  payment?: {
    status: string;
    method?: string;
  };
  deliveryLog: {
    status: string;
    latitude?: number;
    longitude?: number;
    message?: string;
    timestamp: string;
  }[];
}
