export default function DashboardPage() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="card"><h2 className="font-semibold">Overview</h2><p className="text-sm text-gray-600">Welcome to the admin panel.</p></div>
      <div className="card"><h2 className="font-semibold">Quick Tips</h2><ul className="list-disc pl-5 text-sm"><li>Use top nav to manage data</li><li>Filters on list pages</li></ul></div>
      <div className="card"><h2 className="font-semibold">Status</h2><p className="text-sm text-gray-600">Connected to API via env base URL.</p></div>
    </div>
  );
}