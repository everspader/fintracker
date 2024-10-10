import { Suspense } from "react";
import TransactionDashboard from "@/components/transactions/transactions-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Personal Finance Dashboard</h1>
      <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
        <TransactionDashboard />
      </Suspense>
    </div>
  );
}
