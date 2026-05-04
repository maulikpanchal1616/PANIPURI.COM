import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
      include: { _count: { select: { dishes: true, orders: true, subVendors: true } } },
    });

    if (!vendor && session.user.role === "VENDOR") {
      vendor = await prisma.vendor.create({
        data: { userId: session.user.id, businessName: `${session.user.name}'s Kitchen`, address: "Ahmedabad", latitude: 23.0225, longitude: 72.5714, isApproved: true, isActive: true },
        include: { _count: { select: { dishes: true, orders: true, subVendors: true } } }
      });
    }
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    const revenue = await prisma.paymentTransaction.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS", order: { vendorId: vendor.id } },
    });

    return NextResponse.json({
      stats: {
        totalOrders: vendor._count.orders,
        totalRevenue: revenue._sum.amount ?? 0,
        rating: vendor.rating,
        totalDishes: vendor._count.dishes,
        totalStalls: vendor._count.subVendors,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
