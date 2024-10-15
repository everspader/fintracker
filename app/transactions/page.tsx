import { Suspense } from "react";
import TransactionDashboard from "@/components/transactions/transactions-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { getTransactions } from "@/app/actions/transactions-actions";

export default async function Home() {
  const initialTransactions = await getTransactions();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Transactions</h1>
      <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
        <TransactionDashboard initialTransactions={initialTransactions} />
      </Suspense>
    </div>
  );
}
