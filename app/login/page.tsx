"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "@/lib/auth-client";
import {
  Crown,
  KeyRound,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/";

  const { data: session, isPending: sessionLoading } = useSession();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // If already authenticated, redirect appropriately
  useEffect(() => {
    if (session?.user) {
      if ((session.user as any).role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push(redirectTarget);
      }
    }
  }, [session, router, redirectTarget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        const res = await signIn.email({
          email: email.trim().toLowerCase(),
          password,
        });

        if (res.error) {
          setError(res.error.message || "Invalid credentials. Please verify and try again.");
          setLoading(false);
          return;
        }

        // Fetch fresh session or check role
        const sessionRes = await fetch("/api/auth/get-session");
        const sessionData = await sessionRes.json().catch(() => null);
        const userRole = sessionData?.user?.role;

        setSuccess("Signing you in to the Realm...");
        setTimeout(() => {
          if (userRole === "ADMIN" || email.trim().toLowerCase() === "admin@crown.soad.ac.uk") {
            router.push("/admin");
          } else {
            router.push(redirectTarget);
          }
        }, 300);
      } else {
        // Sign up flow
        if (!name.trim()) {
          setError("Please provide your full participant name.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/auth/sign-up/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          setError(data.error?.message || data.error || "Failed to create account.");
          setLoading(false);
          return;
        }

        setSuccess("Account successfully created! Welcoming you to the competition...");
        setTimeout(() => {
          router.push(redirectTarget);
        }, 500);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const autofillAdmin = () => {
    setMode("signin");
    setEmail("admin@crown.soad.ac.uk");
    setPassword("CrownAdmin2026!");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Decorative British Heritage background ornaments */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#C5A059]/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#0D1F3C]/10 blur-3xl" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Crest & Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-3 text-[#0D1F3C] hover:text-[#C5A059] transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-[#0D1F3C] flex items-center justify-center text-[#C5A059] shadow-md border-2 border-[#C5A059]">
              <Crown className="w-6 h-6 stroke-[2]" />
            </div>
          </Link>
          <div className="inline-block px-3 py-1 mb-2 rounded-full border border-[#C5A059]/40 bg-[#FAF4E8] text-[#9F7E3B] text-xs font-semibold tracking-widest uppercase">
            School of Architectural Design • Britain
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#0D1F3C] tracking-tight">
            Crown of the Realm
          </h1>
          <p className="text-sm text-[#5A554E] mt-1 max-w-sm mx-auto">
            British Heritage & Creative Challenge 2026
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-xl p-8 backdrop-blur-sm relative">
          {/* Subtle gold top trim */}
          <div className="absolute top-0 left-6 right-6 h-1 bg-gradient-to-r from-[#0D1F3C] via-[#C5A059] to-[#8C1D2F] rounded-t-full" />

          {/* Mode Switcher */}
          <div className="flex border-b border-[#E5DFD5] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wide transition-colors relative ${
                mode === "signin"
                  ? "text-[#0D1F3C]"
                  : "text-[#8C867D] hover:text-[#0D1F3C]"
              }`}
            >
              Sign In
              {mode === "signin" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0D1F3C]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wide transition-colors relative ${
                mode === "signup"
                  ? "text-[#0D1F3C]"
                  : "text-[#8C867D] hover:text-[#0D1F3C]"
              }`}
            >
              Register Account
              {mode === "signup" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0D1F3C]" />
              )}
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>{success}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A453E] mb-1.5">
                  Full Participant Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C867D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Arthur Pendelton"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:outline-none focus:border-[#0D1F3C] focus:bg-white transition-all text-[#1A1A1A]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A453E] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C867D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:outline-none focus:border-[#0D1F3C] focus:bg-white transition-all text-[#1A1A1A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A453E] mb-1.5">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#8C867D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:outline-none focus:border-[#0D1F3C] focus:bg-white transition-all text-[#1A1A1A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#0D1F3C] hover:bg-[#162E56] text-white font-medium text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === "signin"
                      ? "Enter the Competition"
                      : "Create Creator Account"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-fill helper for seeded Admin */}
          <div className="mt-6 pt-5 border-t border-[#E5DFD5]">
            <div className="bg-[#FAF6EE] border border-[#E8DCC4] rounded-xl p-3 text-xs text-[#5C4F34]">
              <div className="flex items-center justify-between mb-1.5 font-semibold text-[#3C321E]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                  Seeded Jury / Admin Credentials
                </span>
                <button
                  type="button"
                  onClick={autofillAdmin}
                  className="text-[11px] bg-white px-2 py-0.5 rounded border border-[#D5C299] text-[#7B5E1E] hover:bg-[#FAF4E8] font-medium transition cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>
              <p className="text-[11px] leading-relaxed text-[#6E634A]">
                Login with admin credentials will automatically open the{" "}
                <span className="font-semibold text-[#0D1F3C]">Curator Admin Panel</span>.
              </p>
              <div className="mt-1.5 font-mono text-[10px] text-[#4A4232] select-all bg-white/70 px-2 py-1 rounded border border-[#E2D5BA]">
                admin@crown.soad.ac.uk • CrownAdmin2026!
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-[#7A746B] hover:text-[#0D1F3C] font-medium transition inline-flex items-center gap-1"
          >
            ← Return to Heritage Themes Showcase
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
