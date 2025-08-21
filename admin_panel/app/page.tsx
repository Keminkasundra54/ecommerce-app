import Link from 'next/link';
export default function Home() {
  return (
    <div className="container py-16">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <p>Go to <Link className="underline" href="/login">Login</Link> to access dashboard.</p>
    </div>
  );
}