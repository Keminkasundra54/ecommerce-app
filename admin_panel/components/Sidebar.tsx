'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const nav = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Subcategories', href: '/admin/subcategories' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Users', href: '/admin/users' },
//   { label: 'Settings', href: '/admin/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false); // mobile

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b flex items-center justify-between px-3 py-2">
        <div className="font-extrabold">Admin</div>
        <button className="btn" onClick={() => setOpen(v => !v)}>{open ? 'Close' : 'Menu'}</button>
      </div>

      {/* Sidebar */}
      <aside
        className={`md:sticky md:top-0 md:h-[100dvh] md:w-64 w-full bg-white border-r p-3 md:block ${open ? '' : 'hidden md:block'}`}
      >
        <div className="px-2 py-3">
          <div className="text-xl font-extrabold">Shipper Admin</div>
        </div>
        <nav className="mt-2 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium
                  ${active ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer (optional) */}
        <div className="mt-6 px-3 text-xs text-gray-400">
          <div>v1.0.0</div>
        </div>
      </aside>
    </>
  );
}
