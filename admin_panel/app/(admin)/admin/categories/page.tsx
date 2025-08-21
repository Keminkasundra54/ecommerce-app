// app/(admin)/categories/page.tsx
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, apiFetchForm } from '@/lib/api';
import { useRef, useState } from 'react';

type Category = { _id: string; name: string; image?: string };

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<{ items: Category[] }>('/categories')
  });

  const createMutation = useMutation({
    mutationFn: (form: FormData) => apiFetchForm<Category>('/categories', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories']}); setName(''); if (fileRef.current) fileRef.current.value = ''; }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form }: { id: string, form: FormData }) =>
      apiFetchForm<Category>(`/categories/${id}`, form, { method: 'PUT' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories']})
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories']})
  });

  return (
    <div className="space-y-8">
      <div className="card">
        <h1 className="text-xl font-bold mb-4">Categories</h1>
        <form className="grid gap-3 md:grid-cols-3" onSubmit={(e)=>{
          e.preventDefault();
          const form = new FormData();
          form.append('name', name);
          const f = fileRef.current?.files?.[0];
          if (f) form.append('image', f);
          createMutation.mutate(form);
        }}>
          <div><label className="label">Name</label><input className="input" value={name} onChange={(e)=>setName(e.target.value)} required /></div>
          <div><label className="label">Image</label><input ref={fileRef} className="input" type="file" accept="image/*" /></div>
          <div className="flex items-end"><button className="btn btn-primary w-full">Add</button></div>
        </form>
      </div>

      <div className="card">
        {isLoading ? 'Loading…' : error ? 'Failed to load' : (
          <table className="table">
            <thead><tr><th>Name</th><th>Image</th><th>Actions</th></tr></thead>
            <tbody>
              {data?.items?.map((c)=> (
                <tr key={c._id}>
                  <td className="font-medium">{c.name}</td>
                  <td>{c.image ? <img src={c.image} alt="" className="h-10 rounded" /> : <span className="text-gray-400">—</span>}</td>
                  <td className="space-x-2">
                    <button className="btn" onClick={()=>{
                      const newName = prompt('New name', c.name) || c.name;
                      const input = document.createElement('input');
                      input.type = 'file'; input.accept = 'image/*';
                      input.onchange = () => {
                        const form = new FormData();
                        form.append('name', newName);
                        if (input.files && input.files[0]) form.append('image', input.files[0]);
                        updateMutation.mutate({ id: c._id, form });
                      };
                      input.click();
                    }}>Edit</button>
                    <button className="btn" onClick={()=>{ if(confirm('Delete category?')) deleteMutation.mutate(c._id); }}>Delete</button>
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
