"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import GroupList from "@/components/settings/group-list";
import AccountList from "@/components/settings/account-list";
import CurrencyList from "@/components/settings/currency-list";
import { useToast } from "@/hooks/use-toast";
import { Group, getGroups } from "@/app/actions/group-actions";
import { Account, getAccounts } from "@/app/actions/account-actions";
import { Currency, getCurrencies } from "@/app/actions/currency-actions";

interface SettingsDashboardProps {
  initialGroups: Group[];
  initialAccounts: Account[];
  initialCurrencies: Currency[];
}

export default function SettingsDashboard({
  initialGroups,
  initialAccounts,
  initialCurrencies,
}: SettingsDashboardProps) {
  const [activeTab, setActiveTab] = useState("groups");
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [currencies, setCurrencies] = useState<Currency[]>(initialCurrencies);
  const { toast } = useToast();

  useEffect(() => {
    const refreshData = async () => {
      try {
        const [updatedGroups, updatedAccounts, updatedCurrencies] =
          await Promise.all([getGroups(), getAccounts(), getCurrencies()]);
        setGroups(updatedGroups);
        setAccounts(updatedAccounts);
        setCurrencies(updatedCurrencies);
      } catch (error) {
        console.error("Failed to refresh data:", error);
        toast({
          title: "Error",
          description: "Failed to refresh data. Please try again.",
          variant: "destructive",
        });
      }
    };

    // Refresh data every 5 minutes
    const intervalId = setInterval(refreshData, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [toast]);

  const handleDataChange = async (
    type: "groups" | "accounts" | "currencies"
  ) => {
    try {
      let updatedData;
      switch (type) {
        case "groups":
          updatedData = await getGroups();
          setGroups(updatedData);
          break;
        case "accounts":
          updatedData = await getAccounts();
          setAccounts(updatedData);
          break;
        case "currencies":
          updatedData = await getCurrencies();
          setCurrencies(updatedData);
          break;
      }
    } catch (error) {
      console.error(`Failed to update ${type}:`, error);
      toast({
        title: "Error",
        description: `Failed to update ${type}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
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
            <GroupList
              groups={groups}
              onDataChange={() => handleDataChange("groups")}
            />
          </TabsContent>
          <TabsContent value="accounts" className="space-y-4">
            <AccountList
              accounts={accounts}
              currencies={currencies}
              onDataChange={() => handleDataChange("accounts")}
            />
          </TabsContent>
          <TabsContent value="currencies" className="space-y-4">
            <CurrencyList
              currencies={currencies}
              onDataChange={() => handleDataChange("currencies")}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
