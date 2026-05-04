import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } });
    if (!vendor && session.user.role === "VENDOR") {
      vendor = await prisma.vendor.create({
        data: { userId: session.user.id, businessName: `${session.user.name}'s Kitchen`, address: "Ahmedabad", latitude: 23.0225, longitude: 72.5714, isApproved: true, isActive: true }
      });
    }
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    const dishes = await prisma.dish.findMany({
      where: { vendorId: vendor.id },
      include: { subVendor: { select: { stallName: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ dishes });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } });
    if (!vendor && session.user.role === "VENDOR") {
      vendor = await prisma.vendor.create({
        data: { userId: session.user.id, businessName: `${session.user.name}'s Kitchen`, address: "Ahmedabad", latitude: 23.0225, longitude: 72.5714, isApproved: true, isActive: true }
      });
    }
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    const body = await req.json();
    const { name, description, price, category, isVeg, imageUrl } = body;

    const dish = await prisma.dish.create({
      data: {
        vendorId: vendor.id,
        name,
        description,
        price: parseFloat(price),
        category: category || "STREET_FOOD",
        isVeg: Boolean(isVeg),
        imageUrl: imageUrl || null,
        isAvailable: true,
      },
    });

    return NextResponse.json({ dish }, { status: 201 });
  } catch (error) {
    console.error("Create dish error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
