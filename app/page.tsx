"use client";

import MainPage from "./_main/page";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLibraryStore } from "@/app/store/libraryStore";

export default function Page() {
  const router = useRouter();
  const { currentUser, authToken, logout } = useLibraryStore();

  const isTokenExpired = (token: string | null) => {
    if (!token) return true;
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    try {
      const payload = JSON.parse(atob(parts[1]));
      if (!payload?.exp) return false;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!authToken || !currentUser) {
      router.replace("/login");
      return;
    }

    if (isTokenExpired(authToken)) {
      logout();
      router.replace("/login");
    }
  }, [authToken, currentUser, logout, router]);

  if (!currentUser || !authToken) {
    return null;
  }

  return <MainPage />;
}
