"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Wallet, Coins } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    const fetchData = async () => {
      const [updatedGroups, updatedAccounts, updatedCurrencies] =
        await Promise.all([getGroups(), getAccounts(), getCurrencies()]);
      setGroups(updatedGroups);
      setAccounts(updatedAccounts);
      setCurrencies(updatedCurrencies);
    };

    fetchData();
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

  const tabContent = [
    {
      id: "groups",
      title: "Groups & Categories",
      description: "Manage your expense groups and categories",
      icon: <Layers className="h-4 w-4" />,
      component: (
        <GroupList
          groups={groups}
          onDataChange={() => handleDataChange("groups")}
        />
      ),
    },
    {
      id: "accounts",
      title: "Accounts",
      description: "Manage your financial accounts",
      icon: <Wallet className="h-4 w-4" />,
      component: (
        <AccountList
          accounts={accounts}
          currencies={currencies}
          onDataChange={() => handleDataChange("accounts")}
        />
      ),
    },
    {
      id: "currencies",
      title: "Currencies",
      description: "Manage currencies for your transactions",
      icon: <Coins className="h-4 w-4" />,
      component: (
        <CurrencyList
          currencies={currencies}
          onDataChange={() => handleDataChange("currencies")}
        />
      ),
    },
  ];

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            {tabContent.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center space-x-2"
              >
                {tab.icon}
                <span>{tab.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <AnimatePresence mode="wait">
            {tabContent.map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl font-semibold">
                        {tab.title}
                      </CardTitle>
                      <CardDescription>{tab.description}</CardDescription>
                    </CardHeader>
                    <CardContent>{tab.component}</CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            ))}
          </AnimatePresence>
        </Tabs>
      </CardContent>
    </Card>
  );
}
