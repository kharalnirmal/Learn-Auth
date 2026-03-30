"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // fetch sessions
      const sessionsRes = await fetch("/api/auth/sessions");
      if (!sessionsRes.ok) {
        router.push("/login");
        return;
      }
      const sessionsData = await sessionsRes.json();
      setSessions(sessionsData.sessions);

      // get user info from token via sessions response
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      }
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleLogoutAll = async () => {
    await fetch("/api/auth/logout-all", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-8 min-h-screen">
      <div className="space-y-6 mx-auto max-w-2xl">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-3xl">Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
            <Button variant="destructive" onClick={handleLogoutAll}>
              Logout All Devices
            </Button>
          </div>
        </div>

        {/* USER INFO CARD */}
        <Card>
          <CardHeader>
            <CardTitle>Your Account</CardTitle>
            <CardDescription>Your current account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {user ? (
              <>
                <p>
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-medium">Role:</span> {user.role}
                </p>
                <p>
                  <span className="font-medium">ID:</span> {user.id}
                </p>
              </>
            ) : (
              <p className="text-gray-500">Loading user info...</p>
            )}
          </CardContent>
        </Card>

        {/* SESSIONS CARD */}
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Devices currently logged into your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-gray-500">No active sessions</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="space-y-1 bg-gray-100 p-3 rounded-lg"
                  >
                    <p className="font-medium text-sm">{session.deviceInfo}</p>
                    <p className="text-gray-500 text-xs">
                      Last seen: {new Date(session.lastSeen).toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Created: {new Date(session.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ADMIN LINK — only shows for admins */}
        {user?.role === "ADMIN" && (
          <Card>
            <CardContent className="pt-6">
              <Link href="/admin">
                <Button className="w-full">Go to Admin Panel</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>
    </div>
  );
}
