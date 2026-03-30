"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      router.push(`/verify?email=${encodeURIComponent(email)}`);
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
      {/* decorative blobs */}
      <div
        className="top-[-80px] left-[-80px] absolute opacity-20 rounded-full w-72 h-72"
        style={{ background: "#7F77DD" }}
      />
      <div
        className="right-[-60px] bottom-[-60px] absolute opacity-15 rounded-full w-56 h-56"
        style={{ background: "#534AB7" }}
      />

      <div className="z-10 relative px-4 w-full max-w-md">
        {/* logo */}
        <div className="mb-8 text-center">
          <div
            className="inline-flex justify-center items-center mb-4 rounded-2xl w-16 h-16"
            style={{ background: "#7F77DD" }}
          >
            <span className="font-bold text-white text-2xl">A</span>
          </div>
          <h1 className="font-bold text-3xl" style={{ color: "#26215C" }}>
            Create account
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#534AB7" }}>
            Join us today — it's free
          </p>
        </div>

        {/* card */}
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
              <Label htmlFor="email" style={{ color: "#3C3489" }}>
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                required
                style={{ borderColor: "#AFA9EC", borderRadius: "10px" }}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" style={{ color: "#3C3489" }}>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ borderColor: "#AFA9EC", borderRadius: "10px" }}
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
                background: loading ? "#AFA9EC" : "#7F77DD",
                border: "none",
              }}
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-center" style={{ color: "#534AB7" }}>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold hover:underline"
              style={{ color: "#3C3489" }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
