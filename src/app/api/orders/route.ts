import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { vendorId, items, deliveryAddress, deliveryLat, deliveryLng, specialInstructions } = parsed.data;

    // Fetch dishes to get current prices
    const dishIds = items.map((i) => i.dishId);
    const dishes = await prisma.dish.findMany({
      where: { id: { in: dishIds }, isAvailable: true },
    });

    if (dishes.length !== dishIds.length) {
      return NextResponse.json({ error: "Some items are no longer available" }, { status: 400 });
    }

    const orderItems = items.map((item) => {
      const dish = dishes.find((d) => d.id === item.dishId)!;
      return {
        dishId: item.dishId,
        quantity: item.quantity,
        price: dish.discountPrice ?? dish.price,
        notes: item.notes,
      };
    });

    const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        vendorId,
        totalAmount,
        deliveryFee: 30,
        deliveryAddress,
        deliveryLat,
        deliveryLng,
        specialInstructions,
        items: { create: orderItems },
        deliveryLog: {
          create: { status: "PENDING", message: "Order placed successfully" },
        },
      },
      include: {
        items: { include: { dish: true } },
        vendor: true,
        deliveryLog: true,
      },
    });

    // Update dish order count
    await Promise.all(
      items.map((item) =>
        prisma.dish.update({
          where: { id: item.dishId },
          data: { totalOrders: { increment: item.quantity } },
        })
      )
    );

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");

    const where =
      session.user.role === "ADMIN"
        ? {}
        : session.user.role === "VENDOR"
        ? { vendor: { userId: session.user.id } }
        : { userId: session.user.id };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { dish: { select: { name: true, imageUrl: true } } } },
          vendor: { select: { businessName: true, logoUrl: true, latitude: true, longitude: true } },
          payment: { select: { status: true, method: true } },
          deliveryLog: { orderBy: { timestamp: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
