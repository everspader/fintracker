"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getCurrencies,
  addCurrency,
  updateCurrency,
  deleteCurrency,
  Currency,
} from "@/app/actions/currency-actions";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

interface CurrencyListProps {
  currencies: Currency[];
  onDataChange: () => Promise<void>;
}

export default function CurrencyList({
  currencies: initialCurrencies,
  onDataChange,
}: CurrencyListProps) {
  const [currencies, setCurrencies] = useState<Currency[]>(initialCurrencies);
  const [editingCurrency, setEditingCurrency] = useState<string | null>(null);
  const [newCurrency, setNewCurrency] = useState({ code: "", name: "" });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currencyToDelete, setCurrencyToDelete] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrencies();
  }, []);

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

  const handleAddCurrency = async () => {
    setErrors({});
    try {
      const addedCurrency = await addCurrency(newCurrency);
      setCurrencies([...currencies, addedCurrency]);
      setNewCurrency({ code: "", name: "" });
      toast({
        title: "Success",
        description: "Currency added successfully.",
      });
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ add: error.message });
      }
    }
    await onDataChange();
  };

  const handleUpdateCurrency = async (currency: Currency) => {
    setErrors({});
    try {
      const updatedCurrency = await updateCurrency(currency);
      setCurrencies(
        currencies.map((c) => (c.id === currency.id ? updatedCurrency : c))
      );
      setEditingCurrency(null);
      toast({
        title: "Success",
        description: "Currency updated successfully.",
      });
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ [currency.id]: error.message });
      }
    }
    await onDataChange();
  };

  const handleDeleteCurrency = async (id: string) => {
    setCurrencyToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (currencyToDelete) {
      try {
        await deleteCurrency(currencyToDelete);
        setCurrencies(currencies.filter((c) => c.id !== currencyToDelete));
        toast({
          title: "Success",
          description: "Currency deleted successfully.",
        });
      } catch (error) {
        console.error("Failed to delete currency:", error);
        toast({
          title: "Error",
          description: `Failed to delete currency. ${error}`,
          variant: "destructive",
        });
      }
    }
    setDeleteConfirmOpen(false);
    setCurrencyToDelete(null);
    await onDataChange();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Currencies</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Currency code"
                value={newCurrency.code}
                onChange={(e) =>
                  setNewCurrency({ ...newCurrency, code: e.target.value })
                }
                className={errors.add ? "border-red-500" : ""}
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Currency name"
                value={newCurrency.name}
                onChange={(e) =>
                  setNewCurrency({ ...newCurrency, name: e.target.value })
                }
              />
            </div>
            <Button onClick={handleAddCurrency}>
              <Plus className="mr-2 h-4 w-4" /> Add Currency
            </Button>
          </div>
          {errors.add && <p className="text-red-500 text-sm">{errors.add}</p>}
          {currencies.map((currency) => (
            <div key={currency.id} className="flex items-center space-x-2">
              {editingCurrency === currency.id ? (
                <>
                  <Input
                    value={currency.code}
                    onChange={(e) =>
                      setCurrencies(
                        currencies.map((c) =>
                          c.id === currency.id
                            ? { ...c, code: e.target.value }
                            : c
                        )
                      )
                    }
                    className={errors[currency.id] ? "border-red-500" : ""}
                  />
                  <Input
                    value={currency.name}
                    onChange={(e) =>
                      setCurrencies(
                        currencies.map((c) =>
                          c.id === currency.id
                            ? { ...c, name: e.target.value }
                            : c
                        )
                      )
                    }
                  />
                  <Button onClick={() => handleUpdateCurrency(currency)}>
                    <Save className="mr-2 h-4 w-4" /> Save
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setEditingCurrency(null)}
                  >
                    <X className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-grow">
                    {currency.code} - {currency.name}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => setEditingCurrency(currency.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDeleteCurrency(currency.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
        title="Delete Currency"
        description="Are you sure you want to delete this currency? This action cannot be undone."
      />
    </Card>
  );
}
