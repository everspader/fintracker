import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CurrencySelect } from "./currency-select";
import { AccountTypeSelect } from "@/components/settings/account-type-select";
import {
  addAccount,
  updateAccount,
  deleteAccount,
  Account,
} from "@/app/actions/account-actions";
import { Currency } from "@/app/actions/currency-actions";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { AccountType } from "@/db/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface AccountListProps {
  accounts: Account[];
  currencies: Currency[];
  onDataChange: () => Promise<void>;
}

export default function AccountList({
  accounts,
  currencies,
  onDataChange,
}: AccountListProps) {
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
      await addAccount(newAccount);
      setNewAccount({ name: "", type: "debit", currencyIds: [] });
      toast({
        title: "Success",
        description: "Account added successfully.",
      });
      await onDataChange();
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
      await updateAccount(account);
      setEditingAccount(null);
      toast({
        title: "Success",
        description: "Account updated successfully.",
      });
      await onDataChange();
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
        toast({
          title: "Success",
          description: "Account deleted successfully.",
        });
        await onDataChange();
      } catch (error) {
        console.error(error);
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
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        <Input
          placeholder="New account name"
          value={newAccount.name}
          onChange={(e) =>
            setNewAccount({ ...newAccount, name: e.target.value })
          }
          className={`col-span-4 ${errors.name ? "border-red-500" : ""}`}
        />
        <AccountTypeSelect
          value={newAccount.type as AccountType}
          onValueChange={(value: AccountType) =>
            setNewAccount({ ...newAccount, type: value })
          }
          className="col-span-3"
        />
        <CurrencySelect
          currencies={currencies}
          selectedCurrencies={newAccount.currencyIds}
          onChange={(selected) =>
            setNewAccount({ ...newAccount, currencyIds: selected })
          }
          className={`col-span-3 ${errors.currencies ? "border-red-500" : ""}`}
        />
        <Button onClick={handleAddAccount} className="col-span-2">
          <Plus className="mr-2 h-4 w-4" /> Add Account
        </Button>
      </div>
      {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      {errors.currencies && (
        <p className="text-red-500 text-sm">{errors.currencies}</p>
      )}
      {errors.add && <p className="text-red-500 text-sm">{errors.add}</p>}
      <ScrollArea className="h-[400px] w-full">
        <div className="space-y-2">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="grid grid-cols-12 items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {editingAccount === account.id ? (
                <>
                  <Input
                    value={account.name}
                    onChange={(e) => (account.name = e.target.value)}
                    className={`col-span-4 ${
                      errors[account.id] ? "border-red-500" : ""
                    }`}
                  />
                  <AccountTypeSelect
                    value={account.type as AccountType}
                    onValueChange={(value: AccountType) =>
                      (account.type = value)
                    }
                    className="col-span-3"
                  />
                  <CurrencySelect
                    currencies={currencies}
                    selectedCurrencies={account.currencyIds}
                    onChange={(selected) => (account.currencyIds = selected)}
                    className={`col-span-3 ${
                      errors[account.id] ? "border-red-500" : ""
                    }`}
                  />
                  <Button
                    onClick={() => handleUpdateAccount(account)}
                    size="sm"
                    className="col-span-1"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingAccount(null)}
                    size="sm"
                    className="col-span-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="font-medium col-span-4 pl-4">
                    {account.name}
                  </span>
                  <Badge variant="secondary" className="col-span-3">
                    {account.type}
                  </Badge>
                  <div className="col-span-3 flex flex-wrap gap-2">
                    {account.currencyIds.map((id) => (
                      <Badge key={id} variant="outline">
                        {currencies.find((c) => c.id === id)?.code}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingAccount(account.id)}
                    className="col-span-1"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAccount(account.id)}
                    className="col-span-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <DeleteConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Account"
        description="Are you sure you want to delete this account? This action cannot be undone."
      />
    </div>
  );
}
