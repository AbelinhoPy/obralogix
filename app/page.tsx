"use client";

import React from "react";
import LandingPage from "@/components/LandingPage";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleOpenApp = (tab?: string) => {
    if (tab === "portal-operario") {
      router.push("/mis-tareas");
    } else if (tab) {
      router.push(`/${tab}`);
    } else {
      router.push("/dashboard");
    }
  };

  return <LandingPage onOpenApp={handleOpenApp} />;
}
