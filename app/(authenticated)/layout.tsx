"use client";

import * as React from "react";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarComponent } from "@/components/layout/sidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <SidebarComponent />
        <SidebarInset className="flex flex-col flex-grow">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex-1" />
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
          </header>
          <main className="flex-1 overflow-auto p-6 w-full">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
