import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    return NextResponse.json({ vendor });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { businessName, description, address, upiId, isActive } = body;

    const vendor = await prisma.vendor.update({
      where: { userId: session.user.id },
      data: {
        businessName,
        description,
        address,
        upiId,
        isActive,
      },
    });

    return NextResponse.json({ vendor });
  } catch (error) {
    console.error("Update vendor error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
