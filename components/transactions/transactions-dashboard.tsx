"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { Transaction, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import {
  getTransactions,
  deleteTransactions,
} from "@/app/actions/transactions-actions";
import AddTransactionDialog from "./transactions-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface TransactionDashboardProps {
  initialTransactions: Transaction[];
}

export default function TransactionDashboard({
  initialTransactions,
}: TransactionDashboardProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [selectedRows, setSelectedRows] = useState<Transaction[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchTransactions = useCallback(async () => {
    try {
      const fetchedTransactions = await getTransactions();
      setTransactions(fetchedTransactions);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchTransactions, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [fetchTransactions]);

  const handleDeleteSelected = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = useCallback(async () => {
    try {
      await deleteTransactions(selectedRows.map((row) => row.id));
      setTransactions((prevTransactions) =>
        prevTransactions.filter((t) => !selectedRows.includes(t))
      );
      setSelectedRows([]);
      toast({
        title: "Success",
        description: "Selected transactions have been deleted.",
      });
    } catch (error) {
      console.error("Failed to delete transactions:", error);
      toast({
        title: "Error",
        description: "Failed to delete transactions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  }, [selectedRows, toast]);

  const handleRowsSelected = useCallback((rows: Transaction[]) => {
    setSelectedRows(rows);
  }, []);

  const handleTransactionAdded = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Transactions</h2>
        <div className="space-x-2">
          <Button
            onClick={handleDeleteSelected}
            variant="destructive"
            disabled={selectedRows.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={transactions}
        onRowsSelected={handleRowsSelected}
      />
      <AddTransactionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onTransactionAdded={handleTransactionAdded}
      />
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected
              {selectedRows.length === 1
                ? " transaction"
                : ` ${selectedRows.length} transactions`}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
