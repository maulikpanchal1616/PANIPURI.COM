import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const approved = searchParams.get("approved");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    const where: Record<string, unknown> = {};
    if (approved !== null) where.isApproved = approved === "true";

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, phone: true } },
          _count: { select: { dishes: true, orders: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.vendor.count({ where }),
    ]);

    return NextResponse.json({ vendors, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
