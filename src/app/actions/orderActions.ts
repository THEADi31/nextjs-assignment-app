'use server';

import { prisma } from '@/lib/prisma';
import { createOrderSchema, CreateOrderInput } from '@/lib/schemas/orderSchema';
import { revalidatePath } from 'next/cache';

export async function placeCanteenOrder(data: CreateOrderInput) {
  const validation = createOrderSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
      message: 'Validation failed. Please check your inputs.',
    };
  }

  const { userName, userEmail, pickupSlot, items } = validation.data;

  try {
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: userName,
          email: userEmail,
          role: 'MEMBER',
        },
      });
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    const newOrder = await prisma.order.create({
      data: {
        userId: user.id,
        pickupSlot,
        status: 'PENDING',
        totalAmount,
        items: {
          create: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_ORDER',
        details: `Order #${newOrder.id} placed for ${userEmail}. Total: ₹${totalAmount}`,
      },
    });

    revalidatePath('/');
    revalidatePath('/admin');

    return {
      success: true,
      orderId: newOrder.id,
      message: 'Pre-order placed successfully!',
    };
  } catch (error) {
    console.error('Order Action Error:', error);
    return {
      success: false,
      message: 'Failed to place order. Internal server error.',
    };
  }
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: { user: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: updatedOrder.userId,
        action: 'UPDATE_ORDER_STATUS',
        details: `Order #${orderId} status changed to ${newStatus}`,
      },
    });

    revalidatePath('/admin');
    revalidatePath('/');

    return { success: true, message: `Order updated to ${newStatus}` };
  } catch (error) {
    console.error('Update Status Error:', error);
    return { success: false, message: 'Failed to update order status' };
  }
}