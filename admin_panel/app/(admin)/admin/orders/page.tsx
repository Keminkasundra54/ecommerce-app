'use client';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useMemo, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import Modal from '@/components/Modal';              // ← reuse the Modal we already have
import OrderDetails, { OrderFull } from '@/components/OrderDetails';


type OrderItem = { name: string; quantity: number };
type OrderRow = {
  _id: string;
  createdAt: string;
  status: 'pending'|'paid'|'failed'|'cancelled'|'shipped'|'completed'|'refunded';
  grandTotal: number;
  currency?: string;
  items: OrderItem[];
  payment?: { status?: string; method?: string; provider?: string; paidAt?: string };
};

const STATUS = ['pending','paid','failed','cancelled','shipped','completed','refunded'] as const;

export default function OrdersPage() {
  const qc = useQueryClient();

  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // modal state
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<OrderFull | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const queryKey = useMemo(()=>['orders', { status, page, limit }], [status, page, limit]);

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      apiFetch<{ total: number; page: number; pageSize: number; items: OrderRow[] }>(
        `/orders?${status ? `status=${status}&` : ''}page=${page}&limit=${limit}`
      ),
    placeholderData: keepPreviousData,  // ⬅️ v5 way
    staleTime: 30_000,                  // optional: treat data fresh for 30s
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      apiFetch(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const total = data?.total || 0;
  const pageSize = data?.pageSize || limit;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));

  const openModal = useCallback(async (id: string) => {
    setSelectedId(id);
    setSelectedData(null);
    setOpen(true);
    setLoadingDetails(true);
    try {
      const order = await apiFetch<OrderFull>(`/orders/${id}`);
      setSelectedData(order);
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Orders</h1>
          <div className="text-sm text-gray-500">Total: {total}</div>
        </div>

        <div className="grid gap-3 md:grid-cols-4 mb-4">
          <div>
            <label className="label">Filter: Status</label>
            <select className="input" value={status} onChange={(e)=>{ setPage(1); setStatus(e.target.value); }}>
              <option value="">All</option>
              {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="md:col-span-3 flex items-end justify-end gap-2">
            <button className="btn" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
            <span className="text-sm">Page {page} / {maxPage}</span>
            <button className="btn" disabled={page>=maxPage} onClick={()=>setPage(p=>Math.min(maxPage,p+1))}>Next</button>
          </div>
        </div>

        {isLoading ? (
          'Loading…'
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Created</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Items</th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.map(o => (
                <tr key={o._id} onClick={() => openModal(o._id)} className="cursor-pointer hover:bg-gray-50">
                  <td className="font-semibold">#{o._id.slice(-6).toUpperCase()}</td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                  <td><span className="badge">{o.status}</span></td>
                  <td>
                    <div className="text-sm">
                      {(o.payment?.provider || 'cod').toUpperCase()} • {o.payment?.status || 'unpaid'}
                      {o.payment?.paidAt ? <div className="text-gray-500">{new Date(o.payment.paidAt).toLocaleString()}</div> : null}
                    </div>
                  </td>
                  <td className="font-semibold whitespace-nowrap">{(o.currency || 'INR')} {o.grandTotal?.toFixed?.(2)}</td>
                  <td className="text-sm text-gray-600">
                    {o.items?.slice(0,3).map(i=>`${i.name}×${i.quantity}`).join(', ')}
                    {o.items?.length>3 ? ' …' : ''}
                  </td>
                  <td className="space-x-2" onClick={(e)=>e.stopPropagation()}>
                    {/* Quick status change (don’t open modal when interacting) */}
                    <select
                      className="input !py-1 !px-2 w-[9.5rem]"
                      defaultValue={o.status}
                      onChange={(e)=>patchMutation.mutate({ id: o._id, updates: { status: e.target.value } })}
                    >
                      {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {o.payment?.status !== 'paid' ? (
                      <button className="btn" onClick={() => patchMutation.mutate({ id: o._id, updates: { paymentStatus: 'paid' } })}>
                        Mark paid
                      </button>
                    ) : (
                      <button className="btn" onClick={() => patchMutation.mutate({ id: o._id, updates: { paymentStatus: 'unpaid' } })}>
                        Mark unpaid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={open}
        title={selectedId ? `Order #${selectedId.slice(-6).toUpperCase()}` : 'Order'}
        onClose={() => setOpen(false)}
      >
        {loadingDetails || !selectedData ? (
          <div>Loading order…</div>
        ) : (
          <OrderDetails order={selectedData} />
        )}
      </Modal>
    </div>
  );
}
