import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password too long"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name too long").trim(),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits").optional().or(z.literal("")),
  role: z.enum(["CUSTOMER", "VENDOR"]).default("CUSTOMER"),
});

export const vendorSchema = z.object({
  businessName: z.string().min(2, "Business name required"),
  description: z.string().optional(),
  address: z.string().min(5, "Address required"),
  latitude: z.number(),
  longitude: z.number(),
  bankAccount: z.string().optional(),
  ifscCode: z.string().optional(),
});

export const dishSchema = z.object({
  name: z.string().min(2, "Dish name required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  discountPrice: z.number().positive().optional(),
  category: z.enum([
    "BREAKFAST", "LUNCH", "DINNER", "SNACKS",
    "BEVERAGES", "DESSERTS", "STREET_FOOD", "THALI"
  ]),
  isVeg: z.boolean().default(true),
  isSpicy: z.boolean().default(false),
  prepTime: z.number().int().positive().default(15),
  tags: z.array(z.string()).default([]),
  subVendorId: z.string().optional(),
});

export const orderSchema = z.object({
  vendorId: z.string().cuid("Invalid vendor"),
  items: z.array(z.object({
    dishId: z.string().cuid(),
    quantity: z.number().int().positive(),
    notes: z.string().optional(),
  })).min(1, "Order must have at least one item"),
  deliveryAddress: z.string().min(5, "Delivery address required"),
  deliveryLat: z.number().optional(),
  deliveryLng: z.number().optional(),
  specialInstructions: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VendorInput = z.infer<typeof vendorSchema>;
export type DishInput = z.infer<typeof dishSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
