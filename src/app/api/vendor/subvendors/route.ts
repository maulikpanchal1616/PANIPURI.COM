import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const vendor = await prisma.vendor.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id, businessName: `${session.user.name}'s Kitchen`, address: "Ahmedabad", latitude: 23.0225, longitude: 72.5714, isApproved: true, isActive: true }
    });
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    const subVendors = await prisma.subVendor.findMany({
      where: { vendorId: vendor.id },
      include: { _count: { select: { dishes: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ subVendors });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const vendor = await prisma.vendor.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id, businessName: `${session.user.name}'s Kitchen`, address: "Ahmedabad", latitude: 23.0225, longitude: 72.5714, isApproved: true, isActive: true }
    });
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    const body = await req.json();
    const subVendor = await prisma.subVendor.create({
      data: { vendorId: vendor.id, ...body },
    });

    return NextResponse.json({ subVendor }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
