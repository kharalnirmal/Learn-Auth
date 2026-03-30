"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const VerifyPage = () => {
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();
  // useSearchParams reads the URL query parameters
  // e.g., /verify?email=john@example.com
  // searchParams.get('email') → "john@example.com"

  const email = searchParams.get("email");
  // get the email from URL
  // register page passed it as ?email=...

  const inputRef = useRef<HTMLInputElement>(null);
  // useRef = a way to directly access a DOM element
  // inputRef.current = the actual <input> element
  // useRef to auto-focus the input when page loads

  useEffect(() => {
    inputRef.current?.focus();
    // when page loads → cursor goes straight to input
    // user doesn't have to click it manually
  }, []);
  // [] = run once when component mounts

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "something went wrong");
        return;
      }

      setSuccess("Email verified successfully! Redirecting to login...");
      // show success message briefly before redirecting

      setTimeout(() => {
        router.push("/login");
      }, 1500);
      // wait 1.5 seconds so user can read the success message
      // then redirect to login
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-50 min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            we send a 6-digit code to {email || "your email"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                ref={inputRef}
                //ref connects to useRed above
                //gives this input auto focus on land
                type="text"
                required
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {success && <p className="text-green-500 text-sm">{success}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify email"}
            </Button>
            <p className="text-gray-600 text-sm text-center">
              Wrong email?{" "}
              <a href="/register" className="text-blue-600 hover:underline">
                Go back
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyPage;
