'use server';

import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

export type CheckoutItemInput = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  quality?: string;
  qualityLabel?: string;
  imageUrl?: string | null;
};

export type PaymentMethod = 'UPI' | 'COD';

export type PlaceOrderInput = {
  email?: string;
  phone: string;
  customerName: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  items: CheckoutItemInput[];
  subtotal: number;
  shipping: number;
  total: number;
};

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; orderId: string; paymentMethod: PaymentMethod }
  | { ok: false; error: string };

async function nextOrderNumber(tx: Prisma.TransactionClient) {
  const count = await tx.order.count();
  return `KS-${String(count + 1001).padStart(5, '0')}`;
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  try {
    if (!input.items?.length) {
      return { ok: false, error: 'Your cart is empty.' };
    }

    const email = input.email?.trim().toLowerCase() || null;
    const phone = input.phone.trim();
    const customerName = input.customerName.trim();
    const paymentMethod = input.paymentMethod === 'COD' ? 'COD' : 'UPI';

    if (!phone || !customerName || !input.line1.trim() || !input.city.trim() || !input.country.trim()) {
      return { ok: false, error: 'Please fill in all required fields.' };
    }

    const qualityNotes = input.items
      .map((item) => {
        const bits = [item.name, item.size, item.qualityLabel || item.quality].filter(Boolean);
        return `${bits.join(' / ')} × ${item.quantity}`;
      })
      .join('\n');

    const order = await prisma.$transaction(async (tx) => {
      const number = await nextOrderNumber(tx);

      const address = await tx.address.create({
        data: {
          name: customerName,
          phone,
          email,
          line1: input.line1.trim(),
          line2: input.line2?.trim() || null,
          city: input.city.trim(),
          postalCode: input.postalCode.trim() || null,
          country: input.country.trim(),
        },
      });

      const paymentLine =
        paymentMethod === 'COD'
          ? 'Payment: Cash on Delivery (COD)'
          : 'Payment: UPI — customer will pay via UPI';

      return tx.order.create({
        data: {
          number,
          status: 'PENDING',
          email,
          phone,
          customerName,
          notes: [
            paymentLine,
            input.notes?.trim() || '',
            'Items:',
            qualityNotes,
          ]
            .filter(Boolean)
            .join('\n'),
          subtotal: input.subtotal,
          shipping: input.shipping,
          total: input.total,
          currency: 'INR',
          shippingAddressId: address.id,
          items: {
            create: input.items.map((item) => ({
              productId: null,
              name: item.qualityLabel ? `${item.name} · ${item.qualityLabel}` : item.name,
              size: item.size || null,
              color: item.color || null,
              quantity: item.quantity,
              unitPrice: item.price,
              imageUrl: item.imageUrl || null,
            })),
          },
        } as never,
      });
    });

    // Persist payment method when the column exists (migration applied)
    try {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentMethod } as never,
      });
    } catch {
      // column may not exist yet — already saved in notes
    }

    return {
      ok: true,
      orderNumber: order.number,
      orderId: order.id,
      paymentMethod,
    };
  } catch (error) {
    console.error('placeOrder failed', error);
    return { ok: false, error: 'Could not place order. Please try again or message us on WhatsApp.' };
  }
}
