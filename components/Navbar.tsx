"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="bg-white px-8 py-4 border-b">
      <div className="flex justify-between items-center mx-auto max-w-2xl">
        {/* LOGO */}
        <Link href="/" className="font-bold text-indigo-600 text-xl">
          Auth Master
        </Link>

        {/* LINKS */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            Dashboard
          </Link>
          <Link
            href="/admin"
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            Admin
          </Link>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
