'use client';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';

type User = {
  _id: string;
  name?: string;
  email: string;
  role?: 'admin' | 'user';
  createdAt: string;
  lastLoginAt?: string;
  isActive?: boolean;
};

export default function UsersPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const queryKey = useMemo(()=>['users', { q, page, limit }], [q, page, limit]);

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      apiFetch<{ total:number; page:number; pageSize:number; items:User[] }>(
        `/users?${q ? `q=${encodeURIComponent(q)}&` : ''}page=${page}&limit=${limit}`
      ),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });


  const total = data?.total || 0;
  const pageSize = data?.pageSize || limit;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Users</h1>
          <div className="text-sm text-gray-500">Total: {total}</div>
        </div>

        <div className="grid gap-3 md:grid-cols-4 mb-4">
          <div className="md:col-span-2">
            <label className="label">Search</label>
            <input
              className="input"
              placeholder="Name or email"
              value={q}
              onChange={(e)=>{ setPage(1); setQ(e.target.value); }}
            />
          </div>
          <div className="md:col-span-2 flex items-end justify-end gap-2">
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
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Last login</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.map(u => (
                <tr key={u._id}>
                  <td className="font-semibold">{u.name || '—'}</td>
                  <td>{u.email}</td>
                  <td><span className="badge">{u.role || 'user'}</span></td>
                  <td>{new Date(u.createdAt).toLocaleString()}</td>
                  <td>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : '—'}</td>
                  <td>{u.isActive === false ? <span className="badge">inactive</span> : 'active'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
