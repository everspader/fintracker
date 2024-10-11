"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GroupList from "@/components/settings/group-list";
import AccountList from "@/components/settings/account-list";
import CurrencyList from "@/components/settings/currency-list";

export default function SettingsDashboard() {
  const [activeTab, setActiveTab] = useState("groups");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="groups">Groups & Categories</TabsTrigger>
        <TabsTrigger value="accounts">Accounts</TabsTrigger>
        <TabsTrigger value="currencies">Currencies</TabsTrigger>
      </TabsList>
      <TabsContent value="groups">
        <GroupList />
      </TabsContent>
      <TabsContent value="accounts">
        <AccountList />
      </TabsContent>
      <TabsContent value="currencies">
        <CurrencyList />
      </TabsContent>
    </Tabs>
  );
}
