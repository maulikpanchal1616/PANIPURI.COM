import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } });
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    const dish = await prisma.dish.findFirst({
      where: { id, vendorId: vendor.id },
    });

    if (!dish) return NextResponse.json({ error: "Dish not found" }, { status: 404 });

    return NextResponse.json({ dish });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
        name: body.name,
        description: body.description,
        price: body.price ? parseFloat(body.price.toString()) : undefined,
        category: body.category,
        isVeg: body.isVeg,
        imageUrl: body.imageUrl,
        isAvailable: body.isAvailable,
        stock: body.stock ? parseInt(body.stock.toString()) : undefined,
        portionSize: body.portionSize,
      },
    });

    return NextResponse.json({ dish: updated });
  } catch (error) {
    console.error("Update dish error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } });
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    await prisma.dish.deleteMany({
      where: { id, vendorId: vendor.id },
    });

    return NextResponse.json({ message: "Dish deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
