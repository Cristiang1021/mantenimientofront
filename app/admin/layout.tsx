"use client";

import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="ml-64 w-full bg-gray-100 min-h-screen p-6">
        {children}
      </main>
    </div>
  );
}
