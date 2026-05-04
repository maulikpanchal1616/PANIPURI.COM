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

    const stall = await prisma.subVendor.findFirst({ where: { id, vendorId: vendor.id } });
    if (!stall) return NextResponse.json({ error: "Stall not found" }, { status: 404 });

    const body = await req.json();
    const updated = await prisma.subVendor.update({ where: { id }, data: body });
    return NextResponse.json({ subVendor: updated });
  } catch {
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

    await prisma.subVendor.deleteMany({ where: { id, vendorId: vendor.id } });
    return NextResponse.json({ message: "Deleted" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
