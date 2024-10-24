"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from "react";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { addTransaction } from "@/app/actions/transactions-actions";
import { getAccounts } from "@/app/actions/account-actions";
import { getCategories } from "@/app/actions/group-actions";
import { getCurrencies } from "@/app/actions/currency-actions";
import { getGroups } from "@/app/actions/group-actions";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  entryDate: z.string(),
  type: z.enum(["income", "expense"]),
  groupId: z.string(),
  categoryId: z.string(),
  accountId: z.string(),
  currencyId: z.string(),
  amount: z.number().positive(),
  description: z.string(),
});

type Group = { id: string; name: string };
type Category = { id: string; name: string; groupId: string };
type Account = {
  id: string;
  name: string;
  type: string;
  currencyIds: string[];
};
type Currency = { id: string; code: string; name: string };

export default function AddTransactionDialog({
  open,
  onOpenChange,
  onTransactionAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransactionAdded: () => void;
}) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [filteredCurrencies, setFilteredCurrencies] = useState<Currency[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entryDate: new Date().toISOString().split("T")[0],
      type: "expense",
      groupId: "",
      categoryId: "",
      accountId: "",
      currencyId: "",
      amount: 0,
      description: "",
    },
  });

  const resetForm = () => {
    form.reset({
      entryDate: new Date().toISOString().split("T")[0],
      type: "expense",
      groupId: "",
      categoryId: "",
      accountId: "",
      currencyId: "",
      amount: 0,
      description: "",
    });
    setFilteredCategories([]);
    setFilteredCurrencies([]);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [groupsData, categoriesData, accountsData, currenciesData] =
          await Promise.all([
            getGroups(),
            getCategories(),
            getAccounts(),
            getCurrencies(),
          ]);
        setGroups(groupsData);
        setCategories(categoriesData);
        setAccounts(accountsData);
        setCurrencies(currenciesData);
      } catch (error) {
        console.error("Failed to fetch form data:", error);
        toast({
          title: "Error",
          description: "Failed to load form data. Please try again.",
          variant: "destructive",
        });
      }
    }
    fetchData();
  }, [toast]);

  useEffect(() => {
    const selectedGroup = form.watch("groupId");
    setFilteredCategories(
      categories.filter((category) => category.groupId === selectedGroup)
    );
    form.setValue("categoryId", "");
  }, [form.watch("groupId"), categories, form]);

  useEffect(() => {
    const selectedAccount = form.watch("accountId");
    const account = accounts.find((acc) => acc.id === selectedAccount);
    if (account) {
      setFilteredCurrencies(
        currencies.filter((currency) =>
          account.currencyIds.includes(currency.id)
        )
      );
    } else {
      setFilteredCurrencies([]);
    }
    form.setValue("currencyId", "");
  }, [form.watch("accountId"), accounts, currencies, form]);

  async function onSubmit(
    values: z.infer<typeof formSchema>,
    addAnother: boolean
  ) {
    try {
      const transactionData = {
        entryDate: values.entryDate,
        type: values.type as "income" | "expense",
        categoryId: values.categoryId,
        accountId: values.accountId,
        currencyId: values.currencyId,
        amount:
          values.type === "expense"
            ? -Math.abs(values.amount)
            : Math.abs(values.amount),
        description: values.description,
        groupId: values.groupId,
      };
      await addTransaction(transactionData);
      toast({
        title: "Success",
        description: "Transaction added successfully.",
      });
      onTransactionAdded();
      if (addAnother) {
        resetForm();
      } else {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to add transaction:", error);
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Enter the details of your new transaction here.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => onSubmit(values, false))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="entryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transaction type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!form.watch("groupId")}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currencyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!form.watch("accountId")}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCurrencies.map((currency) => (
                        <SelectItem key={currency.id} value={currency.id}>
                          {currency.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  form.handleSubmit((values) => onSubmit(values, true))()
                }
              >
                Save and Add Another
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
