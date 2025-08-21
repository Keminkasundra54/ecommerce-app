'use client';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { usePathname, useRouter } from 'next/navigation';

export default function Nav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="border-b">
      <div className="container py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className={`font-semibold ${pathname?.startsWith('/dashboard') ? 'underline' : ''}`}>Dashboard</Link>
          <Link href="/categories" className={`${pathname?.startsWith('/categories') ? 'underline' : ''}`}>Categories</Link>
          <Link href="/subcategories" className={`${pathname?.startsWith('/subcategories') ? 'underline' : ''}`}>Subcategories</Link>
          <Link href="/products" className={`${pathname?.startsWith('/products') ? 'underline' : ''}`}>Products</Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm badge">{user?.email}</span>
          <button className="btn" onClick={() => { logout(); router.push('/login'); }}>Logout</button>
        </div>
      </div>
    </nav>
  );
}