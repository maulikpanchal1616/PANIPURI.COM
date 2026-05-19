import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        dishes: {
          orderBy: {
            name: "asc",
          },
        },
        subVendors: true,
      },
    });

    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    return NextResponse.json({ vendor });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
