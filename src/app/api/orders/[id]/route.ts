import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { dish: true } },
        vendor: true,
        payment: true,
        deliveryLog: { orderBy: { timestamp: "asc" } },
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const isOwner = order.userId === session.user.id;
    const isVendorOwner = order.vendor.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isVendorOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { status, latitude, longitude, message } = await req.json();

    const order = await prisma.order.findUnique({ where: { id }, include: { vendor: true } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const isVendorOwner = order.vendor.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    if (!isVendorOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [updatedOrder] = await Promise.all([
      prisma.order.update({
        where: { id },
        data: { status },
        include: { deliveryLog: { orderBy: { timestamp: "desc" }, take: 5 } },
      }),
      prisma.deliveryLog.create({ data: { orderId: id, status, latitude, longitude, message } }),
    ]);

    return NextResponse.json({ order: updatedOrder });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
