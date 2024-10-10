"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { Transaction, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { getTransactions } from "@/app/actions/transactions-actions";
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

export default function TransactionDashboard() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<Transaction[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const handleDeleteSelected = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = useCallback(() => {
    setTransactions((prevTransactions) =>
      prevTransactions.filter((t) => !selectedRows.includes(t))
    );
    setSelectedRows([]);
    setIsDeleteDialogOpen(false);
  }, [selectedRows]);

  const handleRowsSelected = useCallback((rows: Transaction[]) => {
    setSelectedRows(rows);
  }, []);

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
      {isLoading ? (
        <div>Loading transactions...</div>
      ) : (
        <DataTable
          columns={columns}
          data={transactions}
          onRowsSelected={handleRowsSelected}
        />
      )}
      <AddTransactionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
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
