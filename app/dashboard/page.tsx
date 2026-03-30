"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Session = {
  id: string;
  deviceInfo: string;
  lastSeen: string;
  createdAt: string;
};

type User = {
  id: string;
  email: string;
  role: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsRes, meRes] = await Promise.all([
        fetch("/api/auth/sessions"),
        fetch("/api/auth/me"),
      ]);
      // Promise.all = run both fetches at the same time
      // faster than doing them one after another

      if (!sessionsRes.ok) {
        router.push("/login");
        return;
      }

      const sessionsData = await sessionsRes.json();
      setSessions(sessionsData.sessions);

      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleLogoutAll = async () => {
    await fetch("/api/auth/logout-all", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div
        className="flex justify-center items-center min-h-screen"
        style={{ background: "#FFF8F5" }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-4 border-4 border-t-transparent rounded-full w-10 h-10 animate-spin"
            style={{ borderColor: "#F0997B", borderTopColor: "transparent" }}
          />
          <p style={{ color: "#993C1D" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#FFF8F5" }}>
      {/* top banner */}
      <div
        className="w-full h-2"
        style={{
          background: "linear-gradient(90deg, #D85A30, #F0997B, #D85A30)",
        }}
      />

      <div className="space-y-6 mx-auto px-4 py-10 max-w-2xl">
        {/* header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-bold text-3xl" style={{ color: "#4A1B0C" }}>
              Dashboard
            </h1>
            <p className="mt-1 text-sm" style={{ color: "#993C1D" }}>
              Welcome back, {user?.email?.split("@")[0]}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleLogout}
              className="rounded-xl"
              style={{
                background: "white",
                color: "#D85A30",
                border: "1px solid #F0997B",
              }}
            >
              Logout
            </Button>
            <Button
              onClick={handleLogoutAll}
              className="rounded-xl text-white"
              style={{ background: "#D85A30", border: "none" }}
            >
              Logout All
            </Button>
          </div>
        </div>

        {/* user info card */}
        <div
          className="p-6 rounded-2xl"
          style={{ background: "white", border: "1px solid #F5C4B3" }}
        >
          <h2 className="mb-4 font-semibold" style={{ color: "#711B13" }}>
            Account Info
          </h2>
          <div className="space-y-3">
            <div
              className="flex justify-between items-center py-2"
              style={{ borderBottom: "1px solid #FAECE7" }}
            >
              <span className="text-sm" style={{ color: "#993C1D" }}>
                Email
              </span>
              <span
                className="font-medium text-sm"
                style={{ color: "#4A1B0C" }}
              >
                {user?.email}
              </span>
            </div>
            <div
              className="flex justify-between items-center py-2"
              style={{ borderBottom: "1px solid #FAECE7" }}
            >
              <span className="text-sm" style={{ color: "#993C1D" }}>
                Role
              </span>
              <span
                className="px-3 py-1 rounded-full font-semibold text-xs"
                style={{ background: "#FAECE7", color: "#993C1D" }}
              >
                {user?.role}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm" style={{ color: "#993C1D" }}>
                User ID
              </span>
              <span className="font-mono text-xs" style={{ color: "#4A1B0C" }}>
                {user?.id?.slice(0, 16)}...
              </span>
            </div>
          </div>
        </div>

        {/* sessions card */}
        <div
          className="p-6 rounded-2xl"
          style={{ background: "white", border: "1px solid #F5C4B3" }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold" style={{ color: "#711B13" }}>
              Active Sessions
            </h2>
            <span
              className="px-2 py-1 rounded-full text-xs"
              style={{ background: "#FAECE7", color: "#993C1D" }}
            >
              {sessions.length} device{sessions.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <p className="text-sm" style={{ color: "#993C1D" }}>
                No active sessions
              </p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3 rounded-xl"
                  style={{ background: "#FAECE7", border: "1px solid #F5C4B3" }}
                >
                  <p
                    className="font-medium text-sm"
                    style={{ color: "#4A1B0C" }}
                  >
                    {session.deviceInfo}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "#993C1D" }}>
                    Last seen: {new Date(session.lastSeen).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* admin link */}
        {user?.role === "ADMIN" && (
          <Link href="/admin">
            <div
              className="p-4 rounded-2xl text-center cursor-pointer"
              style={{ background: "#534AB7", border: "none" }}
            >
              <p className="font-semibold text-white">Go to Admin Panel →</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
