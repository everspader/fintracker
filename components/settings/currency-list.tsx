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
} from "@/app/actions/currency-actions";

interface Currency {
  id: string;
  code: string;
  name: string;
}

export default function CurrencyList() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [editingCurrency, setEditingCurrency] = useState<string | null>(null);
  const [newCurrency, setNewCurrency] = useState({ code: "", name: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrencies();
  }, []);

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

  const handleAddCurrency = async () => {
    try {
      const addedCurrency = await addCurrency(newCurrency);
      setCurrencies([...currencies, addedCurrency]);
      setNewCurrency({ code: "", name: "" });
      toast({
        title: "Success",
        description: "Currency added successfully.",
      });
    } catch (error) {
      console.error("Failed to add currency:", error);
      toast({
        title: "Error",
        description: "Failed to add currency. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCurrency = async (currency: Currency) => {
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
      console.error("Failed to update currency:", error);
      toast({
        title: "Error",
        description: "Failed to update currency. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCurrency = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this currency?")) {
      try {
        await deleteCurrency(id);
        setCurrencies(currencies.filter((c) => c.id !== id));
        toast({
          title: "Success",
          description: "Currency deleted successfully.",
        });
      } catch (error) {
        console.error("Failed to delete currency:", error);
        toast({
          title: "Error",
          description: "Failed to delete currency. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Currencies</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Currency code"
              value={newCurrency.code}
              onChange={(e) =>
                setNewCurrency({ ...newCurrency, code: e.target.value })
              }
            />
            <Input
              placeholder="Currency name"
              value={newCurrency.name}
              onChange={(e) =>
                setNewCurrency({ ...newCurrency, name: e.target.value })
              }
            />
            <Button onClick={handleAddCurrency}>
              <Plus className="mr-2 h-4 w-4" /> Add Currency
            </Button>
          </div>
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
    </Card>
  );
}
