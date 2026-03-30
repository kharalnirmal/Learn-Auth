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
    <nav
      className="px-6 py-4 border-b"
      style={{ background: "white", borderColor: "#E5E7EB" }}
    >
      <div className="flex justify-between items-center mx-auto max-w-2xl">
        <Link
          href="/"
          className="font-bold text-xl"
          style={{ color: "#7F77DD" }}
        >
          Auth Master
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="hover:opacity-70 font-medium text-sm transition-opacity"
            style={{ color: "#534AB7" }}
          >
            Dashboard
          </Link>
          <Link
            href="/admin"
            className="hover:opacity-70 font-medium text-sm transition-opacity"
            style={{ color: "#534AB7" }}
          >
            Admin
          </Link>
          <Button
            onClick={handleLogout}
            size="sm"
            className="rounded-xl"
            style={{ background: "#7F77DD", color: "white", border: "none" }}
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
