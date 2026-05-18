import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Admin: Get dashboard stats
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      totalUsers, totalVendors, pendingVendors, totalOrders,
      totalRevenue, recentOrders, ordersByArea,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.vendor.count({ where: { isApproved: true } }),
      prisma.vendor.count({ where: { isApproved: false } }),
      prisma.order.count(),
      prisma.paymentTransaction.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCESS" },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          vendor: { select: { businessName: true } },
          payment: { select: { status: true } },
        },
      }),
      prisma.order.groupBy({
        by: ["deliveryAddress"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalVendors,
        pendingVendors,
        totalOrders,
        totalRevenue: totalRevenue._sum.amount ?? 0,
      },
      recentOrders,
      ordersByArea,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
