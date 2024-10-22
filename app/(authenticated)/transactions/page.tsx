import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import TransactionDashboard from "@/components/transactions/transactions-dashboard";
import { getTransactions } from "@/app/actions/transactions-actions";

export default async function TransactionsPage() {
  const initialTransactions = await getTransactions();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
      </div>
      <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
        <TransactionDashboard initialTransactions={initialTransactions} />
      </Suspense>
    </div>
  );
}
