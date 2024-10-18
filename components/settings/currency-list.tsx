import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  addCurrency,
  updateCurrency,
  deleteCurrency,
  Currency,
} from "@/app/actions/currency-actions";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CurrencyListProps {
  currencies: Currency[];
  onDataChange: () => Promise<void>;
}

export default function CurrencyList({
  currencies,
  onDataChange,
}: CurrencyListProps) {
  const [editingCurrency, setEditingCurrency] = useState<string | null>(null);
  const [newCurrency, setNewCurrency] = useState({ code: "", name: "" });
  const [updatedCurrency, setUpdatedCurrency] = useState<Currency | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currencyToDelete, setCurrencyToDelete] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  const handleAddCurrency = async () => {
    setErrors({});
    try {
      if (!newCurrency.code.trim()) {
        setErrors({ code: "Currency code cannot be empty" });
        return;
      }
      await addCurrency(newCurrency);
      setNewCurrency({ code: "", name: "" });
      toast({
        title: "Success",
        description: "Currency added successfully.",
      });
      await onDataChange();
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ add: error.message });
      }
    }
  };

  const handleEditCurrency = (currency: Currency) => {
    setEditingCurrency(currency.id);
    setUpdatedCurrency(currency);
  };

  const handleUpdateCurrency = async (currency: Currency) => {
    setErrors({});
    try {
      if (!currency.code.trim()) {
        setErrors({ [currency.id]: "Currency code cannot be empty" });
        return;
      }
      await updateCurrency(currency);
      setEditingCurrency(null);
      setUpdatedCurrency(null);
      toast({
        title: "Success",
        description: "Currency updated successfully.",
      });
      await onDataChange();
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ [currency.id]: error.message });
      }
    }
  };

  const handleDeleteCurrency = (id: string) => {
    setCurrencyToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (currencyToDelete) {
      try {
        await deleteCurrency(currencyToDelete);
        toast({
          title: "Success",
          description: "Currency deleted successfully.",
        });
        await onDataChange();
      } catch (error) {
        console.error("Failed to delete currency:", error);
        toast({
          title: "Error",
          description: "Failed to delete currency. Please try again.",
          variant: "destructive",
        });
      }
    }
    setDeleteConfirmOpen(false);
    setCurrencyToDelete(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        <Input
          placeholder="Currency code"
          value={newCurrency.code}
          onChange={(e) =>
            setNewCurrency({ ...newCurrency, code: e.target.value })
          }
          className={`col-span-3 ${errors.code ? "border-red-500" : ""}`}
        />
        <Input
          placeholder="Currency name"
          value={newCurrency.name}
          onChange={(e) =>
            setNewCurrency({ ...newCurrency, name: e.target.value })
          }
          className={`col-span-7 ${errors.name ? "border-red-500" : ""}`}
        />
        <Button onClick={handleAddCurrency} className="col-span-2">
          <Plus className="mr-2 h-4 w-4" /> Add Currency
        </Button>
      </div>
      {errors.code && <p className="text-red-500 text-sm">{errors.code}</p>}
      {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      {errors.add && <p className="text-red-500 text-sm">{errors.add}</p>}
      <ScrollArea className="h-[400px] w-full">
        <div className="space-y-2">
          {currencies.map((currency) => (
            <div
              key={currency.id}
              className="grid grid-cols-12 items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {editingCurrency === currency.id ? (
                <>
                  <Input
                    value={updatedCurrency?.code}
                    onChange={(e) =>
                      setUpdatedCurrency({
                        ...updatedCurrency!,
                        code: e.target.value,
                      })
                    }
                    className={`col-span-3 ${
                      errors[currency.id] ? "border-red-500" : ""
                    }`}
                  />
                  <Input
                    value={updatedCurrency?.name}
                    onChange={(e) =>
                      setUpdatedCurrency({
                        ...updatedCurrency!,
                        name: e.target.value,
                      })
                    }
                    className={`col-span-7 ${
                      errors[currency.id] ? "border-red-500" : ""
                    }`}
                  />
                  <Button
                    onClick={() => handleUpdateCurrency(updatedCurrency!)}
                    size="sm"
                    className="col-span-1"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingCurrency(null);
                      setUpdatedCurrency(null);
                    }}
                    size="sm"
                    className="col-span-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="font-medium col-span-3 pl-4">
                    {currency.code}
                  </span>
                  <span className="col-span-7">{currency.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCurrency(currency)}
                    className="col-span-1"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCurrency(currency.id)}
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
        title="Delete Currency"
        description="Are you sure you want to delete this currency? This action cannot be undone."
      />
    </div>
  );
}
