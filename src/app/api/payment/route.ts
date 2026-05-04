import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Simulated Razorpay payment flow
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orderId, paymentMethod } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId, userId: session.user.id },
      include: { payment: true },
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.payment) return NextResponse.json({ error: "Already paid" }, { status: 400 });

    // Simulate Razorpay order creation
    const razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const razorpayPaymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const razorpaySignature = `sig_${Date.now()}`;

    const isCOD = paymentMethod === "COD";

    // Create payment record & update order status atomically
    const [payment, updatedOrder] = await Promise.all([
      prisma.paymentTransaction.create({
        data: {
          orderId,
          razorpayOrderId: isCOD ? null : razorpayOrderId,
          razorpayPaymentId: isCOD ? null : razorpayPaymentId,
          razorpaySignature: isCOD ? null : razorpaySignature,
          amount: order.totalAmount + order.deliveryFee,
          status: isCOD ? "PENDING" : "SUCCESS",
          method: paymentMethod ?? "UPI",
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { status: "CONFIRMED" },
      }),
      prisma.deliveryLog.create({
        data: { 
          orderId, 
          status: "CONFIRMED", 
          message: isCOD 
            ? "Order confirmed! Please pay at the time of delivery." 
            : "Payment successful! Your order is confirmed." 
        },
      }),
      prisma.vendor.update({
        where: { id: order.vendorId },
        data: { totalOrders: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({
      payment,
      order: updatedOrder,
      message: "Payment successful",
    });
  } catch {
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 });
  }
}
