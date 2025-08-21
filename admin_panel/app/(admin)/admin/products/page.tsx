'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import ProductForm, { Product } from '@/components/ProductForm';

type Category = { _id: string; name: string };
type SubCategory = { _id: string; name: string; category: Category };

export default function ProductsPage() {
  const qc = useQueryClient();

  // filters
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');

  // modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<null | Product>(null);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<{ items: Category[] }>('/categories'),
  });

  useEffect(() => { if (!category && categories?.items?.length) setCategory(categories.items[0]._id); }, [categories, category]);

  const { data: subcategories } = useQuery({
    queryKey: ['subcategories', category],
    queryFn: () => apiFetch<{ items: SubCategory[] }>(`/subcategories${category ? `?category=${category}` : ''}`),
    enabled: !!category
  });

  useEffect(() => { if (!subCategory && subcategories?.items?.length) setSubCategory(subcategories.items[0]._id); }, [subcategories, subCategory]);

  const { data, isLoading } = useQuery({
    queryKey: ['products', category, subCategory],
    queryFn: () =>
      apiFetch<{ items: Product[]; total: number }>(
        `/products?${category ? `category=${category}&` : ''}${subCategory ? `subCategory=${subCategory}&` : ''}limit=100`
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });

  return (
    <div className="space-y-8">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Products</h1>
          <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>Add Product</button>
        </div>

        {/* Filters */}
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="label">Filter: Category</label>
            <select className="input" value={category} onChange={(e)=>{ setCategory(e.target.value); setSubCategory(''); }}>
              {categories?.items?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Filter: Subcategory</label>
            <select className="input" value={subCategory} onChange={(e)=>setSubCategory(e.target.value)}>
              {subcategories?.items?.map(sc => <option key={sc._id} value={sc._id}>{sc.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          'Loading…'
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Images</th>
                <th>Cat/Sub</th>
                <th>Price</th>
                <th>Qty</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.map((p) => (
                <tr key={p._id}>
                  <td className="font-medium">{p.name}</td>
                  <td><span className="badge">{p.sku}</span></td>
                  <td className="space-x-2">
                    {p.images?.slice(0,2).map((src, i) => <img key={i} src={src} alt="" className="inline-block h-10 rounded" />)}
                  </td>
                  <td>{p.category?.name} / {p.subCategory?.name}</td>
                  <td className="whitespace-nowrap font-semibold">
                    {p.priceCurrency} {Number(p.price).toFixed(2)} / {p.priceUnit}
                  </td>
                  <td>{p.quantity}</td>
                  <td className="space-x-2">
                    <button className="btn" onClick={() => setEditOpen(p)}>Edit</button>
                    <button className="btn" onClick={() => { if (confirm('Delete product?')) deleteMutation.mutate(p._id!); }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} title="Add Product" onClose={()=>setCreateOpen(false)}>
        <ProductForm
          mode="create"
          categoryId={category}
          subCategoryId={subCategory}
          onSubmitted={() => { setCreateOpen(false); qc.invalidateQueries({ queryKey: ['products'] }); }}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editOpen} title={`Edit: ${editOpen?.name || ''}`} onClose={()=>setEditOpen(null)}>
        {editOpen ? (
          <ProductForm
            mode="edit"
            initial={editOpen}
            categoryId={editOpen.category?._id || category}
            subCategoryId={editOpen.subCategory?._id || subCategory}
            onSubmitted={() => { setEditOpen(null); qc.invalidateQueries({ queryKey: ['products'] }); }}
            onCancel={() => setEditOpen(null)}
          />
        ) : null}
      </Modal>
    </div>
  );
}
