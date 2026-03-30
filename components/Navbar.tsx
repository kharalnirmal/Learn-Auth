"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type CurrentUser = {
  id: string;
  email: string;
  role: "ADMIN" | "USER" | "GUEST";
};

export default function Navbar() {
  const router = useRouter();
  // `user` is null when not logged in, otherwise it stores current user info.
  const [user, setUser] = useState<CurrentUser | null>(null);
  // `loading` prevents UI flicker while we check auth status from the server.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Runs once on mount to check whether auth cookies map to a valid user.
    const loadCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        // If token is missing/invalid, backend responds non-2xx.
        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();
        // Keep null fallback so state stays safe even if payload shape changes.
        setUser(data.user ?? null);
      } catch {
        // Network/API errors are treated as logged-out state.
        setUser(null);
      } finally {
        // Auth check is complete; navbar can render final actions.
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const handleLogout = async () => {
    // Clears server-side refresh/session state and expires cookies.
    await fetch("/api/auth/logout", { method: "POST" });
    // Move to login page and refresh app state after logout.
    router.push("/login");
    router.refresh();
  };

  return (
    <nav
      className="top-0 z-50 sticky backdrop-blur px-6 py-4 border-b"
      style={{
        background: "rgba(225,245,238,0.95)",
        borderColor: "#9FE1CB",
      }}
    >
      <div className="flex justify-between items-center mx-auto w-full max-w-2xl">
        <Link
          href="/"
          className="font-bold text-xl"
          style={{ color: "#04342C" }}
        >
          Auth <span style={{ color: "#1D9E75" }}>Master</span>
        </Link>

        <div className="flex items-center gap-6">
          {/* 3 UI states: checking auth, logged in, logged out */}
          {loading ? (
            <span className="text-sm" style={{ color: "#0F6E56" }}>
              Checking session...
            </span>
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="hover:opacity-80 font-medium text-sm transition-opacity"
                style={{ color: "#085041" }}
              >
                Dashboard
              </Link>
              {/* Admin link should only be visible to ADMIN users */}
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="hover:opacity-80 font-medium text-sm transition-opacity"
                  style={{ color: "#085041" }}
                >
                  Admin
                </Link>
              )}
              <Button
                onClick={handleLogout}
                size="sm"
                className="rounded-lg text-white"
                style={{ background: "#1D9E75" }}
              >
                Logout
              </Button>
            </>
          ) : (
            // Guest view: show login/register actions, hide dashboard/logout.
            <>
              <Link
                href="/login"
                className="hover:opacity-80 font-medium text-sm transition-opacity"
                style={{ color: "#085041" }}
              >
                Login
              </Link>
              <Button
                asChild
                size="sm"
                className="rounded-lg text-white"
                style={{ background: "#1D9E75" }}
              >
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
