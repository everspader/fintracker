"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Settings,
  BarChart2,
  PieChart,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/transactions", label: "Transactions", icon: BarChart2 },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/reports", label: "Reports", icon: PieChart },
    { href: "/users", label: "Users", icon: Users },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 bg-white shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex items-center justify-between h-20 shadow-md px-4">
          {isSidebarOpen && (
            <h1 className="text-3xl font-bold text-gray-800">FinTracker</h1>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md bg-gray-200 text-gray-600 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            {isSidebarOpen ? (
              <ChevronLeft size={24} />
            ) : (
              <ChevronRight size={24} />
            )}
          </button>
        </div>
        <nav className="mt-10">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-6 py-4 text-gray-700 hover:bg-gray-200 ${
                  pathname === item.href ? "bg-gray-200" : ""
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {isSidebarOpen && item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-white shadow-md lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-500 focus:outline-none focus:text-gray-700"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">FinTracker</h1>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          {children}
        </main>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" aria-hidden="true">
          <div
            className="absolute inset-0 bg-gray-600 opacity-75"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <nav className="absolute top-0 left-0 bottom-0 flex flex-col w-5/6 max-w-sm py-6 px-6 bg-white border-r overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-semibold text-gray-800">
                FinTracker
              </h1>
              <button
                className="text-gray-500 focus:outline-none focus:text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-200 ${
                    pathname === item.href ? "bg-gray-200" : ""
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
