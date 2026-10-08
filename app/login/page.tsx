"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, signUp, signOut, useSession } from "@/lib/auth-client";
import {
  Crown,
  KeyRound,
  Mail,
  User,
  ArrowRight,
  Building2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  LogOut,
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
          setError(res.error.message || "Invalid credentials. Please verify your email and password.");
          setLoading(false);
          return;
        }

        const userRole = (res.data?.user as any)?.role;
        const isAdmin = userRole === "ADMIN" || email.trim().toLowerCase() === "admin@crown.soad.ac.uk";
        const target = isAdmin ? "/admin" : redirectTarget;

        setSuccess("Authentication successful. Entering the Realm...");
        setTimeout(() => {
          window.location.href = target;
        }, 300);
      } else {
        // Sign up flow
        if (!name.trim()) {
          setError("Please provide your full participant name.");
          setLoading(false);
          return;
        }

        const res = await signUp.email({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        });

        if (res.error) {
          setError(res.error.message || "Failed to create account. Email may already be in use.");
          setLoading(false);
          return;
        }

        setSuccess("Account successfully created! Welcoming you to the competition...");
        setTimeout(() => {
          window.location.href = redirectTarget;
        }, 400);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleSignOutCurrent = async () => {
    try {
      setLoading(true);
      await signOut();
      window.location.reload();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
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
            School of Arts and Design (SOAD) • Britain
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

          {/* Active Session Notification */}
          {session?.user && (
            <div className="mb-5 p-3.5 bg-[#FAF6EE] border border-[#E8DCC4] rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <p className="font-semibold text-[#0D1F3C] truncate">
                  Logged in as {session.user.name}
                </p>
                <p className="text-[#6E634A] truncate text-[11px]">{session.user.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const isAdmin = (session.user as any)?.role === "ADMIN";
                    window.location.href = isAdmin ? "/admin" : redirectTarget;
                  }}
                  className="px-2.5 py-1 bg-[#0D1F3C] text-white rounded-lg text-[11px] font-medium hover:bg-[#162E56] transition cursor-pointer"
                >
                  Continue →
                </button>
                <button
                  type="button"
                  onClick={handleSignOutCurrent}
                  title="Sign out to switch account"
                  className="p-1 text-[#8C867D] hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

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
