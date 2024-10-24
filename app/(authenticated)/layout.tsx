import * as React from "react";
import SidebarComponent from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex w-screen h-screen bg-background">
        <SidebarComponent>{children}</SidebarComponent>
      </div>
    </SidebarProvider>
  );
}
