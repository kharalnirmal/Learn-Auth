"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminPage() {
  const router = useRouter();

  return (
    <div className="bg-gray-50 p-8 min-h-screen">
      <div className="space-y-6 mx-auto max-w-2xl">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-red-600 text-3xl">Admin Panel</h1>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>You have admin privileges</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This page is only visible to users with the ADMIN role. Regular
              users are redirected to the dashboard by the proxy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
