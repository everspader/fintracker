"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GroupList from "@/components/settings/group-list";
import AccountList from "@/components/settings/account-list";
import CurrencyList from "@/components/settings/currency-list";
import { getAccounts, Account } from "@/app/actions/account-actions";
import { getCurrencies, Currency } from "@/app/actions/currency-actions";
import { getGroups, Group } from "@/app/actions/group-actions";
import { useToast } from "@/hooks/use-toast";

export default function SettingsDashboard() {
  const [activeTab, setActiveTab] = useState("groups");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fetchedAccounts, fetchedCurrencies, fetchedGroups] =
        await Promise.all([getAccounts(), getCurrencies(), getGroups()]);
      setAccounts(fetchedAccounts);
      setCurrencies(fetchedCurrencies);
      setGroups(fetchedGroups);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load settings data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Settings</CardTitle>
          <p className="text-muted-foreground">
            Manage your groups, accounts, and currencies
          </p>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="groups">Groups & Categories</TabsTrigger>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="currencies">Currencies</TabsTrigger>
            </TabsList>
            <TabsContent value="groups" className="space-y-4">
              <GroupList groups={groups} onDataChange={fetchData} />
            </TabsContent>
            <TabsContent value="accounts" className="space-y-4">
              <AccountList
                accounts={accounts}
                currencies={currencies}
                onDataChange={fetchData}
              />
            </TabsContent>
            <TabsContent value="currencies" className="space-y-4">
              <CurrencyList currencies={currencies} onDataChange={fetchData} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
