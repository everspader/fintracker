import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  addAccount,
  updateAccount,
  getAccountTransactionCount,
  deleteAccount,
  Account,
} from "@/app/actions/account-actions";
import { Currency } from "@/app/actions/currency-actions";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccountType, accountTypeEnum } from "@/db/schema";
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
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [newAccount, setNewAccount] = useState<Omit<Account, "id">>({
    name: "",
    type: "debit",
    currencyIds: [],
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<{
    id: string;
    transactionCount: number;
  } | null>(null);
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

  const handleDeleteAccount = async (id: string) => {
    const transactionCount = await getAccountTransactionCount(id);
    setAccountToDelete({ id, transactionCount });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async (action: "cancel" | "deleteAll") => {
    if (action === "cancel") {
      setDeleteConfirmOpen(false);
      setAccountToDelete(null);
      return;
    }
    if (accountToDelete) {
      try {
        await deleteAccount(accountToDelete.id);
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
        <Select
          value={newAccount.type as AccountType}
          onValueChange={(value: AccountType) =>
            setNewAccount({ ...newAccount, type: value })
          }
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Account type" />
          </SelectTrigger>
          <SelectContent>
            {accountTypeEnum.enumValues.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              {editingAccount?.id === account.id ? (
                <>
                  <Input
                    value={editingAccount.name}
                    onChange={(e) =>
                      setEditingAccount({
                        ...editingAccount,
                        name: e.target.value,
                      })
                    }
                    className={`col-span-4 ${
                      errors[account.id] ? "border-red-500" : ""
                    }`}
                  />
                  <Select
                    value={editingAccount.type as AccountType}
                    onValueChange={(value: AccountType) =>
                      setEditingAccount({ ...editingAccount, type: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Account type" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypeEnum.enumValues.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <CurrencySelect
                    currencies={currencies}
                    selectedCurrencies={editingAccount.currencyIds}
                    onChange={(selected) =>
                      setEditingAccount({
                        ...editingAccount,
                        currencyIds: selected,
                      })
                    }
                    className={`col-span-3 ${
                      errors[account.id] ? "border-red-500" : ""
                    }`}
                  />
                  <Button
                    onClick={() => handleUpdateAccount(editingAccount)}
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
                    onClick={() => setEditingAccount(account)}
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
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              {accountToDelete && accountToDelete.transactionCount > 0 ? (
                <>
                  This account has {accountToDelete.transactionCount}{" "}
                  transaction{accountToDelete.transactionCount > 1 ? "s" : ""}{" "}
                  associated with it. Deleting this account will also delete all
                  associated transactions. Are you sure you want to proceed?
                </>
              ) : (
                "Are you sure you want to delete this account? This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => confirmDelete("cancel")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDelete("deleteAll")}>
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface CurrencySelectProps {
  currencies: Currency[];
  selectedCurrencies: string[];
  onChange: (selected: string[]) => void;
  className?: string; // Add this line to accept className prop
}

export function CurrencySelect({
  currencies,
  selectedCurrencies,
  onChange,
  className = "", // Add default value for className
}: CurrencySelectProps) {
  const [open, setOpen] = useState(false);

  const handleCheckedChange = useCallback(
    (currencyId: string, checked: boolean) => {
      if (checked) {
        onChange([...selectedCurrencies, currencyId]);
      } else {
        onChange(selectedCurrencies.filter((id) => id !== currencyId));
      }
    },
    [selectedCurrencies, onChange]
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-between ${className}`}
        >
          <span className="truncate">
            {selectedCurrencies.length > 0
              ? `${selectedCurrencies.length} currenc${
                  selectedCurrencies.length > 1 ? "ies" : "y"
                } selected`
              : "Select currencies"}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[200px]"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        {currencies.map((currency) => (
          <DropdownMenuCheckboxItem
            key={currency.id}
            checked={selectedCurrencies.includes(currency.id)}
            onCheckedChange={(checked) =>
              handleCheckedChange(currency.id, checked)
            }
            onSelect={(event) => event.preventDefault()}
          >
            {currency.code}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
