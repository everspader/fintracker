"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CreditCard,
  PieChart,
  Users,
  Globe,
  BarChart2,
  Target,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const features = [
    {
      title: "Multi-Account Tracking",
      description:
        "Manage and track multiple accounts in various currencies with ease.",
      icon: CreditCard,
    },
    {
      title: "Credit Card Management",
      description:
        "Automatic computation of credit card statements on billing dates.",
      icon: BarChart2,
    },
    {
      title: "Family Collaboration",
      description:
        "Share and manage finances collaboratively with family members.",
      icon: Users,
    },
    {
      title: "Multi-Currency Support",
      description:
        "Handle transactions and accounts in multiple currencies effortlessly.",
      icon: Globe,
    },
    {
      title: "Insightful Analytics",
      description:
        "Gain valuable insights with detailed financial reports and visualizations.",
      icon: PieChart,
    },
    {
      title: "Goal Setting",
      description:
        "Set and track financial goals to stay motivated and on budget.",
      icon: Target,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <CreditCard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            FinanceTrack
          </span>
        </Link>
        <nav className="hidden md:flex space-x-8">
          <Link
            href="#features"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
          >
            Features
          </Link>
          <Link
            href="#"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="#"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
          >
            About
          </Link>
        </nav>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-gray-600 dark:text-gray-300"
        >
          {mounted &&
            (theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            ))}
        </Button>
      </header>
      <main className="flex-grow">
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
            Master Your Finances with FinanceTrack
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300 mb-10">
            Track multiple accounts, currencies, and collaborate with family.
            Your all-in-one solution for personal finance management.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </section>
        <section
          id="features"
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Key Features
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-white dark:bg-gray-800 transition-colors duration-300"
              >
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © 2024 FinanceTrack. All rights reserved.
          </p>
          <nav className="flex space-x-4 mt-4 md:mt-0">
            <Link
              href="#"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
