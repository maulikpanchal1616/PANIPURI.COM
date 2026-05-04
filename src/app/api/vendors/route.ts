import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const lat = parseFloat(searchParams.get("lat") ?? "23.0225");
    const lng = parseFloat(searchParams.get("lng") ?? "72.5714");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "12");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { isApproved: true };

    if (search) {
      where.OR = [
        { businessName: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          dishes: { where: { isAvailable: true }, take: 6, orderBy: { isFeatured: "desc" } },
          subVendors: { where: { isActive: true } },
          _count: { select: { dishes: true, orders: true } },
        },
        orderBy: [{ rating: "desc" }, { totalOrders: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.vendor.count({ where }),
    ]);

    const R = 6371;
    const vendorsWithDistance = vendors.map((v) => {
      const dLat = ((v.latitude - lat) * Math.PI) / 180;
      const dLng = ((v.longitude - lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((v.latitude * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return { ...v, distance: Math.round(distance * 10) / 10 };
    });

    return NextResponse.json({ vendors: vendorsWithDistance, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
