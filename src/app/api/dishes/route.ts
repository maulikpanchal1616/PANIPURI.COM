import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const category = searchParams.get("category");
    const isVeg = searchParams.get("isVeg");
    const lat = parseFloat(searchParams.get("lat") ?? "23.0225");
    const lng = parseFloat(searchParams.get("lng") ?? "72.5714");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      isAvailable: true,
      vendor: { isApproved: true, isActive: true },
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (category) where.category = category;
    if (isVeg !== null && isVeg !== undefined) where.isVeg = isVeg === "true";

    const [dishes, total] = await Promise.all([
      prisma.dish.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              businessName: true,
              logoUrl: true,
              rating: true,
              address: true,
              latitude: true,
              longitude: true,
            },
          },
        },
        orderBy: [{ isFeatured: "desc" }, { rating: "desc" }, { totalOrders: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.dish.count({ where }),
    ]);

    const R = 6371;
    const dishesWithDistance = dishes.map((dish) => {
      const dLat = ((dish.vendor.latitude - lat) * Math.PI) / 180;
      const dLng = ((dish.vendor.longitude - lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((dish.vendor.latitude * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return { ...dish, distance: Math.round(distance * 10) / 10 };
    });

    return NextResponse.json({ dishes: dishesWithDistance, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
