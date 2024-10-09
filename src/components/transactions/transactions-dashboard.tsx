"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Transaction, columns } from "@/components/transactions/columns";
import { DataTable } from "@/components/ui/data-table";
import { getTransactions } from "@/app/actions/transactions-actions";

export default function TransactionDashboard() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      setIsLoading(true);
      try {
        const fetchedTransactions = await getTransactions();
        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        // Optionally, set an error state here to display to the user
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Transactions</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
        </Button>
      </div>
      {isLoading ? (
        <div>Loading transactions...</div>
      ) : (
        <DataTable columns={columns} data={transactions} />
      )}
      {/* <AddTransactionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      /> */}
    </div>
  );
}
