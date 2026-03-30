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
import { useRouter } from "next/navigation";

import React, { useState } from "react";

const RegisterPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  // these 4 pieces of state cover everything:
  // email    = what user typed in email field
  // password = what user typed in password field
  // loading  = is the request in progress? (show spinner)
  // error    = any error message to show

  const router = useRouter();
  // router.push('/verify') = navigate to verify page]

  // ── SUBMIT HANDLER ──────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // prevent page reload
    setLoading(true); // show spinner
    setError(""); // clear previous error

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        //POST = we are sending data
        headers: {
          "Content-Type": "application/json",
          // tells the server we're sending JSON
        },
        body: JSON.stringify({ email, password }),
        // JSON.stringify converts JS object to JSON string
        // { email, password } = shorthand for
        // { email: email, password: password }
      });

      const data = await response.json();
      //parse the response body as json
      //data = whatever our API returned

      if (!response.ok) {
        //response.ok = true if status is 200-299
        // false if status is 400,409,500 etc

        setError(data.error || "something went wrong");
        return;
        // return = stop here, don't continue
      }

      // success — go to verify page
      // pass email as query param so verify page knows
      // which email to verify

      router.push(`/verify?email=${encodeURIComponent(email)}`);
      // encodeURIComponent = makes email safe for URL
      // e.g., "john@example.com" → "john%40example.com"
    } catch (error) {
      setError("Network error. Please try again.");
      // this catches if fetch itself fails
      // e.g., no internet connection
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-50 min-h-screen">
      <Card className="w-full max-w-md">
        {/* max-w-md = maximum width of 448 */}
        {/* w-full = take full width up to max-w-md  */}

        <CardHeader>
          <CardTitle className="text-2xl"> Create an account </CardTitle>
          <CardDescription>
            Enter your email and password to register
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* space-y-4 = vertical gap between children */}
            {/* onSubmit = calls handleSubmit when form submitted */}

            {/* Email field  */}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {/* htmlFor links label to input with same id */}
              {/* clicking label focuses the input */}

              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                // e.target.value = what user typed
                // setEmail updates our state
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                // type="password" = hides characters as dots
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* error message */}
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
              // only shows if error is not empty string
              // {error && (...)} = "if error exists, show this"
            )}

            {/* SUBMIT BUTTON */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
              {/* show different text based on loading state */}
            </Button>

            {/* LINK TO LOGIN */}
            <p className="text-gray-600 text-sm text-center">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                Login
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
