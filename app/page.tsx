"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import {
  Crown,
  Download,
  Upload,
  Eye,
  Check,
  ChevronRight,
  Sparkles,
  Award,
  Layers,
  Info,
  X,
  User,
  LogOut,
  LogIn,
  Shield,
  FileCheck,
  Star,
  ExternalLink,
  Sliders,
  History,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface ThemeItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  era: string;
  description: string;
  imagePath: string;
  order: number;
}

interface CompetitionData {
  config: {
    title: string;
    subtitle: string;
    areResultsPublished: boolean;
    resultsAnnouncement?: string;
    publishedAt?: string;
  };
  publishedResults: any[];
}

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);
  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & Panels
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isMySubmissionsOpen, setIsMySubmissionsOpen] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isFullscreenImageOpen, setIsFullscreenImageOpen] = useState(false);

  // Submission Form State
  const [submitThemeId, setSubmitThemeId] = useState("");
  const [entryTitle, setEntryTitle] = useState("");
  const [entryDescription, setEntryDescription] = useState("");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // User Submissions State
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [loadingMySubmissions, setLoadingMySubmissions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch themes and competition config
  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);
        const [themesRes, compRes] = await Promise.all([
          fetch("/api/themes"),
          fetch("/api/competition"),
        ]);
        const [themesData, compData] = await Promise.all([
          themesRes.json(),
          compRes.json(),
        ]);

        if (themesData.success && themesData.themes) {
          setThemes(themesData.themes);
          if (themesData.themes.length > 0) {
            setSubmitThemeId(themesData.themes[0].id);
          }
        }
        if (compData.success) {
          setCompetition(compData);
        }
      } catch (err) {
        console.error("Failed to load competition data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  // Fetch user's own submissions
  const loadMySubmissions = async () => {
    if (!session?.user) return;
    try {
      setLoadingMySubmissions(true);
      const res = await fetch("/api/submissions");
      const data = await res.json();
      if (data.success) {
        setMySubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error("Error loading submissions:", err);
    } finally {
      setLoadingMySubmissions(false);
    }
  };

  const activeTheme = themes[selectedThemeIndex] || null;

  // Handle open submit modal for a specific theme
  const handleOpenSubmit = (themeId?: string) => {
    if (sessionLoading) return;
    if (!session?.user) {
      window.location.href = "/login?redirect=/";
      return;
    }
    if (themeId) {
      setSubmitThemeId(themeId);
    } else if (activeTheme) {
      setSubmitThemeId(activeTheme.id);
    }
    setSubmitSuccess(false);
    setSubmitError(null);
    setIsSubmitOpen(true);
  };

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileToUpload(file);
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle submission upload
  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload || !entryTitle.trim() || !submitThemeId) {
      setSubmitError("Please provide an entry title and attach your artwork file.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const formData = new FormData();
      formData.append("themeId", submitThemeId);
      formData.append("title", entryTitle.trim());
      formData.append("description", entryDescription.trim());
      formData.append("participantName", session?.user?.name || "Participant");
      formData.append("participantEmail", session?.user?.email || "");
      formData.append("file", fileToUpload);

      const res = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setSubmitError(data.error || "Submission could not be completed.");
        setIsSubmitting(false);
        return;
      }

      setSubmitSuccess(true);
      setEntryTitle("");
      setEntryDescription("");
      setFileToUpload(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refresh my submissions
      loadMySubmissions();
    } catch (err: any) {
      console.error(err);
      setSubmitError(err?.message || "An error occurred while uploading your entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper download theme image
  const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <div className="h-screen max-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col font-sans overflow-hidden selection:bg-[#C5A059]/30 selection:text-[#0D1F3C]">
      {/* Top Banner Navigation Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#E5DFD5] shrink-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Crest & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0D1F3C] flex items-center justify-center text-[#C5A059] border border-[#C5A059] shadow-xs">
              <Crown className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base text-[#0D1F3C] tracking-tight">
                  Crown of the Realm
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#FAF4E8] text-[#9F7E3B] font-semibold text-[10px] uppercase tracking-widest border border-[#E8DCC4]">
                  Britain 2026
                </span>
              </div>
              <p className="text-[10px] text-[#6B655D] hidden sm:block">
                School of Arts and Design (SOAD) • National Heritage Challenge
              </p>
            </div>
          </div>

          {/* Center Published Ribbon if Active */}
          {competition?.config?.areResultsPublished && (
            <button
              onClick={() => setIsResultsOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#C5A059]/20 via-[#FAF4E8] to-[#C5A059]/20 border border-[#C5A059] text-[#0D1F3C] text-xs font-semibold hover:shadow-xs transition animate-pulse cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Official Laureates & Results Published!</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Right Action Menu */}
          <div className="flex items-center gap-3">
            {sessionLoading ? (
              <div className="h-8 w-24 bg-slate-100 rounded-xl animate-pulse" />
            ) : session?.user ? (
              <div className="flex items-center gap-2.5">
                {isAdmin ? (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#0D1F3C] text-[#C5A059] border border-[#C5A059] hover:bg-[#162E56] transition shadow-xs"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin Panel
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      loadMySubmissions();
                      setIsMySubmissionsOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-[#FAF8F5] text-[#3A352F] border border-[#E5DFD5] hover:bg-white transition cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-[#C5A059]" />
                    My Submissions
                  </button>
                )}

                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] text-xs text-[#4A453E]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium truncate max-w-[120px]">
                    {session.user.name}
                  </span>
                </div>

                <button
                  onClick={async () => {
                    await signOut();
                    window.location.href = "/";
                  }}
                  title="Sign Out"
                  className="p-1.5 text-[#7A746B] hover:text-red-700 hover:bg-red-50 rounded-xl transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0D1F3C] hover:bg-[#162E56] text-white text-xs font-semibold transition shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Sign In / Register</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Split-Screen Competition Experience */}
      <main className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT COLUMN: Expansive Artwork Stage with Unzoomed Image */}
        <div className="flex-1 relative bg-[#0B1422] min-h-0 h-full overflow-hidden flex flex-col justify-between">
          {activeTheme ? (
            <>
              {/* Top Meta Bar */}
              <div className="relative z-20 p-4 sm:p-5 flex items-center justify-between gap-4 pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold shadow-lg">
                    <span className="text-[#C5A059]">
                      Theme {String(activeTheme.order).padStart(2, "0")} / {String(themes.length || 4).padStart(2, "0")}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/40" />
                    <span className="text-slate-300">{activeTheme.era}</span>
                  </div>
                  <span className="hidden md:inline-flex px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/80 text-[11px] border border-white/10">
                    📍 {activeTheme.subtitle}
                  </span>
                </div>

                <button
                  onClick={() => setIsFullscreenImageOpen(true)}
                  className="pointer-events-auto px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white/90 hover:text-white border border-white/20 backdrop-blur-md transition shadow-lg cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                  title="Inspect architectural detail"
                >
                  <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Inspect Fullscreen</span>
                </button>
              </div>

              {/* Main Artwork Image - UNZOOMED with object-contain */}
              <div className="flex-1 min-h-0 relative w-full overflow-hidden">
                <div className="absolute inset-0 p-3 sm:p-6 pb-26 sm:pb-22 flex items-center justify-center">
                  <div className="relative w-full h-full max-w-5xl">
                    <Image
                      src={activeTheme.imagePath}
                      alt={activeTheme.title}
                      fill
                      priority
                      loading="eager"
                      className="object-contain drop-shadow-2xl"
                      unoptimized
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Frosted Console: Details & Actions */}
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 z-20 bg-black/75 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xl">
                {/* Title & Description Snippet */}
                <div className="max-w-2xl text-white">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="font-serif text-base sm:text-lg font-bold tracking-tight text-white truncate">
                      {activeTheme.title}
                    </h2>
                    <span className="text-[10px] text-[#C5A059] uppercase tracking-wider hidden sm:inline">
                      • {activeTheme.subtitle}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-300 leading-snug line-clamp-2">
                    {activeTheme.description}
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
                  <button
                    onClick={() =>
                      triggerDownload(
                        activeTheme.imagePath,
                        `soad-britain-theme-${activeTheme.order}-${activeTheme.slug}.jpg`
                      )
                    }
                    className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#0D1F3C] font-semibold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer border border-white"
                  >
                    <Download className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Download Template</span>
                  </button>

                  <button
                    onClick={() => handleOpenSubmit(activeTheme.id)}
                    className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0D1F3C] via-[#162E56] to-[#0D1F3C] hover:from-[#162E56] hover:to-[#0D1F3C] text-white font-semibold text-xs transition shadow-md flex items-center justify-center gap-2 border border-[#C5A059]/60 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Submit Creative Entry</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              Loading heritage themes...
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Dedicated Scrollable Heritage Themes Menu */}
        <aside className="w-full lg:w-96 xl:w-[420px] bg-white border-t lg:border-t-0 lg:border-l border-[#E5DFD5] flex flex-col h-full min-h-0 shrink-0 overflow-hidden shadow-xs">
          {/* Aside Header */}
          <div className="p-4 border-b border-[#E5DFD5] bg-[#FAF8F5] shrink-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#0D1F3C] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#C5A059]" />
                Heritage Themes
              </span>
              <span className="text-[10px] font-semibold text-[#8C867D] px-2 py-0.5 rounded-full bg-white border border-[#E5DFD5]">
                {themes.length} Available
              </span>
            </div>
            <p className="text-[11px] text-[#6B655D] leading-snug">
              Select a hall, download the template to create your artwork, then upload your submission.
            </p>
          </div>

          {/* Smooth Scrollable Themes List */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-[#E5DFD5] overscroll-contain">
            {themes.map((theme, idx) => {
              const isSelected = idx === selectedThemeIndex;
              return (
                <div
                  key={theme.id}
                  onClick={() => setSelectedThemeIndex(idx)}
                  className={`p-3.5 transition-all cursor-pointer flex gap-3 group relative ${
                    isSelected
                      ? "bg-[#FAF5EA] border-l-4 border-l-[#0D1F3C]"
                      : "hover:bg-[#FAF8F5] border-l-4 border-l-transparent"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 relative border border-[#E5DFD5] shadow-2xs group-hover:shadow-xs transition bg-slate-100">
                    <Image
                      src={theme.imagePath}
                      alt={theme.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                      unoptimized
                    />
                    <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-black/60 text-[9px] font-bold text-white backdrop-blur-2xs">
                      #{theme.order}
                    </div>
                  </div>

                  {/* Information */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-[#9F7E3B]">
                          {theme.era.split("(")[0]}
                        </span>
                        {isSelected && (
                          <span className="w-3.5 h-3.5 rounded-full bg-[#0D1F3C] text-[#C5A059] flex items-center justify-center shrink-0">
                            <Check className="w-2 h-2 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <h4
                        className={`font-serif text-xs font-bold leading-snug truncate transition ${
                          isSelected ? "text-[#0D1F3C]" : "text-[#2A2520] group-hover:text-[#0D1F3C]"
                        }`}
                      >
                        {theme.title}
                      </h4>
                      <p className="text-[10px] text-[#7A746B] truncate">
                        {theme.subtitle}
                      </p>
                    </div>

                    <p className="text-[10px] text-[#5A554E] line-clamp-2 mt-1 leading-relaxed">
                      {theme.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Aside Footer Action Quick Bar */}
          <div className="p-3.5 bg-[#FAF8F5] border-t border-[#E5DFD5] flex items-center justify-between gap-2.5 shrink-0">
            <button
              onClick={() => activeTheme && triggerDownload(activeTheme.imagePath, `${activeTheme.slug}.jpg`)}
              className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-[#E5DFD5] text-[#0D1F3C] text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Download</span>
            </button>
            <button
              onClick={() => handleOpenSubmit()}
              className="flex-1 py-2 px-3 rounded-xl bg-[#0D1F3C] hover:bg-[#162E56] text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Submit Work</span>
            </button>
          </div>
        </aside>
      </main>

      {/* SUBMISSION MODAL */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-[#E5DFD5] shadow-2xl overflow-hidden my-8 animate-scale-in">
            {/* Modal Header */}
            <div className="p-6 bg-[#0D1F3C] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-[#C5A059] uppercase tracking-widest block mb-1">
                  Creative Challenge Entry
                </span>
                <h3 className="font-serif text-xl font-bold">
                  Submit Your Creative Work
                </h3>
              </div>
              <button
                onClick={() => setIsSubmitOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {submitSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-500 mx-auto flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-[#0D1F3C]">
                    Entry Successfully Lodged!
                  </h4>
                  <p className="text-xs text-[#5A554E] max-w-md mx-auto leading-relaxed">
                    Your creative interpretation has been safely recorded in the competition archives. The Royal Jury will review and grade all submissions.
                  </p>
                  <div className="pt-4 flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setIsSubmitOpen(false);
                        loadMySubmissions();
                        setIsMySubmissionsOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#0D1F3C] text-white text-xs font-semibold shadow-xs hover:bg-[#162E56] transition cursor-pointer"
                    >
                      View In My Submissions
                    </button>
                    <button
                      onClick={() => {
                        setSubmitSuccess(false);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0D1F3C] text-xs font-semibold transition cursor-pointer"
                    >
                      Submit Another Piece
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitEntry} className="space-y-4">
                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Theme Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0D1F3C] mb-1.5">
                      Selected Base Heritage Theme
                    </label>
                    <select
                      value={submitThemeId}
                      onChange={(e) => setSubmitThemeId(e.target.value)}
                      className="w-full p-2.5 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl text-[#1A1A1A] focus:outline-none focus:border-[#0D1F3C]"
                    >
                      {themes.map((t) => (
                        <option key={t.id} value={t.id}>
                          Theme {t.order}: {t.title} ({t.subtitle})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Artwork Title */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0D1F3C] mb-1.5">
                      Artwork / Creative Entry Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Whispers of the Victorian Gallery"
                      value={entryTitle}
                      onChange={(e) => setEntryTitle(e.target.value)}
                      className="w-full p-2.5 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl text-[#1A1A1A] focus:outline-none focus:border-[#0D1F3C]"
                    />
                  </div>

                  {/* Creative Statement */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0D1F3C] mb-1.5">
                      Creative Statement / Technique Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe what alterations, stylistic choices, or digital artistry you applied..."
                      value={entryDescription}
                      onChange={(e) => setEntryDescription(e.target.value)}
                      className="w-full p-2.5 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl text-[#1A1A1A] focus:outline-none focus:border-[#0D1F3C] leading-relaxed"
                    />
                  </div>

                  {/* File Upload Drop Area */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0D1F3C] mb-1.5">
                      Attach Artwork File (JPG, PNG, WEBP)
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="artwork-file-input"
                    />

                    {filePreview ? (
                      <div className="relative rounded-2xl overflow-hidden border border-[#E5DFD5] bg-[#FAF8F5] p-2 flex items-center gap-3">
                        <div className="w-20 h-16 relative rounded-lg overflow-hidden shrink-0 border border-[#E5DFD5]">
                          <Image
                            src={filePreview}
                            alt="Upload preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#0D1F3C] truncate">
                            {fileToUpload?.name}
                          </p>
                          <p className="text-[10px] text-[#7A746B]">
                            {((fileToUpload?.size || 0) / (1024 * 1024)).toFixed(2)} MB
                          </p>
                          <label
                            htmlFor="artwork-file-input"
                            className="text-[11px] text-[#C5A059] font-medium hover:underline cursor-pointer"
                          >
                            Change image
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFileToUpload(null);
                            setFilePreview(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="artwork-file-input"
                        className="border-2 border-dashed border-[#D5CDBD] hover:border-[#0D1F3C] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 bg-[#FAF8F5] hover:bg-[#F4EFE6] transition cursor-pointer"
                      >
                        <Upload className="w-6 h-6 text-[#9F7E3B]" />
                        <span className="text-xs font-semibold text-[#0D1F3C]">
                          Click to select your creative file
                        </span>
                        <span className="text-[10px] text-[#7A746B]">
                          Supports duplicate names safely • Max file size 25MB
                        </span>
                      </label>
                    )}
                  </div>

                  {/* Participant Badge Confirmation */}
                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E5DFD5] text-xs flex items-center justify-between text-[#5A554E]">
                    <span>Lodging as: <strong>{session?.user?.name}</strong></span>
                    <span className="text-[11px] text-[#7A746B]">{session?.user?.email}</span>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || !fileToUpload}
                      className="w-full py-3 px-4 bg-[#0D1F3C] hover:bg-[#162E56] text-white text-xs font-semibold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Uploading & Lodging Entry...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-[#C5A059]" />
                          <span>Submit Official Challenge Entry</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MY SUBMISSIONS DRAWER */}
      {isMySubmissionsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end">
          <div className="bg-white max-w-md w-full h-full border-l border-[#E5DFD5] shadow-2xl flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="p-6 bg-[#0D1F3C] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-[#C5A059] uppercase tracking-widest block mb-1">
                  Participant Portfolio
                </span>
                <h3 className="font-serif text-lg font-bold">
                  My Challenge Entries
                </h3>
              </div>
              <button
                onClick={() => setIsMySubmissionsOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMySubmissions ? (
                <div className="text-center py-12 text-xs text-[#7A746B]">
                  Loading your entries...
                </div>
              ) : mySubmissions.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#7A746B]">
                  You have not submitted any entries yet. Choose a theme and upload your first work!
                </div>
              ) : (
                mySubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-2xl border border-[#E5DFD5] bg-[#FAF8F5] space-y-3"
                  >
                    <div className="flex gap-3">
                      <div className="w-20 h-16 relative rounded-xl overflow-hidden shrink-0 border border-[#E5DFD5]">
                        <Image
                          src={sub.fileUrl}
                          alt={sub.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-semibold text-[#9F7E3B]">
                          {sub.theme.title}
                        </span>
                        <h4 className="font-serif text-xs font-bold text-[#0D1F3C] truncate">
                          {sub.title}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              sub.status === "WINNER"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : sub.status === "REVIEWED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {sub.status}
                          </span>
                          {competition?.config?.areResultsPublished && sub.rating !== null && (
                            <span className="text-[10px] font-bold text-[#0D1F3C] flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-[#C5A059] fill-[#C5A059]" />
                              {sub.rating}/10
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {competition?.config?.areResultsPublished && sub.award && (
                      <div className="p-2 rounded-lg bg-[#FAF4E8] border border-[#E2C98F] text-[11px] font-semibold text-[#0D1F3C] flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Awarded: {sub.award}</span>
                      </div>
                    )}

                    {competition?.config?.areResultsPublished && sub.feedback && (
                      <p className="text-[11px] text-[#5A554E] italic bg-white p-2.5 rounded-lg border border-[#E5DFD5]">
                        "{sub.feedback}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL PUBLISHED RESULTS MODAL */}
      {isResultsOpen && competition && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#E5DFD5] shadow-2xl overflow-hidden my-8 animate-scale-in">
            {/* Header */}
            <div className="p-6 bg-[#0D1F3C] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-[#C5A059] uppercase tracking-widest block mb-1">
                  Crown of the Realm • Official Results
                </span>
                <h3 className="font-serif text-2xl font-bold">
                  Laureates & Adjudicated Works
                </h3>
              </div>
              <button
                onClick={() => setIsResultsOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Announcement Banner */}
            {competition.config.resultsAnnouncement && (
              <div className="p-4 bg-[#FAF4E8] border-b border-[#E8DCC4] text-xs text-[#5C4F34] flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>{competition.config.resultsAnnouncement}</span>
              </div>
            )}

            {/* Results Grid */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {competition.publishedResults?.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#7A746B]">
                  No rated entries found in this publication release.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {competition.publishedResults.map((item, idx) => (
                    <div
                      key={item.id}
                      className="bg-[#FAF8F5] rounded-2xl border border-[#E5DFD5] overflow-hidden shadow-xs hover:shadow-md transition"
                    >
                      <div className="relative aspect-16/10 bg-black">
                        <Image
                          src={item.fileUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {item.award && (
                          <div className="absolute top-3 left-3 bg-[#C5A059] text-[#0D1F3C] text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {item.award}
                          </div>
                        )}
                        {item.rating !== null && (
                          <div className="absolute top-3 right-3 bg-[#0D1F3C] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                            <Star className="w-3 h-3 text-[#C5A059] fill-[#C5A059]" />
                            {item.rating}/10
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <span className="text-[10px] font-semibold text-[#8C867D] uppercase">
                          {item.theme?.title}
                        </span>
                        <h4 className="font-serif text-sm font-bold text-[#0D1F3C]">
                          {item.title}
                        </h4>
                        <p className="text-xs text-[#5A554E] mt-1 font-medium">
                          Creator: {item.participantName}
                        </p>
                        {item.description && (
                          <p className="text-[11px] text-[#6E685F] mt-2 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        {item.feedback && (
                          <div className="mt-3 pt-2.5 border-t border-[#E5DFD5] text-[11px] text-[#3F3931] italic bg-white p-2.5 rounded-xl border border-[#E5DFD5]">
                            "{item.feedback}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX */}
      {isFullscreenImageOpen && activeTheme && (
        <div
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsFullscreenImageOpen(false)}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <Image
              src={activeTheme.imagePath}
              alt={activeTheme.title}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <button
            onClick={() => setIsFullscreenImageOpen(false)}
            className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
