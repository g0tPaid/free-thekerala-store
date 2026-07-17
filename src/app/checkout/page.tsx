'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Header } from '@/components/store/header';
import { placeOrder, type PaymentMethod } from '@/app/actions/checkout';
import { useWhatsappUrl } from '@/components/providers';
import { BRAND } from '@/lib/brand';
import { useCart } from '@/lib/store';
import { cn, formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const waUrl = useWhatsappUrl();
  const items = useCart((state) => state.items);
  const subtotal = useCart((state) => state.subtotal());
  const clear = useCart((state) => state.clear);
  const shipping = 0;
  const total = subtotal;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [placed, setPlaced] = useState<{
    orderNumber: string;
    paymentMethod: PaymentMethod;
    total: number;
  } | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length || submitting) return;

    setSubmitting(true);
    setError('');

    const form = new FormData(event.currentTarget);
    const orderTotal = total;
    const result = await placeOrder({
      email: String(form.get('email') || ''),
      phone: String(form.get('phone') || ''),
      customerName: String(form.get('customerName') || ''),
      line1: String(form.get('line1') || ''),
      line2: String(form.get('line2') || ''),
      city: String(form.get('city') || ''),
      postalCode: String(form.get('postalCode') || ''),
      country: String(form.get('country') || 'India'),
      notes: String(form.get('notes') || ''),
      paymentMethod,
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        quality: item.quality,
        qualityLabel: item.qualityLabel,
        imageUrl: item.imageUrl,
      })),
      subtotal,
      shipping,
      total: orderTotal,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    clear();
    setPlaced({
      orderNumber: result.orderNumber,
      paymentMethod: result.paymentMethod,
      total: orderTotal,
    });
  }

  if (placed) {
    const isUpi = placed.paymentMethod === 'UPI';
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <section className="px-4 py-16 text-center">
          <p className="text-[11px] font-bold tracking-[0.24em] text-muted">ORDER RECEIVED</p>
          <h1 className="mt-4 font-serif text-[48px] leading-[0.92] tracking-[-0.06em]">Thank you.</h1>
          <p className="mx-auto mt-6 max-w-[320px] border border-black/10 bg-surface px-5 py-4 text-sm">
            Your order number
            <span className="mt-2 block font-serif text-[28px] tracking-[-0.04em] text-black">
              {placed.orderNumber}
            </span>
          </p>

          {isUpi ? (
            <div className="mx-auto mt-6 max-w-[320px] space-y-3 rounded-2xl border border-[#4f8f6e]/25 bg-[#eef6f1] px-5 py-4 text-left text-sm leading-6 text-[#2f5a48]">
              <p className="text-[11px] font-bold tracking-[0.18em]">PAY WITH UPI</p>
              <p>
                Amount: <span className="font-bold">{formatPrice(placed.total)}</span>
              </p>
              <p>
                UPI ID: <span className="font-bold break-all">{BRAND.upiId}</span>
              </p>
              <p className="text-xs text-muted">
                Pay to {BRAND.upiName}, then WhatsApp us your payment screenshot with order number{' '}
                {placed.orderNumber}.
              </p>
            </div>
          ) : (
            <div className="mx-auto mt-6 max-w-[320px] space-y-3 rounded-2xl border border-[#4f8f6e]/25 bg-[#eef6f1] px-5 py-4 text-left text-sm leading-6 text-[#2f5a48]">
              <p className="text-[11px] font-bold tracking-[0.18em]">CASH ON DELIVERY</p>
              <p>
                Pay <span className="font-bold">{formatPrice(placed.total)}</span> when your order
                arrives.
              </p>
              <p className="text-xs text-muted">
                Keep your phone on — we may call or WhatsApp for confirmation / QC.
              </p>
            </div>
          )}

          <a
            href={waUrl(
              isUpi
                ? `Hi, I placed order ${placed.orderNumber}. Paying via UPI (${formatPrice(placed.total)}). Sending screenshot.`
                : `Hi, I placed order ${placed.orderNumber} with Cash on Delivery.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-full max-w-[320px] items-center justify-center rounded-2xl border border-[#25D366] bg-[#25D366] px-5 py-4 text-[11px] font-bold tracking-[0.14em] text-white"
          >
            WhatsApp us
          </a>
          <Link
            href="/"
            className="mt-4 inline-block text-[11px] font-bold tracking-[0.22em] underline underline-offset-4"
          >
            BACK TO SHOP
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="px-4 py-8">
        <p className="mb-5 text-[11px] font-bold tracking-[0.24em] text-muted">SECURE CHECKOUT</p>
        <h1 className="font-serif text-[54px] leading-[0.9] tracking-[-0.07em]">Finish with less.</h1>
      </section>

      <section className="border-y border-hairline px-4 py-5">
        <h2 className="mb-4 text-[11px] font-bold tracking-[0.22em]">ORDER</h2>
        {items.length ? (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size ?? 'default'}-${item.quality ?? 'default'}`}
                className="flex justify-between gap-4 text-sm"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="mt-1 text-xs text-muted">
                    Qty {item.quantity}
                    {item.size ? ` / ${item.size}` : ''}
                    {item.qualityLabel ? ` / ${item.qualityLabel}` : ''}
                  </p>
                </div>
                <p>{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="font-serif text-3xl tracking-[-0.04em]">Your cart is empty.</p>
            <Link
              href="/"
              className="mt-4 inline-block text-[11px] font-bold tracking-[0.22em] underline underline-offset-4"
            >
              RETURN TO SHOP
            </Link>
          </div>
        )}
      </section>

      <form onSubmit={onSubmit} className="space-y-6 px-4 py-6">
        <fieldset className="space-y-3">
          <legend className="mb-3 text-[11px] font-bold tracking-[0.22em]">CONTACT</legend>
          <input
            required
            name="email"
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border border-hairline px-4 py-3 text-sm outline-none focus:border-[#4f8f6e]"
          />
          <input
            required
            name="phone"
            type="tel"
            placeholder="Phone / WhatsApp"
            className="w-full rounded-xl border border-hairline px-4 py-3 text-sm outline-none focus:border-[#4f8f6e]"
          />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="mb-3 text-[11px] font-bold tracking-[0.22em]">SHIPPING</legend>
          <input
            required
            name="customerName"
            placeholder="Full name"
            className="w-full rounded-xl border border-hairline px-4 py-3 text-sm outline-none focus:border-[#4f8f6e]"
          />
          <input
            required
            name="line1"
            placeholder="Address"
            className="w-full rounded-xl border border-hairline px-4 py-3 text-sm outline-none focus:border-[#4f8f6e]"
          />
          <input
            name="line2"
            placeholder="Apartment, suite (optional)"
            className="w-full rounded-xl border border-hairline px-4 py-3 text-sm outline-none focus:border-[#4f8f6e]"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              name="city"
              placeholder="City"
              className="w-full rounded-xl border border-hairline px-4 py-3 text-sm outline-none focus:border-[#4f8f6e]"
            />
            <input
              required
              name="postalCode"
              placeholder="Postal code"
              className="w-full rounded-xl border border-hairline px-4 py-3 text-sm outline-none focus:border-[#4f8f6e]"
            />
          </div>
          <input
            required
            name="country"
            defaultValue="India"
            placeholder="Country"
            className="w-full rounded-xl border border-hairline px-4 py-3 text-sm outline-none focus:border-[#4f8f6e]"
          />
          <textarea
            name="notes"
            rows={3}
            placeholder="Notes (optional)"
            className="w-full rounded-xl border border-hairline px-4 py-3 text-sm outline-none focus:border-[#4f8f6e]"
          />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="mb-3 text-[11px] font-bold tracking-[0.22em]">PAYMENT</legend>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { id: 'UPI' as const, title: 'UPI', hint: 'Pay online now' },
                { id: 'COD' as const, title: 'COD', hint: 'Cash on delivery' },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setPaymentMethod(option.id)}
                className={cn(
                  'rounded-2xl border px-4 py-3 text-left transition',
                  paymentMethod === option.id
                    ? 'border-[#4f8f6e] bg-[#4f8f6e] text-white'
                    : 'border-hairline bg-white text-[#2f5a48]',
                )}
              >
                <span className="block text-[12px] font-bold tracking-[0.14em]">{option.title}</span>
                <span
                  className={cn(
                    'mt-1 block text-[11px]',
                    paymentMethod === option.id ? 'text-white/85' : 'text-muted',
                  )}
                >
                  {option.hint}
                </span>
              </button>
            ))}
          </div>
          {paymentMethod === 'UPI' ? (
            <p className="rounded-xl bg-[#eef6f1] px-3 py-2 text-xs leading-5 text-[#2f5a48]">
              After placing, you&apos;ll get our UPI ID to pay{' '}
              <span className="font-bold">{formatPrice(total)}</span>.
            </p>
          ) : (
            <p className="rounded-xl bg-[#eef6f1] px-3 py-2 text-xs leading-5 text-[#2f5a48]">
              Pay cash when the parcel arrives. Total{' '}
              <span className="font-bold">{formatPrice(total)}</span>.
            </p>
          )}
        </fieldset>

        <div className="space-y-2 border-t border-hairline pt-5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between pt-3 text-base font-bold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={!items.length || submitting}
          className="w-full rounded-2xl bg-[#4f8f6e] px-5 py-4 text-[11px] font-bold tracking-[0.22em] text-white disabled:bg-neutral-300"
        >
          {submitting
            ? 'PLACING ORDER…'
            : paymentMethod === 'COD'
              ? 'PLACE COD ORDER'
              : 'PLACE ORDER · PAY UPI'}
        </button>
      </form>
    </main>
  );
}
