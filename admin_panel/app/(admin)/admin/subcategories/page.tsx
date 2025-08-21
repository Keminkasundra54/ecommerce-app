// app/(admin)/subcategories/page.tsx
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, apiFetchForm } from '@/lib/api';
import { useEffect, useRef, useState } from 'react';

type Category = { _id: string; name: string };
type SubCategory = { _id: string; name: string; image?: string; category: Category };

export default function SubcategoriesPage() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => apiFetch<{ items: Category[] }>('/categories') });

  useEffect(()=>{ if (!category && categories?.items?.length) setCategory(categories.items[0]._id); }, [categories, category]);

  const { data, isLoading } = useQuery({
    queryKey: ['subcategories', category],
    queryFn: () => apiFetch<{ items: SubCategory[] }>(`/subcategories${category ? `?category=${category}` : ''}`)
  });

  const createMutation = useMutation({
    mutationFn: (form: FormData) => apiFetchForm<SubCategory>('/subcategories', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subcategories']}); setName(''); if (fileRef.current) fileRef.current.value = ''; }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form }: { id: string, form: FormData }) =>
      apiFetchForm<SubCategory>(`/subcategories/${id}`, form, { method: 'PUT' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subcategories']})
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/subcategories/${id}`, { method: 'DELETE'}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subcategories']})
  });

  return (
    <div className="space-y-8">
      <div className="card">
        <h1 className="text-xl font-bold mb-4">Subcategories</h1>
        <form className="grid gap-3 md:grid-cols-4" onSubmit={(e)=>{
          e.preventDefault();
          if(!category) return;
          const form = new FormData();
          form.append('name', name);
          form.append('category', category);
          const f = fileRef.current?.files?.[0];
          if (f) form.append('image', f);
          createMutation.mutate(form);
        }}>
          <div><label className="label">Category</label>
            <select className="input" value={category} onChange={(e)=>setCategory(e.target.value)}>
              {categories?.items?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="label">Name</label><input className="input" value={name} onChange={(e)=>setName(e.target.value)} required /></div>
          <div><label className="label">Image</label><input ref={fileRef} className="input" type="file" accept="image/*" /></div>
          <div className="flex items-end"><button className="btn btn-primary w-full">Add</button></div>
        </form>
      </div>

      <div className="card">
        {isLoading ? 'Loading…' : (
          <table className="table">
            <thead><tr><th>Name</th><th>Category</th><th>Image</th><th>Actions</th></tr></thead>
            <tbody>
              {data?.items?.map((s)=> (
                <tr key={s._id}>
                  <td className="font-medium">{s.name}</td>
                  <td>{s.category?.name}</td>
                  <td>{s.image ? <img src={s.image} alt="" className="h-10 rounded" /> : <span className="text-gray-400">—</span>}</td>
                  <td className="space-x-2">
                    <button className="btn" onClick={()=>{
                      const newName = prompt('New name', s.name) || s.name;
                      const input = document.createElement('input');
                      input.type = 'file'; input.accept = 'image/*';
                      input.onchange = () => {
                        const form = new FormData();
                        form.append('name', newName);
                        form.append('category', s.category?._id || '');
                        if (input.files && input.files[0]) form.append('image', input.files[0]);
                        updateMutation.mutate({ id: s._id, form });
                      };
                      input.click();
                    }}>Edit</button>
                    <button className="btn" onClick={()=>{ if(confirm('Delete subcategory?')) deleteMutation.mutate(s._id); }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
