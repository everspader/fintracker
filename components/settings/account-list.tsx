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
import { Checkbox } from "../ui/checkbox";
import {
  getAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  Account,
} from "@/app/actions/account-actions";
import { getCurrencies, Currency } from "@/app/actions/currency-actions";

export default function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [newAccount, setNewAccount] = useState<Omit<Account, "id">>({
    name: "",
    type: "debit",
    currencyIds: [],
  });
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
      console.error("Failed to fetch accounts:", error);
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
      console.error("Failed to fetch currencies:", error);
      toast({
        title: "Error",
        description: "Failed to load currencies. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddAccount = async () => {
    try {
      const addedAccount = await addAccount(newAccount);
      setAccounts([...accounts, addedAccount]);
      setNewAccount({ name: "", type: "debit", currencyIds: [] });
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

  const handleCurrencyChange = (
    accountId: string,
    currencyId: string,
    checked: boolean
  ) => {
    setAccounts(
      accounts.map((account) => {
        if (account.id === accountId) {
          const updatedCurrencyIds = checked
            ? [...account.currencyIds, currencyId]
            : account.currencyIds.filter((id) => id !== currencyId);
          return { ...account, currencyIds: updatedCurrencyIds };
        }
        return account;
      })
    );
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
            <div className="flex flex-col space-y-2">
              {currencies.map((currency) => (
                <div key={currency.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`new-account-currency-${currency.id}`}
                    checked={newAccount.currencyIds.includes(currency.id)}
                    onCheckedChange={(checked) => {
                      setNewAccount({
                        ...newAccount,
                        currencyIds: checked
                          ? [...newAccount.currencyIds, currency.id]
                          : newAccount.currencyIds.filter(
                              (id) => id !== currency.id
                            ),
                      });
                    }}
                  />
                  <label htmlFor={`new-account-currency-${currency.id}`}>
                    {currency.code}
                  </label>
                </div>
              ))}
            </div>
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
                  <div className="flex flex-col space-y-2">
                    {currencies.map((currency) => (
                      <div
                        key={currency.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`account-${account.id}-currency-${currency.id}`}
                          checked={account.currencyIds.includes(currency.id)}
                          onCheckedChange={(checked) =>
                            handleCurrencyChange(
                              account.id,
                              currency.id,
                              checked as boolean
                            )
                          }
                        />
                        <label
                          htmlFor={`account-${account.id}-currency-${currency.id}`}
                        >
                          {currency.code}
                        </label>
                      </div>
                    ))}
                  </div>
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
                    {account.name} ({account.type}) - Currencies:{" "}
                    {account.currencyIds
                      .map((id) => currencies.find((c) => c.id === id)?.code)
                      .join(", ")}
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
