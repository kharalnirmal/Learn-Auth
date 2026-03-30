"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      router.push("/dashboard");
      router.refresh();
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
          "linear-gradient(135deg, #E1F5EE 0%, #ffffff 50%, #5DCAA5 100%)",
      }}
    >
      <div
        className="top-[-80px] right-[-80px] absolute opacity-20 rounded-full w-72 h-72"
        style={{ background: "#1D9E75" }}
      />
      <div
        className="bottom-[-60px] left-[-60px] absolute opacity-15 rounded-full w-56 h-56"
        style={{ background: "#0F6E56" }}
      />

      <div className="z-10 relative px-4 w-full max-w-md">
        <div className="mb-8 text-center">
          <div
            className="inline-flex justify-center items-center mb-4 rounded-2xl w-16 h-16"
            style={{ background: "#1D9E75" }}
          >
            <span className="font-bold text-white text-2xl">A</span>
          </div>
          <h1 className="font-bold text-3xl" style={{ color: "#04342C" }}>
            Welcome back
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#0F6E56" }}>
            Sign in to your account
          </p>
        </div>

        <div
          className="shadow-lg p-8 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid #9FE1CB",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" style={{ color: "#085041" }}>
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                required
                style={{ borderColor: "#5DCAA5", borderRadius: "10px" }}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" style={{ color: "#085041" }}>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ borderColor: "#5DCAA5", borderRadius: "10px" }}
              />
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

            <Button
              type="submit"
              className="rounded-xl w-full h-11 font-semibold text-white"
              disabled={loading}
              style={{
                background: loading ? "#5DCAA5" : "#1D9E75",
                border: "none",
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-center" style={{ color: "#0F6E56" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold hover:underline"
              style={{ color: "#085041" }}
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
