import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CurrencySelect } from "./currency-select";
import { AccountTypeSelect } from "@/components/settings/account-type-select";
import {
  getAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  Account,
} from "@/app/actions/account-actions";
import { getCurrencies, Currency } from "@/app/actions/currency-actions";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { AccountType } from "@/db/schema";

export default function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [newAccount, setNewAccount] = useState<Omit<Account, "id">>({
    name: "",
    type: "debit",
    currencyIds: [],
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchAccounts();
    fetchCurrencies();
  }, []);

  const fetchAccounts = async () => {
    try {
      const fetchedAccounts = await getAccounts();
      setAccounts(fetchedAccounts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load accounts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchCurrencies = async () => {
    try {
      const fetchedCurrencies = await getCurrencies();
      setCurrencies(fetchedCurrencies);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load currencies. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddAccount = async () => {
    setErrors({});
    try {
      if (!newAccount.name.trim()) {
        setErrors({ name: "Account name cannot be empty" });
        return;
      }
      if (newAccount.currencyIds.length === 0) {
        setErrors({ currencies: "Please select at least one currency" });
        return;
      }
      const addedAccount = await addAccount(newAccount);
      setAccounts([...accounts, addedAccount]);
      setNewAccount({ name: "", type: "debit", currencyIds: [] });
      toast({
        title: "Success",
        description: "Account added successfully.",
      });
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ add: error.message });
      }
    }
  };

  const handleUpdateAccount = async (account: Account) => {
    setErrors({});
    try {
      if (!account.name.trim()) {
        setErrors({ [account.id]: "Account name cannot be empty" });
        return;
      }
      if (account.currencyIds.length === 0) {
        setErrors({ [account.id]: "Please select at least one currency" });
        return;
      }
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
      if (error instanceof Error) {
        setErrors({ [account.id]: error.message });
      }
    }
  };

  const handleDeleteAccount = (id: string) => {
    setAccountToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (accountToDelete) {
      try {
        await deleteAccount(accountToDelete);
        setAccounts(accounts.filter((a) => a.id !== accountToDelete));
        toast({
          title: "Success",
          description: "Account deleted successfully.",
        });
      } catch (error) {
        console.log(error);
        toast({
          title: "Error",
          description: "Failed to delete account. Please try again.",
          variant: "destructive",
        });
      }
    }
    setDeleteConfirmOpen(false);
    setAccountToDelete(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Input
              placeholder="New account name"
              value={newAccount.name}
              onChange={(e) =>
                setNewAccount({ ...newAccount, name: e.target.value })
              }
              className={errors.name ? "border-red-500" : ""}
            />
            <AccountTypeSelect
              value={newAccount.type as AccountType}
              onValueChange={(value: AccountType) =>
                setNewAccount({ ...newAccount, type: value })
              }
              className="w-full"
            />
            <div className="w-full">
              <CurrencySelect
                currencies={currencies}
                selectedCurrencies={newAccount.currencyIds}
                onChange={(selected) =>
                  setNewAccount({ ...newAccount, currencyIds: selected })
                }
              />
            </div>
            <Button onClick={handleAddAccount} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Account
            </Button>
          </div>
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          {errors.currencies && (
            <p className="text-red-500 text-sm">{errors.currencies}</p>
          )}
          {errors.add && <p className="text-red-500 text-sm">{errors.add}</p>}
          {accounts.map((account) => (
            <div
              key={account.id}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center mb-4"
            >
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
                    className={errors[account.id] ? "border-red-500" : ""}
                  />
                  <AccountTypeSelect
                    value={account.type as AccountType}
                    onValueChange={(value: AccountType) =>
                      setAccounts(
                        accounts.map((a) =>
                          a.id === account.id ? { ...a, type: value } : a
                        )
                      )
                    }
                    className="w-full"
                  />
                  <div className="w-full">
                    <CurrencySelect
                      currencies={currencies}
                      selectedCurrencies={account.currencyIds}
                      onChange={(selected) =>
                        setAccounts(
                          accounts.map((a) =>
                            a.id === account.id
                              ? { ...a, currencyIds: selected }
                              : a
                          )
                        )
                      }
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleUpdateAccount(account)}
                      className="flex-1"
                    >
                      <Save className="mr-2 h-4 w-4" /> Save
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setEditingAccount(null)}
                      className="flex-1"
                    >
                      <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <span className="sm:col-span-3">
                    {account.name} ({account.type}) - Currencies:{" "}
                    {account.currencyIds
                      .map((id) => currencies.find((c) => c.id === id)?.code)
                      .join(", ")}
                  </span>
                  <div className="flex justify-end space-x-2">
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
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <DeleteConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Account"
        description="Are you sure you want to delete this account? This action cannot be undone."
      />
    </Card>
  );
}
