"use client";

import React from "react";
import DashboardView from "@/components/DashboardView";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const handleNavigate = (tab: string) => {
    router.push(`/${tab}`);
  };

  return <DashboardView onNavigateTab={handleNavigate} />;
}
