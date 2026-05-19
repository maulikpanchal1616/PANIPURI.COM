import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Count successful orders for customer profile stats
    const orderCount = await prisma.order.count({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ user: { ...user, orderCount } });
  } catch (error) {
    console.error("GET user profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, address } = body;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
        address,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        image: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("PATCH user profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
