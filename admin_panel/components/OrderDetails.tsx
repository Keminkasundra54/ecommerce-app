'use client';
import React from 'react';

type OrderItem = {
  name: string;
  quantity: number;
  price?: number;
  priceCurrency?: string;
  lineTotal?: number;
  image?: string;
};
type Address = {
  name?: string; phone?: string;
  line1?: string; line2?: string; city?: string; state?: string; postalCode?: string; country?: string;
};
export type OrderFull = {
  _id: string;
  createdAt: string;
  status: string;
  currency?: string;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  grandTotal: number;
  items: OrderItem[];
  payment?: { provider?: string; method?: string; status?: string; paidAt?: string };
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
};

export default function OrderDetails({
  order,
}: { order: OrderFull }) {
  const ccy = order.currency || 'INR';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-lg font-bold">Order #{order._id.slice(-6).toUpperCase()}</div>
        <div className="badge">{order.status}</div>
        <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Shipping */}
        <div className="card">
          <div className="text-sm font-semibold mb-2">Shipping address</div>
          <div className="text-sm text-gray-700 space-y-1">
            <div>{order.shippingAddress?.name}</div>
            <div>{order.shippingAddress?.line1}{order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ''}</div>
            <div>{order.shippingAddress?.city}{order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''} {order.shippingAddress?.postalCode}</div>
            <div>{order.shippingAddress?.country}</div>
            {order.shippingAddress?.phone ? <div>📞 {order.shippingAddress.phone}</div> : null}
          </div>
        </div>

        {/* Payment */}
        <div className="card">
          <div className="text-sm font-semibold mb-2">Payment</div>
          <div className="text-sm text-gray-700 space-y-1">
            <div>Provider: {order.payment?.provider?.toUpperCase?.() || 'COD'}</div>
            <div>Status: {order.payment?.status || 'unpaid'}</div>
            {order.payment?.paidAt ? <div>Paid at: {new Date(order.payment.paidAt).toLocaleString()}</div> : null}
            {order.notes ? <div className="mt-2">Notes: {order.notes}</div> : null}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card">
        <div className="text-sm font-semibold mb-2">Items</div>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 56 }}></th>
              <th>Item</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Price</th>
              <th className="text-right">Line total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it, i) => (
              <tr key={i}>
                <td>
                  {it.image ? <img src={it.image} alt="" className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 bg-gray-100 rounded" />}
                </td>
                <td className="font-medium">{it.name}</td>
                <td className="text-right">{it.quantity}</td>
                <td className="text-right">{(it.priceCurrency || ccy)} {Number(it.price ?? 0).toFixed(2)}</td>
                <td className="text-right">{(it.priceCurrency || ccy)} {Number(it.lineTotal ?? (it.price ?? 0) * it.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="ml-auto w-full md:w-[380px]">
        <div className="card">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{ccy} {order.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{ccy} {order.shipping.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{ccy} {order.tax.toFixed(2)}</span></div>
            {order.discount > 0 ? (
              <div className="flex justify-between text-green-700"><span>Discount</span><span>- {ccy} {order.discount.toFixed(2)}</span></div>
            ) : null}
            <div className="border-t pt-2 flex justify-between font-semibold text-base">
              <span>Total</span><span>{ccy} {order.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
