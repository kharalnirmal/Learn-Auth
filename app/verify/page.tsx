"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyPageFallback />}>
      <VerifyPageContent />
    </Suspense>
  );
}

function VerifyPageContent() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Invalid code");
        return;
      }
      setSuccess("Email verified! Redirecting...");
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex justify-center items-center min-h-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #EEEDFE 0%, #ffffff 50%, #AFA9EC 100%)",
      }}
    >
      <div
        className="top-[-80px] left-[-80px] absolute opacity-20 rounded-full w-72 h-72"
        style={{ background: "#7F77DD" }}
      />

      <div className="z-10 relative px-4 w-full max-w-md">
        <div className="mb-8 text-center">
          <div
            className="inline-flex justify-center items-center mb-4 rounded-2xl w-16 h-16"
            style={{ background: "#7F77DD" }}
          >
            <span className="text-white text-2xl">✉</span>
          </div>
          <h1 className="font-bold text-3xl" style={{ color: "#26215C" }}>
            Check your email
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#534AB7" }}>
            We sent a code to {email || "your email"}
          </p>
        </div>

        <div
          className="shadow-lg p-8 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid #CECBF6",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="code" style={{ color: "#3C3489" }}>
                Verification code
              </Label>
              <Input
                id="code"
                ref={inputRef}
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
                className="font-bold text-2xl text-center tracking-widest"
                style={{
                  borderColor: "#AFA9EC",
                  borderRadius: "10px",
                  height: "56px",
                  color: "#3C3489",
                }}
              />
              {/* tracking-widest = lots of space between characters */}
              {/* looks like: 4  8  2  9  1  0 */}
            </div>

            {error && (
              <div
                className="p-3 rounded-lg text-sm"
                style={{
                  background: "#FCEBEB",
                  color: "#A32D2D",
                  border: "1px solid #F7C1C1",
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="p-3 rounded-lg text-sm"
                style={{
                  background: "#EAF3DE",
                  color: "#3B6D11",
                  border: "1px solid #C0DD97",
                }}
              >
                {success}
              </div>
            )}

            <Button
              type="submit"
              className="rounded-xl w-full h-11 font-semibold text-white"
              disabled={loading}
              style={{
                background: loading ? "#AFA9EC" : "#7F77DD",
                border: "none",
              }}
            >
              {loading ? "Verifying..." : "Verify email"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-center" style={{ color: "#534AB7" }}>
            Wrong email?{" "}
            <Link
              href="/register"
              className="font-semibold hover:underline"
              style={{ color: "#3C3489" }}
            >
              Go back
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function VerifyPageFallback() {
  return (
    <div
      className="flex justify-center items-center min-h-screen"
      style={{ background: "#F7F5FF" }}
    >
      <p style={{ color: "#534AB7" }}>Loading verify page...</p>
    </div>
  );
}
