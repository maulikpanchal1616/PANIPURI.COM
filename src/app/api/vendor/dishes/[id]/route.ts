import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } });
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    const body = await req.json();
    const dish = await prisma.dish.findFirst({ where: { id, vendorId: vendor.id } });
    if (!dish) return NextResponse.json({ error: "Dish not found" }, { status: 404 });

    const updated = await prisma.dish.update({
      where: { id },
      data: {
        ...(typeof body.isAvailable === "boolean" && { isAvailable: body.isAvailable }),
        ...(body.price && { price: body.price }),
        ...(body.name && { name: body.name }),
      },
    });

    return NextResponse.json({ dish: updated });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
