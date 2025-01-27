"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import safeLocalStorage from "@/utils/safeLocalStorage";

interface User {
  id: number;
  role: number;
  token: string;
}

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = safeLocalStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const logout = () => {
    safeLocalStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  return { user, loading, logout };
}
