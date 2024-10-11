"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Account {
  id: string;
  name: string;
  type: "credit" | "debit" | "investment";
}

// Mock functions for account actions (replace with actual API calls)
const getAccounts = async (): Promise<Account[]> => {
  // Implement API call to fetch accounts
  return [];
};

const addAccount = async (account: Omit<Account, "id">): Promise<Account> => {
  // Implement API call to add account
  return { id: "new-id", ...account };
};

const updateAccount = async (account: Account): Promise<Account> => {
  // Implement API call to update account
  return account;
};

const deleteAccount = async (id: string): Promise<void> => {
  // Implement API call to delete account
};

export default function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "debit" as const,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const fetchedAccounts = await getAccounts();
      setAccounts(fetchedAccounts);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      toast({
        title: "Error",
        description: "Failed to load accounts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddAccount = async () => {
    try {
      const addedAccount = await addAccount(newAccount);
      setAccounts([...accounts, addedAccount]);
      setNewAccount({ name: "", type: "debit" });
      toast({
        title: "Success",
        description: "Account added successfully.",
      });
    } catch (error) {
      console.error("Failed to add account:", error);
      toast({
        title: "Error",
        description: "Failed to add account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAccount = async (account: Account) => {
    try {
      const updatedAccount = await updateAccount(account);
      setAccounts(
        accounts.map((a) => (a.id === account.id ? updatedAccount : a))
      );
      setEditingAccount(null);
      toast({
        title: "Success",
        description: "Account updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update account:", error);
      toast({
        title: "Error",
        description: "Failed to update account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      try {
        await deleteAccount(id);
        setAccounts(accounts.filter((a) => a.id !== id));
        toast({
          title: "Success",
          description: "Account deleted successfully.",
        });
      } catch (error) {
        console.error("Failed to delete account:", error);
        toast({
          title: "Error",
          description: "Failed to delete account. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="New account name"
              value={newAccount.name}
              onChange={(e) =>
                setNewAccount({ ...newAccount, name: e.target.value })
              }
            />
            <Select
              value={newAccount.type}
              onValueChange={(value: "credit" | "debit" | "investment") =>
                setNewAccount({ ...newAccount, type: value })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddAccount}>
              <Plus className="mr-2 h-4 w-4" /> Add Account
            </Button>
          </div>
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center space-x-2">
              {editingAccount === account.id ? (
                <>
                  <Input
                    value={account.name}
                    onChange={(e) =>
                      setAccounts(
                        accounts.map((a) =>
                          a.id === account.id
                            ? { ...a, name: e.target.value }
                            : a
                        )
                      )
                    }
                  />
                  <Select
                    value={account.type}
                    onValueChange={(value: "credit" | "debit" | "investment") =>
                      setAccounts(
                        accounts.map((a) =>
                          a.id === account.id ? { ...a, type: value } : a
                        )
                      )
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">Credit</SelectItem>
                      <SelectItem value="debit">Debit</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => handleUpdateAccount(account)}>
                    <Save className="mr-2 h-4 w-4" /> Save
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setEditingAccount(null)}
                  >
                    <X className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-grow">
                    {account.name} ({account.type})
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => setEditingAccount(account.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDeleteAccount(account.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
