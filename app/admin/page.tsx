"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "@/lib/auth-client";
import {
  Crown,
  LogOut,
  ExternalLink,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Star,
  Award,
  Trash2,
  X,
  Radio,
  SlidersHorizontal,
  Eye,
  Download,
  AlertTriangle,
  Send,
  Building,
  RefreshCw,
} from "lucide-react";

interface ThemeItem {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  imagePath: string;
}

interface SubmissionItem {
  id: string;
  themeId: string;
  theme: ThemeItem;
  participantName: string;
  participantEmail: string;
  title: string;
  description: string;
  originalFilename: string;
  fileUrl: string;
  fileSize: number;
  rating: number | null;
  feedback: string | null;
  status: "PENDING" | "REVIEWED" | "SHORTLISTED" | "WINNER";
  award: string | null;
  createdAt: string;
}

interface StatsData {
  totalSubmissions: number;
  pendingCount: number;
  reviewedCount: number;
  shortlistedCount: number;
  winnerCount: number;
  avgRating: number | null;
  areResultsPublished: boolean;
  publishedAt: string | null;
  resultsAnnouncement: string;
}

const AWARD_OPTIONS = [
  "",
  "1st Place • Sovereign Gold Laureate",
  "2nd Place • Crown Silver Laureate",
  "3rd Place • Royal Bronze Laureate",
  "Honourable Mention",
  "Best Architectural Reinterpretation",
  "Mastery of Historical Light & Atmosphere",
  "Creative Innovation Award",
];

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedThemeFilter, setSelectedThemeFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Review Modal
  const [reviewingItem, setReviewingItem] = useState<SubmissionItem | null>(null);
  const [inputRating, setInputRating] = useState<string>("");
  const [inputFeedback, setInputFeedback] = useState<string>("");
  const [inputStatus, setInputStatus] = useState<string>("REVIEWED");
  const [inputAward, setInputAward] = useState<string>("");
  const [savingReview, setSavingReview] = useState(false);

  // Publish Dialog
  const [announcementText, setAnnouncementText] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  // Image full view
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Auth gate check
  useEffect(() => {
    if (!sessionLoading) {
      if (!session?.user) {
        router.push("/login?redirect=/admin");
      } else if ((session.user as any).role !== "ADMIN") {
        router.push("/?error=unauthorized");
      }
    }
  }, [session, sessionLoading, router]);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [subsRes, statsRes, themesRes] = await Promise.all([
        fetch("/api/admin/submissions"),
        fetch("/api/admin/stats"),
        fetch("/api/themes"),
      ]);

      const [subsData, statsData, themesData] = await Promise.all([
        subsRes.json(),
        statsRes.json(),
        themesRes.json(),
      ]);

      if (subsData.success) setSubmissions(subsData.submissions || []);
      if (statsData.success) {
        setStats(statsData.stats);
        setAnnouncementText(statsData.stats.resultsAnnouncement || "");
      }
      if (themesData.success) setThemes(themesData.themes || []);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user && (session.user as any).role === "ADMIN") {
      fetchData();
    }
  }, [session]);

  // Open review modal
  const openReviewModal = (item: SubmissionItem) => {
    setReviewingItem(item);
    setInputRating(item.rating !== null ? item.rating.toString() : "8.5");
    setInputFeedback(item.feedback || "");
    setInputStatus(item.status || "REVIEWED");
    setInputAward(item.award || "");
  };

  // Save review
  const handleSaveReview = async () => {
    if (!reviewingItem) return;
    try {
      setSavingReview(true);
      const res = await fetch(`/api/admin/submissions/${reviewingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: inputRating ? parseFloat(inputRating) : null,
          feedback: inputFeedback,
          status: inputStatus,
          award: inputAward,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === reviewingItem.id ? data.submission : s))
        );
        setReviewingItem(null);
        // Refresh stats
        fetch("/api/admin/stats")
          .then((r) => r.json())
          .then((d) => d.success && setStats(d.stats));
      } else {
        alert(data.error || "Failed to update review.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving review");
    } finally {
      setSavingReview(false);
    }
  };

  // Delete submission
  const handleDeleteSubmission = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this submission?")) return;
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        if (reviewingItem?.id === id) setReviewingItem(null);
        fetch("/api/admin/stats")
          .then((r) => r.json())
          .then((d) => d.success && setStats(d.stats));
      } else {
        alert(data.error || "Failed to delete submission.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete submission");
    }
  };

  // Toggle publish results
  const handleTogglePublish = async (publish: boolean) => {
    if (
      publish &&
      !confirm(
        "Publishing will make all rated submissions and laureate awards visible to all public visitors. Are you ready to publish all results?"
      )
    ) {
      return;
    }

    try {
      setPublishing(true);
      const res = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          areResultsPublished: publish,
          resultsAnnouncement: announcementText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStats((prev) =>
          prev
            ? {
                ...prev,
                areResultsPublished: publish,
                publishedAt: publish ? new Date().toISOString() : null,
              }
            : null
        );
        setPublishMessage(
          publish
            ? "Results have been published live to the public!"
            : "Results have been unpublished and returned to draft mode."
        );
        setTimeout(() => setPublishMessage(null), 4000);
      } else {
        alert(data.error || "Failed to publish results.");
      }
    } catch (err) {
      console.error(err);
      alert("Error publishing results");
    } finally {
      setPublishing(false);
    }
  };

  if (sessionLoading || (!session?.user && loading)) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#0D1F3C]/20 border-t-[#0D1F3C] rounded-full animate-spin mb-4" />
        <p className="text-sm font-serif text-[#0D1F3C]">Verifying Royal Jury Credentials...</p>
      </div>
    );
  }

  // Filtered submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesTheme =
      selectedThemeFilter === "all" || sub.themeId === selectedThemeFilter;
    const matchesStatus =
      selectedStatusFilter === "all" || sub.status === selectedStatusFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      sub.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.participantEmail.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTheme && matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] pb-16">
      {/* Top Admin Header */}
      <header className="bg-white border-b border-[#E5DFD5] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0D1F3C] flex items-center justify-center text-[#C5A059] border border-[#C5A059] shadow-sm">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold text-[#0D1F3C]">
                  Royal Jury & Curator Administration
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#8C1D2F]/10 text-[#8C1D2F] font-semibold text-[10px] uppercase tracking-wider border border-[#8C1D2F]/20">
                  Admin Portal
                </span>
              </div>
              <p className="text-xs text-[#6B655D]">
                School of Architectural Design • COTD Britain 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4A453E] hover:text-[#0D1F3C] bg-[#FAF8F5] px-3 py-1.5 rounded-lg border border-[#E5DFD5] transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Public Website
            </Link>

            <button
              onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/login") } })}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Publish Message Banner */}
        {publishMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-sm flex items-center gap-3 shadow-sm animate-fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{publishMessage}</span>
          </div>
        )}

        {/* Executive Stats & Publish Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Metrics Cards */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E5DFD5] shadow-xs">
              <span className="text-[11px] font-semibold text-[#8C867D] uppercase tracking-wider block mb-1">
                Total Submissions
              </span>
              <span className="text-3xl font-serif font-bold text-[#0D1F3C]">
                {stats?.totalSubmissions ?? 0}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5DFD5] shadow-xs">
              <span className="text-[11px] font-semibold text-[#8C867D] uppercase tracking-wider block mb-1">
                Pending Review
              </span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-3xl font-serif font-bold text-amber-600">
                  {stats?.pendingCount ?? 0}
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5DFD5] shadow-xs">
              <span className="text-[11px] font-semibold text-[#8C867D] uppercase tracking-wider block mb-1">
                Reviewed / Scored
              </span>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-3xl font-serif font-bold text-emerald-700">
                  {stats?.reviewedCount ?? 0}
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5DFD5] shadow-xs">
              <span className="text-[11px] font-semibold text-[#8C867D] uppercase tracking-wider block mb-1">
                Average Rating
              </span>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-[#C5A059] fill-[#C5A059]" />
                <span className="text-3xl font-serif font-bold text-[#0D1F3C]">
                  {stats?.avgRating ? `${stats.avgRating}/10` : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Publication Control Card */}
          <div className="bg-white p-6 rounded-2xl border-2 border-[#C5A059]/40 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/5 rounded-bl-full pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0D1F3C] flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-[#C5A059]" />
                  Competition Publication
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    stats?.areResultsPublished
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-amber-50 text-amber-800 border-amber-300"
                  }`}
                >
                  {stats?.areResultsPublished ? "Live to Public" : "Draft (Hidden)"}
                </span>
              </div>

              <p className="text-xs text-[#5C564E] leading-relaxed mb-4">
                {stats?.areResultsPublished
                  ? "All rated submissions, scores, and laureate awards are published and live on the public website."
                  : "Results are currently hidden. Review entries, grade them, and publish all results at once whenever ready."}
              </p>

              <div className="mb-4">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B655D] mb-1">
                  Public Announcement Statement
                </label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="Official announcement displayed to visitors..."
                  className="w-full text-xs p-2 bg-[#FAF8F5] border border-[#E5DFD5] rounded-lg text-[#1A1A1A] focus:outline-none focus:border-[#0D1F3C]"
                />
              </div>
            </div>

            <div>
              {stats?.areResultsPublished ? (
                <button
                  onClick={() => handleTogglePublish(false)}
                  disabled={publishing}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-300 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {publishing ? "Updating..." : "Unpublish Results (Revert to Draft)"}
                </button>
              ) : (
                <button
                  onClick={() => handleTogglePublish(true)}
                  disabled={publishing}
                  className="w-full py-2.5 px-4 bg-[#0D1F3C] hover:bg-[#162E56] text-white text-xs font-semibold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4 text-[#C5A059]" />
                  {publishing ? "Publishing..." : "Publish All Results Live"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5DFD5] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#8C867D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search participant or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:outline-none focus:border-[#0D1F3C]"
              />
            </div>

            {/* Theme Filter */}
            <select
              value={selectedThemeFilter}
              onChange={(e) => setSelectedThemeFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl text-[#1A1A1A] focus:outline-none focus:border-[#0D1F3C]"
            >
              <option value="all">All Heritage Themes ({themes.length})</option>
              {themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl text-[#1A1A1A] focus:outline-none focus:border-[#0D1F3C]"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="WINNER">Winner / Laureate</option>
            </select>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs text-[#7A746B]">
              Showing {filteredSubmissions.length} of {submissions.length} entries
            </span>
            <button
              onClick={fetchData}
              title="Refresh"
              className="p-2 text-[#7A746B] hover:text-[#0D1F3C] hover:bg-[#FAF8F5] rounded-lg transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Submissions Grid */}
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-[#D5CDBD] p-12 text-center">
            <Building className="w-12 h-12 text-[#B8AFA0] mx-auto mb-3" />
            <h3 className="font-serif text-lg font-semibold text-[#0D1F3C]">
              No submissions found
            </h3>
            <p className="text-xs text-[#7A746B] max-w-sm mx-auto mt-1">
              {submissions.length === 0
                ? "No participants have submitted entries yet. Share the competition link with artists and creators."
                : "No submissions match your active filter criteria."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-[#E5DFD5] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Artwork Preview Image */}
                <div className="relative aspect-16/10 bg-[#FAF8F5] overflow-hidden border-b border-[#E5DFD5]">
                  <Image
                    src={sub.fileUrl}
                    alt={sub.title}
                    fill
                    className="object-cover group-hover:scale-103 transition-transform duration-300"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                    <button
                      onClick={() => setPreviewImage(sub.fileUrl)}
                      className="px-2.5 py-1 bg-white/90 hover:bg-white text-[#0D1F3C] rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm backdrop-blur-xs transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Full Artwork
                    </button>
                    <a
                      href={sub.fileUrl}
                      download={sub.originalFilename}
                      className="p-1.5 bg-white/90 hover:bg-white text-[#0D1F3C] rounded-lg shadow-sm transition"
                      title="Download artwork"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Rating / Award Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {sub.award && (
                      <span className="bg-[#C5A059] text-[#0D1F3C] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Laureate
                      </span>
                    )}
                    {sub.rating !== null ? (
                      <span className="bg-[#0D1F3C] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#C5A059] fill-[#C5A059]" />
                        {sub.rating}/10
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-300">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Theme Tag */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/95 backdrop-blur-xs text-[#0D1F3C] text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs border border-[#E5DFD5]">
                      {sub.theme.title}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#0D1F3C] line-clamp-1 mb-1">
                      {sub.title}
                    </h4>
                    <p className="text-xs text-[#5A554E] line-clamp-2 mb-3">
                      {sub.description || "No statement provided by the participant."}
                    </p>

                    <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E5DFD5] text-xs space-y-1 mb-4">
                      <div className="flex justify-between">
                        <span className="text-[#8C867D]">Participant:</span>
                        <span className="font-medium text-[#1A1A1A]">{sub.participantName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8C867D]">Contact:</span>
                        <span className="text-[#4A453E] truncate max-w-[180px]">
                          {sub.participantEmail}
                        </span>
                      </div>
                      {sub.feedback && (
                        <div className="pt-1.5 border-t border-[#E5DFD5] text-[11px] text-[#554E45] italic">
                          "{sub.feedback}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#E5DFD5]">
                    <button
                      onClick={() => openReviewModal(sub)}
                      className="flex-1 py-2 px-3 bg-[#0D1F3C] hover:bg-[#162E56] text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#C5A059]" />
                      {sub.rating !== null ? "Edit Review & Score" : "Grade & Review"}
                    </button>
                    <button
                      onClick={() => handleDeleteSubmission(sub.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition border border-red-200 cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Review Modal */}
      {reviewingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#E5DFD5] shadow-2xl overflow-hidden my-8 animate-scale-in">
            {/* Modal Header */}
            <div className="p-6 bg-[#0D1F3C] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-[#C5A059] uppercase tracking-widest block mb-1">
                  Royal Adjudication Panel
                </span>
                <h3 className="font-serif text-xl font-bold">
                  Evaluating: {reviewingItem.title}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Participant: {reviewingItem.participantName} ({reviewingItem.participantEmail})
                </p>
              </div>
              <button
                onClick={() => setReviewingItem(null)}
                className="p-2 text-slate-400 hover:text-white rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
              {/* Left Column: Visual Showcase */}
              <div className="space-y-4">
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-[#E5DFD5] bg-[#FAF8F5]">
                  <Image
                    src={reviewingItem.fileUrl}
                    alt={reviewingItem.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs">
                    Participant's Artwork
                  </div>
                  <button
                    onClick={() => setPreviewImage(reviewingItem.fileUrl)}
                    className="absolute bottom-2 right-2 p-1.5 bg-white/90 hover:bg-white text-[#0D1F3C] rounded-lg shadow-sm text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Fullscreen
                  </button>
                </div>

                {/* Compare with original theme image */}
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DFD5]">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 relative rounded-lg overflow-hidden shrink-0 border border-[#E5DFD5]">
                      <Image
                        src={reviewingItem.theme.imagePath}
                        alt={reviewingItem.theme.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-[#8C867D] uppercase font-semibold">
                        Base Heritage Theme
                      </span>
                      <h5 className="font-serif text-xs font-bold text-[#0D1F3C] truncate">
                        {reviewingItem.theme.title}
                      </h5>
                      <p className="text-[11px] text-[#5A554E] truncate">
                        {reviewingItem.theme.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8C867D] uppercase tracking-wider mb-1">
                    Participant Statement
                  </label>
                  <p className="text-xs text-[#3C3730] bg-[#FAF8F5] p-3 rounded-xl border border-[#E5DFD5] leading-relaxed max-h-28 overflow-y-auto">
                    {reviewingItem.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Right Column: Grading & Review Inputs */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Rating Score */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#0D1F3C] flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-[#C5A059] fill-[#C5A059]" />
                        Jury Score (1.0 to 10.0)
                      </label>
                      <span className="text-sm font-bold font-serif text-[#0D1F3C] px-2 py-0.5 bg-[#FAF4E8] border border-[#E2C98F] rounded-md">
                        {inputRating || "0.0"} / 10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="10.0"
                      step="0.1"
                      value={inputRating || "5.0"}
                      onChange={(e) => setInputRating(e.target.value)}
                      className="w-full accent-[#0D1F3C] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#8C867D] mt-1">
                      <span>1.0 (Basic)</span>
                      <span>5.0 (Competent)</span>
                      <span>8.0 (Commended)</span>
                      <span>10.0 (Masterwork)</span>
                    </div>
                  </div>

                  {/* Laureate Award Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0D1F3C] mb-1.5 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#C5A059]" />
                      Official Award / Laureate Title
                    </label>
                    <select
                      value={inputAward}
                      onChange={(e) => setInputAward(e.target.value)}
                      className="w-full p-2.5 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl text-[#1A1A1A] focus:outline-none focus:border-[#0D1F3C]"
                    >
                      <option value="">No Special Award</option>
                      {AWARD_OPTIONS.filter(Boolean).map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0D1F3C] mb-1.5">
                      Submission Status
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { key: "PENDING", label: "Pending" },
                        { key: "REVIEWED", label: "Reviewed" },
                        { key: "SHORTLISTED", label: "Shortlisted" },
                        { key: "WINNER", label: "Winner" },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setInputStatus(item.key)}
                          className={`py-2 px-3 rounded-xl border text-center font-medium transition cursor-pointer ${
                            inputStatus === item.key
                              ? "bg-[#0D1F3C] text-white border-[#0D1F3C]"
                              : "bg-[#FAF8F5] text-[#5A554E] border-[#E5DFD5] hover:bg-[#F4EFE6]"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback / Jury Commendation */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0D1F3C] mb-1.5">
                      Curatorial Commendation & Feedback
                    </label>
                    <textarea
                      rows={3}
                      value={inputFeedback}
                      onChange={(e) => setInputFeedback(e.target.value)}
                      placeholder="Add official commentary on composition, architectural understanding, and creative interpretation..."
                      className="w-full p-3 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl text-[#1A1A1A] focus:outline-none focus:border-[#0D1F3C] leading-relaxed"
                    />
                  </div>
                </div>

                {/* Footer Save Button */}
                <div className="pt-4 border-t border-[#E5DFD5] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewingItem(null)}
                    className="px-4 py-2 text-xs font-semibold text-[#5A554E] hover:text-[#0D1F3C] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveReview}
                    disabled={savingReview}
                    className="px-6 py-2.5 bg-[#0D1F3C] hover:bg-[#162E56] text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    {savingReview ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-[#C5A059]" />
                        <span>Save Evaluation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Artwork Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <Image
              src={previewImage}
              alt="High-resolution view"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
