"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
// import AddTransactionDialog from '@/components/AddTransactionDialog';
import { Transaction, columns } from "@/components/transactions/columns";
import { DataTable } from "@/components/ui/data-table";

export default function TransactionDashboard() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Mock data for demonstration
  const transactions: Transaction[] = [
    {
      id: "1",
      entryDate: "2023-04-15",
      entryType: "expense",
      group: "Food",
      category: "Groceries",
      account: "Main Debit",
      currency: "USD",
      amount: 75.5,
      description: "Weekly grocery shopping",
      tags: ["essentials", "food"],
    },
    // Add more mock transactions here
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Transactions</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
        </Button>
      </div>
      <DataTable columns={columns} data={transactions} />
      {/* <AddTransactionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      /> */}
    </div>
  );
}
