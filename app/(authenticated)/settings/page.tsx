import { Suspense } from "react";
import SettingsDashboard from "@/components/settings/settings-dashboard";
import { getGroups } from "@/app/actions/group-actions";
import { getAccounts } from "@/app/actions/account-actions";
import { getCurrencies } from "@/app/actions/currency-actions";
import { Skeleton } from "@/components/ui/skeleton";

export default async function SettingsPage() {
  const [groups, accounts, currencies] = await Promise.all([
    getGroups(),
    getAccounts(),
    getCurrencies(),
  ]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
        <SettingsDashboard
          initialGroups={groups}
          initialAccounts={accounts}
          initialCurrencies={currencies}
        />
      </Suspense>
    </div>
  );
}
