export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard title="Total Balance" value="$10,000" />
        <DashboardCard title="Income (This Month)" value="$5,000" />
        <DashboardCard title="Expenses (This Month)" value="$3,000" />
        <DashboardCard title="Savings Rate" value="40%" />
        <DashboardCard title="Top Expense Category" value="Food & Dining" />
        <DashboardCard title="Upcoming Bills" value="3" />
      </div>
    </div>
  );
}

function DashboardCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-3xl font-bold text-blue-600">{value}</p>
    </div>
  );
}
