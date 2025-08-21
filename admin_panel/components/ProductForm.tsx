'use client';
import React, { useEffect, useRef, useState } from 'react';
import { apiFetchForm } from '@/lib/api';

type Category = { _id: string; name: string };
type SubCategory = { _id: string; name: string; category: Category };
export type Product = {
  _id?: string;
  name: string;
  sku: string;
  images?: string[];
  category: Category;
  subCategory: SubCategory;
  quantity: number;
  description?: string;
  price: number;
  priceCurrency: string;
  priceUnit: 'piece'|'pack'|'kg'|'g'|'litre'|'ml';
  attributes?: Record<string, any>;
  featured: boolean;
  active?: boolean;
};

const PRICE_UNITS = ['piece', 'pack', 'kg', 'g', 'litre', 'ml'];
const CURRENCIES = ['INR','USD','EUR','GBP','AED','SAR'];

export default function ProductForm({
  mode, // 'create' | 'edit'
  initial,
  categoryId,
  subCategoryId,
  onSubmitted,
  onCancel
}: {
  mode: 'create' | 'edit';
  initial?: Partial<Product>;
  categoryId?: string;
  subCategoryId?: string;
  onSubmitted: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [sku, setSku] = useState(initial?.sku || '');
  const [featured, setFeatured] = useState<boolean>(Boolean(initial?.featured));
  const [quantity, setQuantity] = useState<number>(typeof initial?.quantity === 'number' ? initial!.quantity : 0);
  const [description, setDescription] = useState(initial?.description || '');
  const [price, setPrice] = useState<number | ''>(typeof initial?.price === 'number' ? initial!.price : '');
  const [priceCurrency, setPriceCurrency] = useState(initial?.priceCurrency || 'INR');
  const [priceUnit, setPriceUnit] = useState<'piece'|'pack'|'kg'|'g'|'litre'|'ml'>((initial?.priceUnit as any) || 'piece');
  const [attributes, setAttributes] = useState(
    initial?.attributes ? JSON.stringify(initial.attributes, null, 2) : ''
  );
  const filesRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{ setError(null); }, [name, sku, quantity, description, price, priceCurrency, priceUnit, attributes]);

  function parseAttrs(): string | null {
    if (!attributes.trim()) return null;
    try { JSON.parse(attributes); return attributes; }
    catch { setError('Attributes must be valid JSON (e.g. {"color":"red","size":"L"})'); return null; }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!categoryId || !subCategoryId) { setError('Category and Subcategory required'); return; }
    if (price === '' || isNaN(Number(price))) { setError('Price is required and must be a number'); return; }

    const attrs = parseAttrs();
    if (attributes && !attrs) return;

    const form = new FormData();
    form.append('category', categoryId);
    form.append('subCategory', subCategoryId);
    if (name) form.append('name', name);
    if (sku) form.append('sku', sku);
    form.append('quantity', String(quantity || 0));
    if (description) form.append('description', description);
    form.append('price', String(price));
    form.append('priceCurrency', priceCurrency);
    form.append('priceUnit', priceUnit);
    if (attrs) form.append('attributes', attrs);

    const files = filesRef.current?.files;
    if (files && files.length) Array.from(files).forEach(f => form.append('images', f));
    form.append('featured', String(!!featured));
    setSubmitting(true);
    try {
      if (mode === 'create') {
        await apiFetchForm<Product>('/products', form);
      } else if (mode === 'edit' && initial?._id) {
        await apiFetchForm<Product>(`/products/${initial._id}`, form, { method: 'PUT' });
      }
      onSubmitted();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="grid gap-3 md:grid-cols-6" onSubmit={onSubmit}>
      <div className="md:col-span-3">
        <label className="label">Name</label>
        <input className="input" value={name} onChange={(e)=>setName(e.target.value)} required />
      </div>
      <div className="md:col-span-3">
        <label className="label">SKU</label>
        <input className="input" value={sku} onChange={(e)=>setSku(e.target.value)} required />
      </div>

      <div className="md:col-span-3">
        <label className="label">Images</label>
        <input ref={filesRef} className="input" type="file" accept="image/*" multiple />
      </div>

      <div>
        <label className="label">Quantity</label>
        <input className="input" type="number" value={quantity} onChange={(e)=>setQuantity(parseInt(e.target.value||'0'))} />
      </div>

      <div className="md:col-span-6">
        <label className="label">Description</label>
        <textarea className="input" rows={3} value={description} onChange={(e)=>setDescription(e.target.value)} />
      </div>

      <div>
        <label className="label">Price</label>
        <input className="input" type="number" step="0.01"
               value={price} onChange={(e)=>setPrice(e.target.value === '' ? '' : Number(e.target.value))} required />
      </div>
      <div className="md:col-span-2">
        <label className="label">Featured</label>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          <span>Mark as featured</span>
        </div>
      </div>
      <div>
        <label className="label">Currency</label>
        <select className="input" value={priceCurrency} onChange={(e)=>setPriceCurrency(e.target.value)}>
          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Price unit</label>
        <select className="input" value={priceUnit} onChange={(e)=>setPriceUnit(e.target.value as any)}>
          {PRICE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      <div className="md:col-span-6">
        <label className="label">Attributes (JSON)</label>
        <textarea className="input" rows={3} value={attributes} onChange={(e)=>setAttributes(e.target.value)}
                  placeholder='e.g. {"color":"red","size":"L"}' />
      </div>

      {error ? <div className="md:col-span-6 text-red-600 text-sm">{error}</div> : null}

      <div className="md:col-span-6 flex justify-end gap-3 mt-2">
        <button type="button" className="btn" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving…' : (mode === 'create' ? 'Create' : 'Save changes')}</button>
      </div>
    </form>
  );
}
