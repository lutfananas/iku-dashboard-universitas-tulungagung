"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GraduationCap, Briefcase, Trophy, Handshake, Globe, Wallet, Users,
  BarChart3, ChevronRight, ChevronDown, Building2, Calendar, BookOpen,
  Save, CheckCircle2, AlertCircle, Plus, Trash2, RotateCcw, Info, Calculator,
  ShieldCheck, Target, FileText, TrendingUp, Award, AlertTriangle, CircleCheck, CircleX, CircleDot,
  Menu, X
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  FAKULTAS_LIST, ALL_PRODI, getProdiById, getFakultasById, getProdiByFakultas,
  IKU_LIST, IKU_FIELDS, type IkuId,
} from "@/lib/iku-config";
import {
  calcAEE_Realisation, calcAEE_AchievementRate, calcAEE_PT,
  calcIKU2, calcIKU2_Aggregate, calcIKU3, calcIKU3_Aggregate, calcIKU3_KomponenA, calcIKU3_KomponenB,
  calcIKU5, calcIKU5_Aggregate, calcIKU7, calcIKU7_Aggregate,
  calcIKU9, calcIKU9_Aggregate, calcIKU12_Skor, calcIKU12_Aggregate,
  calcIKU12_DokumenSummary, hasData,
} from "@/lib/iku-calculations";
import type { Iku1Data, Iku2Data, Iku3Data, Iku5Data, Iku7Data, Iku9Data, Iku12Data } from "@/lib/iku-calculations";

// ============ COLORS ============
const PRIMARY = "#B91C1C";       // Deep crimson
const PRIMARY_DARK = "#8B1A1A";  // Darker crimson
const SECONDARY = "#1E40AF";     // Royal blue
const SECONDARY_DARK = "#1E3A5F";// Darker royal blue
const GOLD = "#D4A843";          // Gold accent
const NAVY = "#0F172A";          // Dark sidebar base
const NAVY_LIGHT = "#1E293B";    // Dark sidebar lighter
const TEAL = "#059669";          // Emerald/teal for success
const CORAL = "#DB2777";         // Pink for alerts
const CHART_COLORS = ["#B91C1C", "#1E40AF", "#D4A843", "#059669", "#7C3AED", "#DB2777", "#0891B2"];

// IKU-specific colors for KPI cards
const IKU_COLORS: Record<string, string> = {
  iku1: "#B91C1C",  // Crimson
  iku2: "#1E40AF",  // Royal blue
  iku3: "#D4A843",  // Gold
  iku5: "#059669",  // Emerald
  iku7: "#7C3AED",  // Violet
  iku9: "#0891B2",  // Cyan
  iku12: "#DB2777", // Pink
};

// ============ TYPES ============
type ViewMode = "global" | "fakultas" | "prodi";
interface NavSelection { mode: ViewMode; id: string; }

interface IkuRecord {
  id: string;
  prodi: string;
  fakultas: string;
  tahun: number;
  iku1: Iku1Data | null;
  iku2: Iku2Data | null;
  iku3: Iku3Data | null;
  iku5: Iku5Data | null;
  iku7: Iku7Data | null;
  iku9: Iku9Data | null;
  iku12: Iku12Data | null;
}

// ============ MAIN COMPONENT ============
export default function IKUDashboard() {
  const [navSelection, setNavSelection] = useState<NavSelection>({ mode: "global", id: "global" });
  const [tahun, setTahun] = useState(2025);
  const [allData, setAllData] = useState<IkuRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFakultas, setExpandedFakultas] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form state for current prodi+tahun
  const [formData, setFormData] = useState<Record<string, Record<string, number | string>>>({});

  // localStorage key
  const STORAGE_KEY = "iku-unita-data";

  // Load data from localStorage
  const loadDataFromStorage = useCallback((): IkuRecord[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("localStorage read error:", e);
    }
    return [];
  }, []);

  // Save data to localStorage
  const saveDataToStorage = useCallback((data: IkuRecord[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("localStorage write error:", e);
    }
  }, []);

  // Fetch data (localStorage primary, API fallback)
  const fetchData = useCallback(async () => {
    try {
      // Try API first
      const res = await fetch(`/api/iku?tahun=${tahun}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAllData(data);
          saveDataToStorage(data);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error("API fetch error:", e);
    }

    // Fallback to localStorage
    const stored = loadDataFromStorage();
    const filtered = stored.filter((d: IkuRecord) => d.tahun === tahun);
    if (filtered.length > 0) {
      setAllData(filtered);
    } else {
      // Use all stored data (cross-year)
      setAllData(stored);
    }
    setLoading(false);
  }, [tahun, saveDataToStorage, loadDataFromStorage]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Get data for a specific prodi
  const getProdiData = useCallback((prodiId: string): IkuRecord | undefined => {
    return allData.find((d) => d.prodi === prodiId);
  }, [allData]);

  // Initialize form data when prodi/tahun changes
  useEffect(() => {
    if (navSelection.mode !== "prodi") return;
    const prodiData = getProdiData(navSelection.id);
    const newFormData: Record<string, Record<string, number | string>> = {};

    IKU_LIST.forEach((iku) => {
      const existingData = prodiData?.[iku.id as keyof IkuRecord] as Record<string, unknown> | null;
      const fields = IKU_FIELDS[iku.id];
      const ikuFormData: Record<string, number | string> = {};
      fields.forEach((field) => {
        if (existingData && existingData[field.key] !== undefined && existingData[field.key] !== null) {
          ikuFormData[field.key] = existingData[field.key] as number | string;
        } else {
          ikuFormData[field.key] = field.defaultValue ?? (field.type === "number" ? 0 : "");
        }
      });
      newFormData[iku.id] = ikuFormData;
    });

    setFormData(newFormData);
  }, [navSelection, tahun, allData, getProdiData]);

  // Save handler (localStorage primary, API sync)
  const handleSave = async (ikuId: string) => {
    if (navSelection.mode !== "prodi") return;
    const prodi = getProdiById(navSelection.id);
    if (!prodi) return;

    setSaving(ikuId);
    try {
      // Update local state immediately
      const existingIdx = allData.findIndex((d) => d.prodi === prodi.id && d.tahun === tahun);
      const ikuData = formData[ikuId];

      let updatedData: IkuRecord[];
      if (existingIdx >= 0) {
        updatedData = [...allData];
        updatedData[existingIdx] = { ...updatedData[existingIdx], [ikuId]: ikuData };
      } else {
        const newRecord: IkuRecord = {
          id: `local-${Date.now()}`,
          prodi: prodi.id,
          fakultas: prodi.fakultasId,
          tahun,
          iku1: null, iku2: null, iku3: null, iku5: null, iku7: null, iku9: null, iku12: null,
          [ikuId]: ikuData,
        };
        updatedData = [...allData, newRecord];
      }

      setAllData(updatedData);
      saveDataToStorage(updatedData);
      setSaveSuccess(ikuId);
      setTimeout(() => setSaveSuccess(null), 2000);
      toast.success("Data berhasil disimpan", { description: `${IKU_LIST.find((i) => i.id === ikuId)?.label} - ${prodi.nama} (${tahun})` });

      // Try API sync in background (non-blocking)
      fetch("/api/iku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prodi: prodi.id,
          fakultas: prodi.fakultasId,
          tahun,
          ikuId,
          data: ikuData,
        }),
      }).catch(() => { /* API sync failed silently - data is safe in localStorage */ });
    } catch (e) {
      console.error("Save error:", e);
    } finally {
      setSaving(null);
    }
  };

  // Form input change
  const handleFormChange = (ikuId: string, key: string, value: number | string) => {
    setFormData((prev) => ({
      ...prev,
      [ikuId]: { ...prev[ikuId], [key]: value },
    }));
  };

  // Toggle fakultas expansion
  const toggleFakultas = (fakultasId: string) => {
    setExpandedFakultas((prev) => {
      const next = new Set(prev);
      if (next.has(fakultasId)) next.delete(fakultasId);
      else next.add(fakultasId);
      return next;
    });
  };

  // ============ CALCULATION HELPERS ============
  const calcProdiValue = (ikuId: string, prodiId: string): number => {
    const prodiData = getProdiData(prodiId);
    if (!prodiData) return 0;
    const data = prodiData[ikuId as keyof IkuRecord];
    if (!data || !hasData(data as Record<string, unknown>)) return 0;

    const prodi = getProdiById(prodiId);
    switch (ikuId) {
      case "iku1": return calcAEE_Realisation(data as Iku1Data);
      case "iku2": return calcIKU2(data as Iku2Data);
      case "iku3": return calcIKU3(data as Iku3Data);
      case "iku5": return calcIKU5(data as Iku5Data);
      case "iku7": return calcIKU7(data as Iku7Data);
      case "iku9": return calcIKU9(data as Iku9Data);
      case "iku12": return calcIKU12_Skor(data as Iku12Data);
      default: return 0;
    }
  };

  const calcAggregatedValue = (ikuId: string, prodiIds: string[]): number => {
    if (prodiIds.length === 0) return 0;

    // Hitung skor individu setiap prodi (yang belum isi = 0)
    const scores = prodiIds.map((pid) => calcProdiValue(ikuId, pid));

    // Rata-rata dari SEMUA prodi (prodi tanpa data otomatis 0)
    return scores.reduce((a, b) => a + b, 0) / prodiIds.length;
  };

  // Hitung berapa prodi yang sudah mengisi data untuk IKU tertentu
  const getIkuCoverage = (ikuId: string, prodiIds: string[]): { filled: number; total: number } => {
    const filled = prodiIds.filter((pid) => calcProdiValue(ikuId, pid) > 0).length;
    return { filled, total: prodiIds.length };
  };

  const getProdiHasData = (prodiId: string): boolean => {
    const d = getProdiData(prodiId);
    if (!d) return false;
    return IKU_LIST.some((iku) => d[iku.id as keyof IkuRecord] !== null && hasData(d[iku.id as keyof IkuRecord] as Record<string, unknown>));
  };

  const getFakultasHasData = (fakultasId: string): boolean => {
    return getProdiByFakultas(fakultasId).some((p) => getProdiHasData(p.id));
  };

  // ============ RENDER: SIDEBAR ============
  const renderSidebar = () => (
    <aside className="w-64 lg:w-72 shrink-0 sidebar-pattern overflow-y-auto custom-scrollbar" style={{ background: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)" }}>
      {/* University Header with Logo */}
      <div className="p-5 text-center border-b border-white/10">
        <div className="flex justify-center mb-3">
          <div className="w-[60px] h-[60px] rounded-xl bg-white/10 p-1.5 flex items-center justify-center backdrop-blur-sm border border-white/10">
            <img src="/logo-unita.png" alt="UNITA" className="w-full h-full object-contain" />
          </div>
        </div>
        <h2 className="font-bold text-sm text-white tracking-wide">UNIVERSITAS TULUNGAGUNG</h2>
        <p className="text-[11px] mt-1 font-semibold" style={{ color: GOLD }}>Dashboard IKU</p>
      </div>

      {/* Year Selector */}
      <div className="p-3 border-b border-white/10">
        <Label className="text-[10px] font-medium text-white/40 mb-1.5 block uppercase tracking-widest">Tahun Akademik</Label>
        <Select value={tahun.toString()} onValueChange={(v) => setTahun(parseInt(v))}>
          <SelectTrigger className="h-9 text-sm border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-white/50" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation Tree */}
      <nav className="p-2">
        {/* Global */}
        <button
          onClick={() => { setNavSelection({ mode: "global", id: "global" }); setMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            navSelection.mode === "global"
              ? "text-white shadow-lg"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
          style={navSelection.mode === "global" ? { background: "linear-gradient(135deg, #B91C1C, #8B1A1A)", boxShadow: "0 4px 15px rgba(185,28,28,0.3)" } : {}}
        >
          <BarChart3 className="w-4 h-4 shrink-0" />
          <span>Global Universitas</span>
          {allData.length > 0 && (
            <Badge className="ml-auto text-[10px] px-1.5 py-0" style={{ backgroundColor: "rgba(5,150,105,0.8)", color: "white" }}>
              {allData.filter((d) => IKU_LIST.some((iku) => d[iku.id as keyof IkuRecord] !== null && hasData(d[iku.id as keyof IkuRecord] as Record<string, unknown>))).length} prodi
            </Badge>
          )}
        </button>

        <Separator className="my-2 bg-white/10" />

        {/* Fakultas List */}
        {FAKULTAS_LIST.map((fakultas) => {
          const isExpanded = expandedFakultas.has(fakultas.id);
          const isSelected = navSelection.mode === "fakultas" && navSelection.id === fakultas.id;
          const hasD = getFakultasHasData(fakultas.id);

          return (
            <div key={fakultas.id} className="mb-0.5">
              <button
                onClick={() => {
                  toggleFakultas(fakultas.id);
                  setNavSelection({ mode: "fakultas", id: fakultas.id });
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                  isSelected ? "text-white bg-white/10 font-semibold" : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate flex-1 text-left">{fakultas.nama.replace("Fakultas ", "F. ")}</span>
                {hasD && <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: TEAL }} />}
              </button>

              {isExpanded && (
                <div className="ml-4 mt-0.5 space-y-0.5 pl-2 border-l border-white/10">
                  {fakultas.prodiList.map((prodi) => {
                    const isProdiSelected = navSelection.mode === "prodi" && navSelection.id === prodi.id;
                    const prodiHasD = getProdiHasData(prodi.id);
                    return (
                      <button
                        key={prodi.id}
                        onClick={() => { setNavSelection({ mode: "prodi", id: prodi.id }); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 ${
                          isProdiSelected
                            ? "text-white font-medium"
                            : "text-white/40 hover:text-white hover:bg-white/5"
                        }`}
                        style={isProdiSelected ? { background: "linear-gradient(135deg, #1E40AF, #1E3A5F)", boxShadow: "0 2px 10px rgba(30,64,175,0.3)" } : {}}
                      >
                        <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate flex-1 text-left">{prodi.nama}</span>
                        {prodiHasD && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: TEAL }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );

  // ============ RENDER: IKU FORM FOR PRODI ============
  const renderProdiForm = () => {
    const prodi = getProdiById(navSelection.id);
    if (!prodi) return null;
    const fakultas = getFakultasById(prodi.fakultasId);

    return (
      <div className="space-y-6">
        {/* Header */}
        <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-xl" style={{ borderTop: `3px solid ${PRIMARY}` }}>
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold gradient-text">{prodi.nama}</h2>
                <p className="text-sm text-slate-500">{fakultas?.nama} • Tahun Akademik {tahun}</p>
              </div>
              <Badge className="w-fit text-xs border-0 font-bold" style={{ background: "linear-gradient(135deg, #1E40AF, #1E3A5F)", color: "white" }}>{prodi.jenjang}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* IKU Tabs */}
        <Tabs defaultValue="iku1" className="space-y-4">
          <TabsList className="iku-tabs w-full flex h-auto p-1.5 rounded-xl gap-1 overflow-x-auto" style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.05), rgba(30,41,59,0.08))" }}>
            {IKU_LIST.map((iku) => (
              <TabsTrigger key={iku.id} value={iku.id} className="text-xs font-semibold px-3 py-2 rounded-lg whitespace-nowrap data-[state=active]:shadow-lg transition-all duration-200" style={{ color: IKU_COLORS[iku.id] }}>
                {iku.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {IKU_LIST.map((iku) => {
            const fields = IKU_FIELDS[iku.id];
            const currentData = formData[iku.id] || {};
            const isSaving = saving === iku.id;
            const isSuccess = saveSuccess === iku.id;

            // Calculate preview
            let previewValue = 0;
            let previewLabel = "";
            try {
              switch (iku.id) {
                case "iku1": {
                  const d = currentData as unknown as Iku1Data;
                  previewValue = calcAEE_Realisation(d);
                  previewLabel = `AEE Realisasi: ${previewValue.toFixed(2)}% | Tingkat Pencapaian: ${calcAEE_AchievementRate(d, prodi.jenjang).toFixed(2)}%`;
                  break;
                }
                case "iku2": {
                  previewValue = calcIKU2(currentData as unknown as Iku2Data);
                  previewLabel = `Persentase: ${previewValue.toFixed(2)}%`;
                  break;
                }
                case "iku3": {
                  previewValue = calcIKU3(currentData as unknown as Iku3Data);
                  previewLabel = `Persentase: ${previewValue.toFixed(2)}%`;
                  break;
                }
                case "iku5": {
                  previewValue = calcIKU5(currentData as unknown as Iku5Data);
                  previewLabel = `Persentase: ${previewValue.toFixed(2)}%`;
                  break;
                }
                case "iku7": {
                  previewValue = calcIKU7(currentData as unknown as Iku7Data);
                  previewLabel = `Persentase: ${previewValue.toFixed(2)}%`;
                  break;
                }
                case "iku9": {
                  previewValue = calcIKU9(currentData as unknown as Iku9Data);
                  previewLabel = `Persentase: ${previewValue.toFixed(2)}%`;
                  break;
                }
                case "iku12": {
                  previewValue = calcIKU12_Skor(currentData as unknown as Iku12Data);
                  previewLabel = `Skor: ${previewValue.toFixed(2)}`;
                  break;
                }
              }
            } catch { /* empty */ }

            return (
              <TabsContent key={iku.id} value={iku.id} className="mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Input Form */}
                  <Card className="lg:col-span-2 glass-card overflow-hidden transition-all duration-300 hover:shadow-xl">
                    <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${IKU_COLORS[iku.id]}, ${IKU_COLORS[iku.id]}88)` }} />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold" style={{ color: IKU_COLORS[iku.id] }}>{iku.title}</CardTitle>
                      <CardDescription className="text-xs">Masukkan data untuk {prodi.nama} tahun {tahun}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {iku.id === "iku1" && (
                        <div className="rounded-lg p-3 mb-3 border-l-4" style={{ background: `linear-gradient(135deg, ${IKU_COLORS[iku.id]}08, ${IKU_COLORS[iku.id]}03)`, borderLeftColor: IKU_COLORS[iku.id] }}>
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: IKU_COLORS[iku.id] }} />
                            <div className="text-xs text-slate-600">
                              <p className="font-semibold mb-1" style={{ color: IKU_COLORS[iku.id] }}>Rumus IKU 1 (AEE PT):</p>
                              <p>AEE Realisasi = (Lulusan Tepat Waktu / Total Mahasiswa) × 100%</p>
                              <p>Tingkat Pencapaian = (AEE Realisasi / AEE Ideal) × 100%</p>
                              <p>AEE Ideal {prodi.jenjang} = {(() => { const v = { D3: 33, D4: 25, S1: 25, S2: 50, S3: 33 } as Record<string, number>; return v[prodi.jenjang] || 25; })()}%</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {iku.id === "iku2" && (
                        <div className="rounded-lg p-3 mb-3 border-l-4" style={{ background: `linear-gradient(135deg, ${IKU_COLORS[iku.id]}08, ${IKU_COLORS[iku.id]}03)`, borderLeftColor: IKU_COLORS[iku.id] }}>
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: IKU_COLORS[iku.id] }} />
                            <div className="text-xs text-slate-600">
                              <p className="font-semibold mb-1" style={{ color: IKU_COLORS[iku.id] }}>Rumus IKU 2:</p>
                              <p>Persentase = Σ(n × k) / t × 100%</p>
                              <p>n: Jumlah lulusan per kategori; k: Konstanta bobot; t: Total responden</p>
                              <p className="mt-1 text-slate-500">Pastikan setiap lulusan hanya tercatat di 1 kategori (tidak tumpang tindih)</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {iku.id === "iku3" && (
                        <div className="rounded-lg p-3 mb-3 border-l-4" style={{ background: `linear-gradient(135deg, ${IKU_COLORS[iku.id]}08, ${IKU_COLORS[iku.id]}03)`, borderLeftColor: IKU_COLORS[iku.id] }}>
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: IKU_COLORS[iku.id] }} />
                            <div className="text-xs text-slate-600">
                              <p className="font-semibold mb-1" style={{ color: IKU_COLORS[iku.id] }}>Rumus IKU 3 (2 Komponen Terakumulasi):</p>
                              <p className="font-medium" style={{ color: IKU_COLORS[iku.id] }}>Komponen A — Mobilitas Akademik:</p>
                              <p>A = (n₁ × k₁) / t × 100% &nbsp;|&nbsp; n₁: ≥10 SKS di luar prodi, k₁ = 1.0</p>
                              <p className="font-medium mt-1" style={{ color: IKU_COLORS[iku.id] }}>Komponen B — Prestasi:</p>
                              <p>B = Σ(nᵢ × kᵢ) / t × 100%</p>
                              <p>n₂: Juara Nasional, k₂ = 0.6 &nbsp;|&nbsp; n₃: Juara Provinsi, k₃ = 0.3</p>
                              <Separator className="my-1.5" />
                              <p className="font-semibold" style={{ color: IKU_COLORS[iku.id] }}>Total IKU 3 = Komponen A + Komponen B</p>
                              <p className="mt-1 text-slate-500">Komponen A &amp; B dihitung terpisah — mahasiswa yang ambil SKS luar prodi sekaligus berprestasi dihitung di kedua komponen.</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {iku.id === "iku5" && (
                        <div className="rounded-lg p-3 mb-3 border-l-4" style={{ background: `linear-gradient(135deg, ${IKU_COLORS[iku.id]}08, ${IKU_COLORS[iku.id]}03)`, borderLeftColor: IKU_COLORS[iku.id] }}>
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: IKU_COLORS[iku.id] }} />
                            <div className="text-xs text-slate-600">
                              <p className="font-semibold mb-1" style={{ color: IKU_COLORS[iku.id] }}>Rumus IKU 5 (Level Prodi):</p>
                              <p>Persentase = Luaran Hasil Kerjasama Prodi / Total Kerjasama Prodi × 100%</p>
                              <p className="mt-1 text-slate-500">Isi data kerjasama prodi ini. Rasio universitas dihitung otomatis di Global Universitas.</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {iku.id === "iku7" && (
                        <div className="rounded-lg p-3 mb-3 border-l-4" style={{ background: `linear-gradient(135deg, ${IKU_COLORS[iku.id]}08, ${IKU_COLORS[iku.id]}03)`, borderLeftColor: IKU_COLORS[iku.id] }}>
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: IKU_COLORS[iku.id] }} />
                            <div className="text-xs text-slate-600">
                              <p className="font-semibold mb-1" style={{ color: IKU_COLORS[iku.id] }}>Rumus IKU 7 (Level Prodi):</p>
                              <p>Persentase = Program SDGs Prodi / Total Program SDGs Prodi × 100%</p>
                              <p className="mt-1 text-slate-500">Isi data SDGs prodi ini. Rasio universitas dihitung otomatis di Global Universitas.</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {iku.id === "iku9" && (
                        <div className="rounded-lg p-3 mb-3 border-l-4" style={{ background: `linear-gradient(135deg, ${IKU_COLORS[iku.id]}08, ${IKU_COLORS[iku.id]}03)`, borderLeftColor: IKU_COLORS[iku.id] }}>
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: IKU_COLORS[iku.id] }} />
                            <div className="text-xs text-slate-600">
                              <p className="font-semibold mb-1" style={{ color: IKU_COLORS[iku.id] }}>Rumus IKU 9 (Level Prodi):</p>
                              <p>Persentase = Pendapatan Non-Akademik Prodi / Total Pendapatan Prodi × 100%</p>
                              <p className="mt-1 text-slate-500">Isi data pendapatan prodi ini. Rasio universitas dihitung otomatis di Global Universitas.</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {iku.id === "iku12" && (
                        <div className="rounded-lg p-3 mb-3 border-l-4" style={{ background: `linear-gradient(135deg, ${IKU_COLORS[iku.id]}08, ${IKU_COLORS[iku.id]}03)`, borderLeftColor: IKU_COLORS[iku.id] }}>
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: IKU_COLORS[iku.id] }} />
                            <div className="text-xs text-slate-600">
                              <p className="font-semibold mb-1" style={{ color: IKU_COLORS[iku.id] }}>Rumus IKU 12:</p>
                              <p>Capaian = Ketersediaan Dokumen Perencanaan Strategis Kesejahteraan Dosen</p>
                              <p className="mt-1 text-slate-500">Syarat validasi: AA ≥1,5× UMP; Lektor ≥3× UMP; Lektor Kepala ≥4× UMP; Profesor ≥6× UMP</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {fields.map((field) => (
                        <div key={field.key} className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`${iku.id}-${field.key}`} className="text-sm font-medium text-slate-700">
                              {field.label}
                            </Label>
                            {field.helperText && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-slate-400" /></TooltipTrigger>
                                  <TooltipContent className="max-w-xs"><p className="text-xs">{field.helperText}</p></TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          {field.type === "select" ? (
                            <Select
                              value={(currentData[field.key] as string) || ""}
                              onValueChange={(v) => handleFormChange(iku.id, field.key, v)}
                            >
                              <SelectTrigger className="h-9 text-sm rounded-lg border-slate-200 focus:ring-2 transition-shadow" style={{ '--tw-ring-color': `${IKU_COLORS[iku.id]}40` } as React.CSSProperties}>
                                <SelectValue placeholder="Pilih..." />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              id={`${iku.id}-${field.key}`}
                              type="number"
                              value={currentData[field.key] ?? 0}
                              onChange={(e) => handleFormChange(iku.id, field.key, parseFloat(e.target.value) || 0)}
                              placeholder={field.placeholder}
                              min={field.min}
                              step={field.step ?? 1}
                              className="h-9 text-sm rounded-lg border-slate-200 transition-shadow"
                            />
                          )}
                        </div>
                      ))}

                      <Separator className="my-4" />

                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => handleSave(iku.id)}
                          disabled={isSaving}
                          className="text-white text-sm border-0 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                          style={{ background: `linear-gradient(135deg, ${IKU_COLORS[iku.id]}, ${IKU_COLORS[iku.id]}cc)` }}
                        >
                          {isSaving ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Menyimpan...</>
                          ) : isSuccess ? (
                            <><CheckCircle2 className="w-4 h-4 mr-2" />Tersimpan!</>
                          ) : (
                            <><Save className="w-4 h-4 mr-2" />Simpan Data</>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Calculation Preview */}
                  <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-xl">
                    <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${IKU_COLORS[iku.id]}88, ${IKU_COLORS[iku.id]})` }} />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: IKU_COLORS[iku.id] }}>
                        <Calculator className="w-4 h-4" />
                        Hasil Perhitungan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-4">
                        <p className="text-4xl font-bold gradient-text">{previewValue.toFixed(1)}%</p>
                        <p className="text-xs text-slate-500 mt-2">{iku.id === "iku1" ? "AEE Realisasi" : iku.shortTitle}</p>
                        {iku.id === "iku1" && (
                          <p className="text-xs text-slate-400 mt-1">TP: {calcAEE_AchievementRate(currentData as unknown as Iku1Data, prodi.jenjang).toFixed(1)}%</p>
                        )}
                      </div>
                      <Separator className="my-3" />
                      <div className="space-y-2 text-xs">
                        {iku.id === "iku1" && (() => {
                          const d = currentData as unknown as Iku1Data;
                          const aeeReal = calcAEE_Realisation(d);
                          const aeeIdeal = { D3: 33, D4: 25, S1: 25, S2: 50, S3: 33 } as Record<string, number>;
                          const ideal = aeeIdeal[prodi.jenjang] || 25;
                          return (
                            <>
                              <div className="flex justify-between"><span className="text-slate-500">AEE Realisasi:</span><span className="font-bold text-slate-700">{aeeReal.toFixed(2)}%</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">AEE Ideal ({prodi.jenjang}):</span><span className="font-medium">{ideal}%</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Tingkat Pencapaian:</span><span className="font-medium">{calcAEE_AchievementRate(d, prodi.jenjang).toFixed(2)}%</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Total Mahasiswa Terdaftar:</span><span className="font-medium">{d.jumlahMasuk || 0}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Lulus Tepat Waktu:</span><span className="font-medium">{d.lulusTepatWaktu || 0}</span></div>
                            </>
                          );
                        })()}
                        {iku.id === "iku2" && (() => {
                          const d = currentData as unknown as Iku2Data;
                          const weighted = d.bekerjaJumlah * d.bekerjaBobot + d.wirausahaJumlah * d.wirausahaBobot + d.studiJumlah * (d.studiBobot || 0.6);
                          return (
                            <>
                              <div className="flex justify-between"><span className="text-slate-500">Σ(n₁ × k₁) Bekerja:</span><span className="font-medium">{(d.bekerjaJumlah * d.bekerjaBobot).toFixed(1)}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Σ(n₂ × k₂) Wirausaha:</span><span className="font-medium">{(d.wirausahaJumlah * d.wirausahaBobot).toFixed(1)}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Σ(n₃ × k₃) Studi:</span><span className="font-medium">{(d.studiJumlah * (d.studiBobot || 0.6)).toFixed(1)}</span></div>
                              <Separator className="my-1" />
                              <div className="flex justify-between"><span className="text-slate-500">Total Σ(n × k):</span><span className="font-medium">{weighted.toFixed(1)}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Total Responden (t):</span><span className="font-medium">{d.totalResponden || 0}</span></div>
                            </>
                          );
                        })()}
                        {iku.id === "iku3" && (() => {
                          const d = currentData as unknown as Iku3Data;
                          const kompA = calcIKU3_KomponenA(d);
                          const kompB = calcIKU3_KomponenB(d);
                          return (
                            <>
                              <p className="text-xs font-semibold text-slate-700 mt-1">Komponen A — Mobilitas:</p>
                              <div className="flex justify-between"><span className="text-slate-500">Mhs Luar Prodi (n₁):</span><span className="font-medium">{d.mhsLuarProdi || 0}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">× Bobot k₁:</span><span className="font-medium">1.0</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">÷ Total Mahasiswa (t):</span><span className="font-medium">{d.totalMahasiswa || 0}</span></div>
                              <div className="flex justify-between font-medium"><span className="text-slate-700">Komponen A:</span><span className="text-slate-700">{kompA.toFixed(2)}%</span></div>
                              <Separator className="my-1" />
                              <p className="text-xs font-semibold text-slate-700">Komponen B — Prestasi:</p>
                              <div className="flex justify-between"><span className="text-slate-500">Mhs Juara Nasional (n₂):</span><span className="font-medium">{d.mhsJuaraNasional || 0} × 0.6 = {((d.mhsJuaraNasional || 0) * 0.6).toFixed(1)}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Mhs Juara Provinsi (n₃):</span><span className="font-medium">{d.mhsJuaraProvinsi || 0} × 0.3 = {((d.mhsJuaraProvinsi || 0) * 0.3).toFixed(1)}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">÷ Total Mahasiswa (t):</span><span className="font-medium">{d.totalMahasiswa || 0}</span></div>
                              <div className="flex justify-between font-medium"><span className="text-slate-700">Komponen B:</span><span className="text-slate-700">{kompB.toFixed(2)}%</span></div>
                              <Separator className="my-1" />
                              <div className="flex justify-between font-bold"><span className="text-slate-700">Total IKU 3 (A + B):</span><span className="text-slate-700">{(kompA + kompB).toFixed(2)}%</span></div>
                            </>
                          );
                        })()}
                        {iku.id === "iku5" && (() => {
                          const d = currentData as unknown as Iku5Data;
                          return (
                            <>
                              <div className="flex justify-between"><span className="text-slate-500">Jumlah Luaran:</span><span className="font-medium">{d.jumlahLuaran || 0}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Total Kerja Sama:</span><span className="font-medium">{d.totalKerjasama || 0}</span></div>
                            </>
                          );
                        })()}
                        {iku.id === "iku7" && (() => {
                          const d = currentData as unknown as Iku7Data;
                          return (
                            <>
                              <div className="flex justify-between"><span className="text-slate-500">Program SDG:</span><span className="font-medium">{d.jumlahProgramSDG || 0}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Total Program:</span><span className="font-medium">{d.totalProgram || 0}</span></div>
                            </>
                          );
                        })()}
                        {iku.id === "iku9" && (() => {
                          const d = currentData as unknown as Iku9Data;
                          return (
                            <>
                              <div className="flex justify-between"><span className="text-slate-500">Pendapatan Non-Akademik:</span><span className="font-medium">Rp {(d.pendapatanNonAkademik || 0).toLocaleString("id-ID")}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Total Pendapatan:</span><span className="font-medium">Rp {(d.totalPendapatan || 0).toLocaleString("id-ID")}</span></div>
                            </>
                          );
                        })()}
                        {iku.id === "iku12" && (() => {
                          const d = currentData as unknown as Iku12Data;
                          const labels: Record<string, string> = { ya: "Tersedia & Terimplementasi", sebagian: "Sebagian Terimplementasi", tidak: "Belum Tersedia" };
                          return (
                            <>
                              <div className="flex justify-between"><span className="text-slate-500">Dokumen:</span><span className="font-medium">{labels[d.dokumenTersedia] || "-"}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Skor Komposit:</span><span className="font-medium">{d.skorKomposit || 0}%</span></div>
                            </>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    );
  };

  // ============ SPMI ASSESSMENT HELPERS ============
  type SpmiStatus = "baik" | "cukup" | "perlu_perhatian" | "belum_tercapai";

  const getSpmiStatus = (value: number): SpmiStatus => {
    if (value >= 75) return "baik";
    if (value >= 50) return "cukup";
    if (value >= 25) return "perlu_perhatian";
    return "belum_tercapai";
  };

  const getSpmiStatusLabel = (status: SpmiStatus): string => {
    switch (status) {
      case "baik": return "Baik";
      case "cukup": return "Cukup";
      case "perlu_perhatian": return "Perlu Perhatian";
      case "belum_tercapai": return "Belum Tercapai";
    }
  };

  const getSpmiStatusColor = (status: SpmiStatus): string => {
    switch (status) {
      case "baik": return "text-teal-700";
      case "cukup": return "text-amber-700";
      case "perlu_perhatian": return "text-orange-700";
      case "belum_tercapai": return "text-red-700";
    }
  };

  const getSpmiStatusBg = (status: SpmiStatus): string => {
    switch (status) {
      case "baik": return "bg-teal-50 border-teal-200";
      case "cukup": return "bg-amber-50 border-amber-200";
      case "perlu_perhatian": return "bg-orange-50 border-orange-200";
      case "belum_tercapai": return "bg-red-50 border-red-200";
    }
  };

  const getSpmiStatusBadge = (status: SpmiStatus): string => {
    switch (status) {
      case "baik": return "bg-teal-100 text-teal-800 border-teal-300";
      case "cukup": return "bg-amber-100 text-amber-800 border-amber-300";
      case "perlu_perhatian": return "bg-orange-100 text-orange-800 border-orange-300";
      case "belum_tercapai": return "bg-red-100 text-red-800 border-red-300";
    }
  };

  const getSpmiProgressColor = (status: SpmiStatus): string => {
    switch (status) {
      case "baik": return "[&>div]:bg-teal-500";
      case "cukup": return "[&>div]:bg-amber-500";
      case "perlu_perhatian": return "[&>div]:bg-orange-500";
      case "belum_tercapai": return "[&>div]:bg-red-500";
    }
  };

  const getSpmiIcon = (status: SpmiStatus) => {
    switch (status) {
      case "baik": return <CircleCheck className="w-4 h-4 text-teal-600" />;
      case "cukup": return <CircleDot className="w-4 h-4 text-amber-600" />;
      case "perlu_perhatian": return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case "belum_tercapai": return <CircleX className="w-4 h-4 text-red-600" />;
    }
  };

  // ============ RENDER: SPMI TAB ============
  const renderSpmiTab = (prodiIds: string[], isGlobal: boolean) => {
    // Calculate IKU values for SPMI assessment
    const ikuValues: Record<string, number> = {};
    IKU_LIST.forEach((iku) => {
      ikuValues[iku.id] = calcAggregatedValue(iku.id, prodiIds);
    });

    // SPMI Criteria scores
    const kriteriaScores = {
      budayaMutu: (() => {
        // Based on reporting compliance: how many of 7 IKUs have data
        const reportedCount = IKU_LIST.filter((iku) => ikuValues[iku.id] > 0).length;
        return (reportedCount / 7) * 100;
      })(),
      relevansi: (() => {
        // Average of IKU 1, 2, 3, 5
        const vals = [ikuValues.iku1, ikuValues.iku2, ikuValues.iku3, ikuValues.iku5];
        const nonZero = vals.filter((v) => v > 0);
        return nonZero.length > 0 ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 0;
      })(),
      akuntabilitas: (() => {
        // Average of IKU 9, 12
        const vals = [ikuValues.iku9, ikuValues.iku12];
        const nonZero = vals.filter((v) => v > 0);
        return nonZero.length > 0 ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 0;
      })(),
      diferensiasi: ikuValues.iku7,
    };

    const overallSpmiScore = (() => {
      const scores = Object.values(kriteriaScores);
      const nonZero = scores.filter((v) => v > 0);
      return nonZero.length > 0 ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 0;
    })();

    const overallStatus = getSpmiStatus(overallSpmiScore);

    // Radar data for SPMI
    const spmiRadarData = [
      { kriteria: "Budaya Mutu", nilai: kriteriaScores.budayaMutu },
      { kriteria: "Relevansi", nilai: kriteriaScores.relevansi },
      { kriteria: "Akuntabilitas", nilai: kriteriaScores.akuntabilitas },
      { kriteria: "Diferensiasi", nilai: kriteriaScores.diferensiasi },
    ];

    const spmiRadarConfig: ChartConfig = {
      nilai: { label: "Nilai SPMI (%)", color: PRIMARY },
    };

    const hasAnyData = Object.values(ikuValues).some((v) => v > 0);

    return (
      <div className="space-y-6">
        {/* Header */}
        <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-xl" style={{ borderLeft: `4px solid ${GOLD}` }}>
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${GOLD}15` }}>
                <ShieldCheck className="w-6 h-6" style={{ color: GOLD }} />
              </div>
              <div>
                <h2 className="text-lg font-bold gradient-text">SPMI - Sistem Penjaminan Mutu Internal</h2>
                <p className="text-sm text-slate-500 mt-1">Keterkaitan Pencapaian IKU dengan Standar Akreditasi (IAPT 4.1)</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isGlobal ? "Universitas Tulungagung" : getFakultasById(navSelection.id)?.nama} • Tahun Akademik {tahun}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall SPMI Score */}
        <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <h3 className="text-base font-semibold gradient-text mb-1">Penilaian Keseluruhan SPMI</h3>
                <p className="text-xs text-slate-500 mb-4">Berdasarkan agregasi pencapaian 7 IKU Wajib terhadap 4 kriteria IAPT 4.1</p>
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-5xl font-bold gradient-text">
                    {overallSpmiScore.toFixed(1)}%
                  </span>
                  {hasAnyData && (
                    <Badge className={`mb-2 text-xs font-semibold border ${getSpmiStatusBadge(overallStatus)}`}>
                      {getSpmiStatusLabel(overallStatus)}
                    </Badge>
                  )}
                </div>
                {hasAnyData ? (
                  <div className="space-y-3 mt-4">
                    {Object.entries(kriteriaScores).map(([key, value]) => {
                      const status = getSpmiStatus(value);
                      const labels: Record<string, string> = {
                        budayaMutu: "Budaya Mutu",
                        relevansi: "Relevansi",
                        akuntabilitas: "Akuntabilitas",
                        diferensiasi: "Diferensiasi Misi",
                      };
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-600">{labels[key]}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-700">{value.toFixed(1)}%</span>
                              {getSpmiIcon(status)}
                            </div>
                          </div>
                          <Progress value={value} className={`h-2 ${getSpmiProgressColor(status)}`} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 mt-2">Belum ada data IKU untuk dinilai. Silakan input data terlebih dahulu.</p>
                )}
              </div>
              {hasAnyData && (
                <div className="w-full md:w-72 shrink-0">
                  <ChartContainer config={spmiRadarConfig} className="h-[220px] w-full">
                    <RadarChart data={spmiRadarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="kriteria" tick={{ fontSize: 9, fill: "#475569" }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} />
                      <Radar name="Nilai SPMI" dataKey="nilai" stroke={PRIMARY} fill={PRIMARY} fillOpacity={0.15} strokeWidth={2} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RadarChart>
                  </ChartContainer>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Per-IKU SPMI Assessment */}
        <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold gradient-text flex items-center gap-2">
              <Target className="w-4 h-4" />
              Penilaian Indikator SPMI per IKU
            </CardTitle>
            <CardDescription>Status ketercapaian setiap IKU dalam mendukung standar akreditasi</CardDescription>
          </CardHeader>
          <CardContent>
            {!hasAnyData ? (
              <div className="text-center py-8">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Belum ada data IKU. Input data IKU pada program studi terlebih dahulu.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {IKU_LIST.map((iku) => {
                  const value = ikuValues[iku.id];
                  const status = getSpmiStatus(value);
                  return (
                    <div key={iku.id} className={`p-4 rounded-lg border ${getSpmiStatusBg(status)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-700">{iku.label}</span>
                        {getSpmiIcon(status)}
                      </div>
                      <p className="text-xs text-slate-600 mb-1">{iku.shortTitle}</p>
                      <div className="flex items-end gap-2 mb-2">
                        <span className="text-2xl font-bold gradient-text">{value.toFixed(1)}%</span>
                        <Badge className={`text-[10px] font-semibold border mb-1 ${getSpmiStatusBadge(status)}`}>
                          {getSpmiStatusLabel(status)}
                        </Badge>
                      </div>
                      <Progress value={value} className={`h-1.5 ${getSpmiProgressColor(status)}`} />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Narrative: IKU-to-IAPT Mapping */}
        <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold gradient-text flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Narasi: Keterkaitan Pencapaian IKU dengan Standar Akreditasi
            </CardTitle>
            <CardDescription>
              Pemetaan indikator pada Instrumen Akreditasi Perguruan Tinggi (IAPT) Versi 4.1 yang dipengaruhi oleh pencapaian IKU sesuai Kepmendiktisaintek No. 358/M/KEP/2026
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg p-4 mb-5 border-l-4" style={{ background: "linear-gradient(135deg, #F8FAFC, #EEF2F7)", borderLeftColor: GOLD }}>
              <p className="text-sm text-slate-700 leading-relaxed">
                Berdasarkan fokus institusi pada <strong>7 IKU Wajib</strong> sesuai Keputusan Menteri Pendidikan Tinggi, Sains, dan Teknologi Nomor 358/M/KEP/2026, berikut adalah pemetaan lengkap indikator pada Instrumen Akreditasi Perguruan Tinggi (IAPT) Versi 4.1 yang secara langsung maupun tidak langsung dipengaruhi oleh pencapaian IKU tersebut. Sebagai tim Penjaminan Mutu, daftar ini dapat digunakan untuk memastikan bahwa setiap data IKU yang dikumpulkan juga memenuhi syarat bukti (eviden) untuk butir-butir indikator akreditasi.
              </p>
            </div>

            <Accordion type="multiple" className="space-y-3">
              {/* Kriteria 1: Budaya Mutu */}
              <AccordionItem value="budaya-mutu" className="glass-card rounded-xl overflow-hidden border-0 transition-all duration-300">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/50 group">
                  <div className="flex items-center gap-3 text-left">
                    <div className={`p-1.5 rounded-md ${getSpmiStatusBg(getSpmiStatus(kriteriaScores.budayaMutu))}`}>
                      {getSpmiIcon(getSpmiStatus(kriteriaScores.budayaMutu))}
                    </div>
                    <div>
                      <span className="text-sm font-semibold gradient-text">1. Kriteria Budaya Mutu</span>
                      <p className="text-xs text-slate-500">Fokus pada Tata Kelola Mutu</p>
                    </div>
                    <Badge variant="outline" className="ml-2 text-[10px]">{kriteriaScores.budayaMutu.toFixed(1)}%</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="rounded-lg p-4 border-l-4 mb-3" style={{ background: "linear-gradient(135deg, #F8FAFC, #EEF2F7)", borderLeftColor: GOLD }}>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Pemenuhan IKU ini menunjang sistem penjaminan mutu internal (SPMI) dalam mengelola data kinerja.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg border ${getSpmiStatusBg(getSpmiStatus(ikuValues.iku1))}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-slate-700">IKU 1 (AEE PT) → Indikator 3</span>
                        <Badge className={`text-[10px] border ${getSpmiStatusBadge(getSpmiStatus(ikuValues.iku1))}`}>
                          {ikuValues.iku1.toFixed(1)}% - {getSpmiStatusLabel(getSpmiStatus(ikuValues.iku1))}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">
                        <strong>Laporan Implementasi SPMI:</strong> Pencapaian 7 IKU Wajib harus dilaporkan secara berkala (setiap 3 bulan) melalui PD Dikti. Laporan kinerja yang terus membaik dari data IKU ini menjadi bukti utama keberfungsian sistem pengelolaan data dan informasi.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Kriteria 2: Relevansi */}
              <AccordionItem value="relevansi" className="glass-card rounded-xl overflow-hidden border-0 transition-all duration-300">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/50 group">
                  <div className="flex items-center gap-3 text-left">
                    <div className={`p-1.5 rounded-md ${getSpmiStatusBg(getSpmiStatus(kriteriaScores.relevansi))}`}>
                      {getSpmiIcon(getSpmiStatus(kriteriaScores.relevansi))}
                    </div>
                    <div>
                      <span className="text-sm font-semibold gradient-text">2. Kriteria Relevansi</span>
                      <p className="text-xs text-slate-500">Fokus pada Luaran Tridharma</p>
                    </div>
                    <Badge variant="outline" className="ml-2 text-[10px]">{kriteriaScores.relevansi.toFixed(1)}%</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="rounded-lg p-4 border-l-4 mb-3" style={{ background: "linear-gradient(135deg, #F8FAFC, #EEF2F7)", borderLeftColor: GOLD }}>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Kriteria ini memiliki kaitan paling banyak dengan 7 IKU Wajib, terutama terkait dampak dan luaran pendidikan serta penelitian.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {/* IKU 1 */}
                    <div className={`p-3 rounded-lg border ${getSpmiStatusBg(getSpmiStatus(ikuValues.iku1))}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-slate-700">IKU 1 (AEE PT)</span>
                        <Badge className={`text-[10px] border ${getSpmiStatusBadge(getSpmiStatus(ikuValues.iku1))}`}>
                          {ikuValues.iku1.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="space-y-1.5 ml-2">
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-700">→ Indikator 10 (Perbaikan Proses Pembelajaran):</strong> Data efisiensi edukasi menunjukkan apakah proses pembelajaran diperbaiki secara berkelanjutan berdasarkan evaluasi masa studi mahasiswa.
                        </p>
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-700">→ Indikator 15 (Analisis Prestasi & Kelulusan):</strong> Mengukur keberhasilan lulus tepat waktu sesuai masa tempuh kurikulum yang ditetapkan institusi.
                        </p>
                      </div>
                    </div>

                    {/* IKU 2 */}
                    <div className={`p-3 rounded-lg border ${getSpmiStatusBg(getSpmiStatus(ikuValues.iku2))}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-slate-700">IKU 2 (Kualitas Lulusan)</span>
                        <Badge className={`text-[10px] border ${getSpmiStatusBadge(getSpmiStatus(ikuValues.iku2))}`}>
                          {ikuValues.iku2.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="space-y-1.5 ml-2">
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-700">→ Indikator 14 (Kompetensi Lulusan):</strong> Pengakuan dan apresiasi kompetensi lulusan oleh dunia kerja (DUDIK) yang dibuktikan dengan tingkat upah &gt; 1,2x UMP.
                        </p>
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-700">→ Indikator 15 (Keterserapan Lapangan Kerja):</strong> Analisis terhadap lulusan yang langsung bekerja atau berwirausaha dalam jangka waktu 1 tahun.
                        </p>
                      </div>
                    </div>

                    {/* IKU 3 */}
                    <div className={`p-3 rounded-lg border ${getSpmiStatusBg(getSpmiStatus(ikuValues.iku3))}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-slate-700">IKU 3 (Kegiatan Mahasiswa)</span>
                        <Badge className={`text-[10px] border ${getSpmiStatusBadge(getSpmiStatus(ikuValues.iku3))}`}>
                          {ikuValues.iku3.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="space-y-1.5 ml-2">
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-700">→ Indikator 15 (Analisis Prestasi Mahasiswa):</strong> Mencakup prestasi di luar program studi baik tingkat provinsi, nasional, maupun internasional.
                        </p>
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-700">→ Indikator 32 (Layanan Mahasiswa):</strong> Bukti adanya layanan dan pengakuan resmi bagi mahasiswa untuk belajar di luar program studi.
                        </p>
                      </div>
                    </div>

                    {/* IKU 5 */}
                    <div className={`p-3 rounded-lg border ${getSpmiStatusBg(getSpmiStatus(ikuValues.iku5))}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-slate-700">IKU 5 (Hilirisasi & Kerja Sama)</span>
                        <Badge className={`text-[10px] border ${getSpmiStatusBadge(getSpmiStatus(ikuValues.iku5))}`}>
                          {ikuValues.iku5.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="space-y-1.5 ml-2">
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-700">→ Indikator 18 (Mutu & Relevansi Penelitian):</strong> Menunjukkan hasil penelitian yang memenuhi kriteria kemanfaatan bagi mitra industri atau masyarakat.
                        </p>
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-700">→ Indikator 22 (Mutu & Relevansi PkM):</strong> Bukti bahwa pengabdian kepada masyarakat memiliki dampak nyata dan mendukung misi institusi.
                        </p>
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-700">→ Indikator 34 (Kepuasan Pemangku Kepentingan):</strong> Tingkat kepuasan mitra kerja terhadap kolaborasi tridharma yang dilakukan.
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Kriteria 3: Akuntabilitas */}
              <AccordionItem value="akuntabilitas" className="glass-card rounded-xl overflow-hidden border-0 transition-all duration-300">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/50 group">
                  <div className="flex items-center gap-3 text-left">
                    <div className={`p-1.5 rounded-md ${getSpmiStatusBg(getSpmiStatus(kriteriaScores.akuntabilitas))}`}>
                      {getSpmiIcon(getSpmiStatus(kriteriaScores.akuntabilitas))}
                    </div>
                    <div>
                      <span className="text-sm font-semibold gradient-text">3. Kriteria Akuntabilitas</span>
                      <p className="text-xs text-slate-500">Fokus pada Manajemen Sumber Daya</p>
                    </div>
                    <Badge variant="outline" className="ml-2 text-[10px]">{kriteriaScores.akuntabilitas.toFixed(1)}%</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="rounded-lg p-4 border-l-4 mb-3" style={{ background: "linear-gradient(135deg, #F8FAFC, #EEF2F7)", borderLeftColor: GOLD }}>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Fokus pada IKU 9 dan 12 secara langsung memperkuat aspek pengelolaan keuangan dan SDM yang transparan.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {/* IKU 9 */}
                    <div className={`p-3 rounded-lg border ${getSpmiStatusBg(getSpmiStatus(ikuValues.iku9))}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-slate-700">IKU 9 (Pendapatan Non-Akademik)</span>
                        <Badge className={`text-[10px] border ${getSpmiStatusBadge(getSpmiStatus(ikuValues.iku9))}`}>
                          {ikuValues.iku9.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="space-y-1.5 ml-2">
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-700">→ Indikator 27 (Renstra Keuangan):</strong> Adanya rencana strategis keuangan 5 tahunan yang mencakup diversifikasi pendanaan dari riset dan unit bisnis.
                        </p>
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-700">→ Indikator 33 (Pola Pengelolaan Keuangan):</strong> Menjalankan pola pengelolaan keuangan yang sehat sesuai status penyelenggaraan institusi.
                        </p>
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-700">→ Indikator 35 (Audit Keuangan Eksternal):</strong> Terkait kewajiban audit oleh auditor independen untuk memastikan kewajaran laporan keuangan.
                        </p>
                      </div>
                    </div>

                    {/* IKU 12 */}
                    <div className={`p-3 rounded-lg border ${getSpmiStatusBg(getSpmiStatus(ikuValues.iku12))}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-slate-700">IKU 12 (Kesejahteraan Dosen)</span>
                        <Badge className={`text-[10px] border ${getSpmiStatusBadge(getSpmiStatus(ikuValues.iku12))}`}>
                          {ikuValues.iku12.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="space-y-1.5 ml-2">
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-700">→ Indikator 6 (Renstra Pengelolaan SDM):</strong> Bukti adanya perencanaan strategis yang menunjukkan analisis kebutuhan dan pengembangan kesejahteraan dosen.
                        </p>
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-700">→ Indikator 11 (Dosen Tetap Jabatan Akademik):</strong> Perencanaan kesejahteraan yang dikaitkan dengan jenjang jabatan akademik mendorong dosen untuk terus meningkatkan kualifikasi fungsionalnya.
                        </p>
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-700">→ Indikator 29 (Pengelolaan Fungsional):</strong> Khususnya pada aspek penempatan personil (staffing) dan pengarahan (leading) dalam tata kelola SDM.
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Kriteria 4: Diferensiasi Misi */}
              <AccordionItem value="diferensiasi" className="glass-card rounded-xl overflow-hidden border-0 transition-all duration-300">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/50 group">
                  <div className="flex items-center gap-3 text-left">
                    <div className={`p-1.5 rounded-md ${getSpmiStatusBg(getSpmiStatus(kriteriaScores.diferensiasi))}`}>
                      {getSpmiIcon(getSpmiStatus(kriteriaScores.diferensiasi))}
                    </div>
                    <div>
                      <span className="text-sm font-semibold gradient-text">4. Kriteria Diferensiasi Misi</span>
                      <p className="text-xs text-slate-500">Fokus pada Keunikan Institusi</p>
                    </div>
                    <Badge variant="outline" className="ml-2 text-[10px]">{kriteriaScores.diferensiasi.toFixed(1)}%</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="rounded-lg p-4 border-l-4 mb-3" style={{ background: "linear-gradient(135deg, #F8FAFC, #EEF2F7)", borderLeftColor: GOLD }}>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Pengambilan IKU 7 merupakan instrumen utama untuk menunjukkan identitas khas perguruan tinggi.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg border ${getSpmiStatusBg(getSpmiStatus(ikuValues.iku7))}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-slate-700">IKU 7 (SDGs)</span>
                        <Badge className={`text-[10px] border ${getSpmiStatusBadge(getSpmiStatus(ikuValues.iku7))}`}>
                          {ikuValues.iku7.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="space-y-1.5 ml-2">
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-700">→ Indikator 36 (Penetapan Diferensiasi Misi):</strong> Pemilihan 2 SDGs tambahan di luar tema wajib menjadi bagian dari peta jalan pengembangan institusi yang unik.
                        </p>
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-700">→ Indikator 38 (Penilaian Kesesuaian Capaian):</strong> Evaluasi tahunan untuk melihat sejauh mana kegiatan tridharma (SDGs 1, 4, 17, dan pilihan) selaras dengan misi yang dijanjikan.
                        </p>
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-700">→ Indikator 39 (Pengakuan Keunggulan Eksternal):</strong> Apresiasi dari masyarakat atau lembaga internasional atas kontribusi nyata perguruan tinggi dalam isu-isu pembangunan berkelanjutan.
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* SPMI Summary Table */}
        {hasAnyData && (
          <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold gradient-text flex items-center gap-2">
                <Award className="w-4 h-4" />
                Ringkasan Penilaian SPMI dari Sisi IKU
              </CardTitle>
              <CardDescription>Rekomendasi tindak lanjut berdasarkan status ketercapaian</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2" style={{ borderColor: `${PRIMARY}30`, background: "linear-gradient(135deg, #F8FAFC, #EEF2F7)" }}>
                      <th className="text-left py-3 px-3 font-semibold text-xs" style={{ color: PRIMARY }}>Kriteria</th>
                      <th className="text-left py-3 px-3 font-semibold text-xs" style={{ color: PRIMARY }}>IKU Terkait</th>
                      <th className="text-center py-3 px-3 font-semibold text-xs" style={{ color: PRIMARY }}>Nilai</th>
                      <th className="text-center py-3 px-3 font-semibold text-xs" style={{ color: PRIMARY }}>Status</th>
                      <th className="text-left py-3 px-3 font-semibold text-xs" style={{ color: PRIMARY }}>Rekomendasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        kriteria: "Budaya Mutu",
                        iku: "Semua IKU (Pelaporan)",
                        value: kriteriaScores.budayaMutu,
                        rekomendasi: kriteriaScores.budayaMutu >= 75
                          ? "Pertahankan pelaporan berkala dan tingkatkan kualitas data."
                          : kriteriaScores.budayaMutu >= 50
                          ? "Lengkapi pelaporan IKU yang belum terisi dan perbaiki mekanisme pengumpulan data."
                          : "Perlu perhatian serius pada kelengkapan pelaporan IKU sebagai bukti implementasi SPMI.",
                      },
                      {
                        kriteria: "Relevansi",
                        iku: "IKU 1, 2, 3, 5",
                        value: kriteriaScores.relevansi,
                        rekomendasi: kriteriaScores.relevansi >= 75
                          ? "Luaran tridharma sudah relevan. Fokus pada peningkatan mutu dan dampak luaran."
                          : kriteriaScores.relevansi >= 50
                          ? "Tingkatkan kualitas lulusan dan hilirisasi penelitian. Perbaiki proses pembelajaran berdasarkan evaluasi AEE."
                          : "Perlu perbaikan signifikan pada efisiensi edukasi, keterserapan lulusan, dan kerja sama industri.",
                      },
                      {
                        kriteria: "Akuntabilitas",
                        iku: "IKU 9, 12",
                        value: kriteriaScores.akuntabilitas,
                        rekomendasi: kriteriaScores.akuntabilitas >= 75
                          ? "Pengelolaan keuangan dan SDM sudah transparan. Pertahankan audit dan diversifikasi pendanaan."
                          : kriteriaScores.akuntabilitas >= 50
                          ? "Perlu diversifikasi pendapatan non-akademik dan peningkatan kesejahteraan dosen."
                          : "Urgen: perbaiki pola pengelolaan keuangan dan susun dokumen perencanaan kesejahteraan dosen.",
                      },
                      {
                        kriteria: "Diferensiasi Misi",
                        iku: "IKU 7",
                        value: kriteriaScores.diferensiasi,
                        rekomendasi: kriteriaScores.diferensiasi >= 75
                          ? "Identitas khas institusi melalui SDGs sudah kuat. Perkuat pengakuan eksternal."
                          : kriteriaScores.diferensiasi >= 50
                          ? "Tingkatkan program SDG dan perkuat keterkaitan dengan misi diferensiasi institusi."
                          : "Kritikal: perlu penetapan dan implementasi program SDGs sebagai pembeda institusi.",
                      },
                    ].map((row) => {
                      const status = getSpmiStatus(row.value);
                      return (
                        <tr key={row.kriteria} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-3 font-medium text-xs" style={{ color: PRIMARY }}>{row.kriteria}</td>
                          <td className="py-3 px-3 text-xs text-slate-600">{row.iku}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="text-xs font-bold" style={{ color: row.value > 0 ? PRIMARY : "#CBD5E1" }}>
                              {row.value.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Badge className={`text-[10px] font-semibold border ${getSpmiStatusBadge(status)}`}>
                              <span className="flex items-center gap-1">
                                {getSpmiIcon(status)}
                                {getSpmiStatusLabel(status)}
                              </span>
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-xs text-slate-600 max-w-xs">{row.rekomendasi}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <Separator className="my-4" />

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <CircleCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span className="text-slate-600"><strong>Baik</strong> (≥75%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CircleDot className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-slate-600"><strong>Cukup</strong> (50-74%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                  <span className="text-slate-600"><strong>Perlu Perhatian</strong> (25-49%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CircleX className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-slate-600"><strong>Belum Tercapai</strong> (&lt;25%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* IAPT Indicator Mapping Detail */}
        {hasAnyData && (
          <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold gradient-text flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Detail Pemetaan Indikator IAPT 4.1
              </CardTitle>
              <CardDescription>Setiap IKU dan indikator IAPT yang dipengaruhinya beserta status pencapaian</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto custom-scrollbar max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10" style={{ background: "linear-gradient(135deg, #F8FAFC, #EEF2F7)" }}>
                    <tr className="border-b-2" style={{ borderColor: `${PRIMARY}30` }}>
                      <th className="text-left py-2.5 px-3 font-semibold text-xs" style={{ color: PRIMARY }}>IKU</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-xs" style={{ color: PRIMARY }}>Indikator IAPT</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-xs" style={{ color: PRIMARY }}>Deskripsi</th>
                      <th className="text-center py-2.5 px-3 font-semibold text-xs" style={{ color: PRIMARY }}>Capaian IKU</th>
                      <th className="text-center py-2.5 px-3 font-semibold text-xs" style={{ color: PRIMARY }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { iku: "IKU 1", indikator: "Ind. 3", deskripsi: "Laporan Implementasi SPMI", ikuId: "iku1" },
                      { iku: "IKU 1", indikator: "Ind. 10", deskripsi: "Perbaikan Proses Pembelajaran", ikuId: "iku1" },
                      { iku: "IKU 1", indikator: "Ind. 15", deskripsi: "Analisis Prestasi & Kelulusan", ikuId: "iku1" },
                      { iku: "IKU 2", indikator: "Ind. 14", deskripsi: "Kompetensi Lulusan", ikuId: "iku2" },
                      { iku: "IKU 2", indikator: "Ind. 15", deskripsi: "Keterserapan Lapangan Kerja", ikuId: "iku2" },
                      { iku: "IKU 3", indikator: "Ind. 15", deskripsi: "Analisis Prestasi Mahasiswa", ikuId: "iku3" },
                      { iku: "IKU 3", indikator: "Ind. 32", deskripsi: "Layanan Mahasiswa", ikuId: "iku3" },
                      { iku: "IKU 5", indikator: "Ind. 18", deskripsi: "Mutu & Relevansi Penelitian", ikuId: "iku5" },
                      { iku: "IKU 5", indikator: "Ind. 22", deskripsi: "Mutu & Relevansi PkM", ikuId: "iku5" },
                      { iku: "IKU 5", indikator: "Ind. 34", deskripsi: "Kepuasan Pemangku Kepentingan", ikuId: "iku5" },
                      { iku: "IKU 7", indikator: "Ind. 36", deskripsi: "Penetapan Diferensiasi Misi", ikuId: "iku7" },
                      { iku: "IKU 7", indikator: "Ind. 38", deskripsi: "Penilaian Kesesuaian Capaian", ikuId: "iku7" },
                      { iku: "IKU 7", indikator: "Ind. 39", deskripsi: "Pengakuan Keunggulan Eksternal", ikuId: "iku7" },
                      { iku: "IKU 9", indikator: "Ind. 27", deskripsi: "Renstra Keuangan", ikuId: "iku9" },
                      { iku: "IKU 9", indikator: "Ind. 33", deskripsi: "Pola Pengelolaan Keuangan", ikuId: "iku9" },
                      { iku: "IKU 9", indikator: "Ind. 35", deskripsi: "Audit Keuangan Eksternal", ikuId: "iku9" },
                      { iku: "IKU 12", indikator: "Ind. 6", deskripsi: "Renstra Pengelolaan SDM", ikuId: "iku12" },
                      { iku: "IKU 12", indikator: "Ind. 11", deskripsi: "Dosen Tetap Jabatan Akademik", ikuId: "iku12" },
                      { iku: "IKU 12", indikator: "Ind. 29", deskripsi: "Pengelolaan Fungsional", ikuId: "iku12" },
                    ].map((row, idx) => {
                      const value = ikuValues[row.ikuId];
                      const status = getSpmiStatus(value);
                      return (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="py-2 px-3 font-semibold text-xs" style={{ color: IKU_COLORS[row.ikuId] || PRIMARY }}>{row.iku}</td>
                          <td className="py-2 px-3 text-xs text-slate-700 font-medium">{row.indikator}</td>
                          <td className="py-2 px-3 text-xs text-slate-600">{row.deskripsi}</td>
                          <td className="py-2 px-3 text-center">
                            <span className="text-xs font-bold" style={{ color: value > 0 ? IKU_COLORS[row.ikuId] || PRIMARY : "#CBD5E1" }}>
                              {value.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {getSpmiIcon(status)}
                              <span className={`text-[10px] font-semibold ${getSpmiStatusColor(status)}`}>
                                {getSpmiStatusLabel(status)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Penilaian Wajib SPMI */}
        <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-xl" style={{ borderTop: `3px solid ${GOLD}` }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold gradient-text flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" style={{ color: GOLD }} />
              Penilaian Wajib (Syarat Perlu) Indikator Akreditasi
            </CardTitle>
            <CardDescription className="text-xs">
              Ketentuan mutlak yang harus dipenuhi agar institusi dapat meraih status &quot;Terakreditasi&quot; atau &quot;Terakreditasi Unggul&quot; berdasarkan 7 IKU Wajib sesuai Kepmendiktisaintek No. 358/M/KEP/2026
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg p-3.5 mb-5 border-l-4" style={{ background: `linear-gradient(135deg, ${GOLD}08, ${GOLD}03)`, borderLeftColor: GOLD }}>
              <p className="text-xs text-amber-900 leading-relaxed">
                Berdasarkan pilihan institusi Anda untuk berfokus pada <strong>7 IKU Wajib</strong>, terdapat beberapa <strong>penilaian wajib (Syarat Perlu)</strong> dalam indikator akreditasi yang harus dipenuhi agar institusi Anda dapat meraih status <strong>&quot;Terakreditasi&quot;</strong> atau <strong>&quot;Terakreditasi Unggul&quot;</strong>. Berikut adalah daftar penilaian wajib dan ketentuan mutlak yang harus dipenuhi pada indikator-indikator tersebut.
              </p>
            </div>

            <div className="space-y-4">
              {/* 1. Aspek SDM */}
              <div className="glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="text-white px-4 py-3 flex items-center gap-2.5" style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)" }}>
                  <Users className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                  <div>
                    <h4 className="text-sm font-bold">Penilaian Wajib pada Aspek SDM</h4>
                    <p className="text-[10px] text-white/70">IKU 12 &amp; Indikator 6, 11</p>
                  </div>
                  {hasAnyData && (
                    <Badge className={`ml-auto text-[10px] font-semibold border ${getSpmiStatusBadge(getSpmiStatus(ikuValues.iku12))}`}>
                      IKU 12: {ikuValues.iku12.toFixed(1)}%
                    </Badge>
                  )}
                </div>
                <div className="p-4 space-y-3 bg-white">
                  <p className="text-xs text-slate-600 italic">Untuk mendukung kriteria ini, institusi Anda memiliki kewajiban penilaian sebagai berikut:</p>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg transition-colors hover:bg-white" style={{ background: "linear-gradient(135deg, rgba(248,250,252,0.8), rgba(238,242,247,0.5))", borderLeft: `2px solid ${GOLD}` }}>
                      <CircleCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Dokumen Perencanaan Strategis</p>
                        <p className="text-[11px] text-slate-600">Wajib memiliki Renstra atau Rencana Induk SDM yang telah ditetapkan secara resmi oleh pimpinan dan dapat diverifikasi.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg transition-colors hover:bg-white" style={{ background: "linear-gradient(135deg, rgba(248,250,252,0.8), rgba(238,242,247,0.5))", borderLeft: `2px solid ${GOLD}` }}>
                      <CircleCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Standar Penghasilan Minimum</p>
                        <p className="text-[11px] text-slate-600">Dokumen tersebut secara eksplisit wajib memuat target peningkatan kesejahteraan dosen dengan standar berbasis jenjang jabatan akademik, contohnya: <strong>Asisten Ahli ≥ 1,5× UMP</strong> dan <strong>Lektor ≥ 3× UMP</strong>.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg transition-colors hover:bg-white" style={{ background: "linear-gradient(135deg, rgba(248,250,252,0.8), rgba(238,242,247,0.5))", borderLeft: `2px solid ${GOLD}` }}>
                      <CircleCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Kecukupan Dosen Tetap</p>
                        <p className="text-[11px] text-slate-600">Perguruan tinggi wajib membuktikan kecukupan jumlah dosen tetap yang memiliki jabatan akademik di setiap program studi.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Luaran Pendidikan */}
              <div className="glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="text-white px-4 py-3 flex items-center gap-2.5" style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)" }}>
                  <GraduationCap className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                  <div>
                    <h4 className="text-sm font-bold">Penilaian Wajib pada Luaran Pendidikan</h4>
                    <p className="text-[10px] text-white/70">IKU 1, 2 &amp; Indikator 14, 15</p>
                  </div>
                  {hasAnyData && (
                    <div className="ml-auto flex gap-1.5">
                      <Badge className={`text-[10px] font-semibold border ${getSpmiStatusBadge(getSpmiStatus(ikuValues.iku1))}`}>
                        IKU 1: {ikuValues.iku1.toFixed(1)}%
                      </Badge>
                      <Badge className={`text-[10px] font-semibold border ${getSpmiStatusBadge(getSpmiStatus(ikuValues.iku2))}`}>
                        IKU 2: {ikuValues.iku2.toFixed(1)}%
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3 bg-white">
                  <p className="text-xs text-slate-600 italic">Aspek ini merupakan inti dari kriteria Relevansi yang menilai dampak nyata institusi:</p>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg transition-colors hover:bg-white" style={{ background: "linear-gradient(135deg, rgba(248,250,252,0.8), rgba(238,242,247,0.5))", borderLeft: `2px solid ${GOLD}` }}>
                      <CircleCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Validitas Tracer Study (IKU 2)</p>
                        <p className="text-[11px] text-slate-600">Penilaian wajib dilakukan melalui penelusuran lulusan (D1-S1) dalam jangka waktu maksimal 1 tahun setelah lulus.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg transition-colors hover:bg-white" style={{ background: "linear-gradient(135deg, rgba(248,250,252,0.8), rgba(238,242,247,0.5))", borderLeft: `2px solid ${GOLD}` }}>
                      <CircleCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Responden Minimum</p>
                        <p className="text-[11px] text-slate-600">Wajib mengumpulkan jumlah responden minimum sesuai formula <code className="px-1 py-0.5 rounded text-[10px] font-mono" style={{ backgroundColor: `${PRIMARY}15`, color: PRIMARY }}>n = N / (N×d² + 1)</code> dengan tingkat galat (error) sebesar <strong>2,3%</strong> agar data dianggap sah.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg transition-colors hover:bg-white" style={{ background: "linear-gradient(135deg, rgba(248,250,252,0.8), rgba(238,242,247,0.5))", borderLeft: `2px solid ${GOLD}` }}>
                      <CircleCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Efisiensi Masa Studi (IKU 1)</p>
                        <p className="text-[11px] text-slate-600">Wajib menghitung Angka Efisiensi Edukasi (AEE) berdasarkan jumlah mahasiswa yang lulus tepat waktu (misalnya 8 semester untuk Sarjana) dibandingkan total mahasiswa masuk.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Hilirisasi & Kerja Sama */}
              <div className="glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="text-white px-4 py-3 flex items-center gap-2.5" style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)" }}>
                  <Handshake className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                  <div>
                    <h4 className="text-sm font-bold">Penilaian Wajib pada Hilirisasi &amp; Kerja Sama</h4>
                    <p className="text-[10px] text-white/70">IKU 5 &amp; Indikator 18, 22, 34</p>
                  </div>
                  {hasAnyData && (
                    <Badge className={`ml-auto text-[10px] font-semibold border ${getSpmiStatusBadge(getSpmiStatus(ikuValues.iku5))}`}>
                      IKU 5: {ikuValues.iku5.toFixed(1)}%
                    </Badge>
                  )}
                </div>
                <div className="p-4 space-y-3 bg-white">
                  <p className="text-xs text-slate-600 italic">Penjaminan mutu harus memastikan setiap kerja sama memiliki bukti legalitas dan dampak:</p>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg transition-colors hover:bg-white" style={{ background: "linear-gradient(135deg, rgba(248,250,252,0.8), rgba(238,242,247,0.5))", borderLeft: `2px solid ${GOLD}` }}>
                      <CircleCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Legalitas Kerja Sama</p>
                        <p className="text-[11px] text-slate-600">Setiap luaran wajib didukung oleh dokumen resmi seperti MoU atau MoA yang masih aktif dengan mitra industri atau lembaga.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg transition-colors hover:bg-white" style={{ background: "linear-gradient(135deg, rgba(248,250,252,0.8), rgba(238,242,247,0.5))", borderLeft: `2px solid ${GOLD}` }}>
                      <CircleCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Bukti Pemanfaatan (Hilirisasi)</p>
                        <p className="text-[11px] text-slate-600">Luaran (jurnal, produk terapan, atau seni) wajib dibuktikan telah dimanfaatkan melalui surat penerapan, laporan implementasi, atau bukti komersialisasi/lisensi dari mitra.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Tata Kelola & Keuangan */}
              <div className="glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="text-white px-4 py-3 flex items-center gap-2.5" style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)" }}>
                  <Wallet className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                  <div>
                    <h4 className="text-sm font-bold">Penilaian Wajib pada Tata Kelola &amp; Keuangan</h4>
                    <p className="text-[10px] text-white/70">IKU 9 &amp; Indikator 33, 35</p>
                  </div>
                  {hasAnyData && (
                    <Badge className={`ml-auto text-[10px] font-semibold border ${getSpmiStatusBadge(getSpmiStatus(ikuValues.iku9))}`}>
                      IKU 9: {ikuValues.iku9.toFixed(1)}%
                    </Badge>
                  )}
                </div>
                <div className="p-4 space-y-3 bg-white">
                  <p className="text-xs text-slate-600 italic">Untuk PTS, akuntabilitas keuangan memiliki standar penilaian yang spesifik:</p>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg transition-colors hover:bg-white" style={{ background: "linear-gradient(135deg, rgba(248,250,252,0.8), rgba(238,242,247,0.5))", borderLeft: `2px solid ${GOLD}` }}>
                      <CircleCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Audit Eksternal Independen</p>
                        <p className="text-[11px] text-slate-600">Laporan keuangan institusi wajib diaudit oleh auditor independen terdaftar untuk memastikan kewajaran penyajian data.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg transition-colors hover:bg-white" style={{ background: "linear-gradient(135deg, rgba(248,250,252,0.8), rgba(238,242,247,0.5))", borderLeft: `2px solid ${GOLD}` }}>
                      <CircleCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Opini Audit</p>
                        <p className="text-[11px] text-slate-600">Hasil audit yang diakui minimal berstatus <strong>Wajar Tanpa Pengecualian (WTP)</strong> atau <strong>Wajar Dengan Pengecualian (WDP)</strong>.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg transition-colors hover:bg-white" style={{ background: "linear-gradient(135deg, rgba(248,250,252,0.8), rgba(238,242,247,0.5))", borderLeft: `2px solid ${GOLD}` }}>
                      <CircleCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Diversifikasi Pendapatan</p>
                        <p className="text-[11px] text-slate-600">Wajib mencatatkan pendapatan dari sumber non-akademik (hibah riset, unit bisnis, jasa layanan) di dalam laporan keuangan resmi.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Diferensiasi Misi */}
              <div className="glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="text-white px-4 py-3 flex items-center gap-2.5" style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)" }}>
                  <Globe className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                  <div>
                    <h4 className="text-sm font-bold">Penilaian Wajib pada Diferensiasi Misi</h4>
                    <p className="text-[10px] text-white/70">IKU 7 &amp; Indikator 36, 38</p>
                  </div>
                  {hasAnyData && (
                    <Badge className={`ml-auto text-[10px] font-semibold border ${getSpmiStatusBadge(getSpmiStatus(ikuValues.iku7))}`}>
                      IKU 7: {ikuValues.iku7.toFixed(1)}%
                    </Badge>
                  )}
                </div>
                <div className="p-4 space-y-3 bg-white">
                  <p className="text-xs text-slate-600 italic">Kewajiban dalam pemilihan tema strategis untuk keunikan institusi:</p>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg transition-colors hover:bg-white" style={{ background: "linear-gradient(135deg, rgba(248,250,252,0.8), rgba(238,242,247,0.5))", borderLeft: `2px solid ${GOLD}` }}>
                      <CircleCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Pemilihan 2 SDGs Tambahan</p>
                        <p className="text-[11px] text-slate-600">Selain wajib berkontribusi pada <strong>SDG 1, 4, dan 17</strong>, institusi wajib memilih <strong>2 tujuan SDGs lain</strong> yang sesuai dengan keunggulan kampus.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg transition-colors hover:bg-white" style={{ background: "linear-gradient(135deg, rgba(248,250,252,0.8), rgba(238,242,247,0.5))", borderLeft: `2px solid ${GOLD}` }}>
                      <CircleCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Formalitas dalam Renstra</p>
                        <p className="text-[11px] text-slate-600">Penetapan 2 SDGs pilihan tersebut wajib dituangkan secara formal dalam dokumen Renstra atau laporan kinerja tahunan untuk dapat dinilai oleh asesor.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Budaya Mutu */}
              <div className="glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="text-white px-4 py-3 flex items-center gap-2.5" style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)" }}>
                  <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                  <div>
                    <h4 className="text-sm font-bold">Penilaian Wajib Budaya Mutu</h4>
                    <p className="text-[10px] text-white/70">Indikator 3</p>
                  </div>
                </div>
                <div className="p-4 space-y-3 bg-white">
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg transition-colors hover:bg-white" style={{ background: "linear-gradient(135deg, rgba(248,250,252,0.8), rgba(238,242,247,0.5))", borderLeft: `2px solid ${GOLD}` }}>
                      <CircleCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Pelaporan Berkala</p>
                        <p className="text-[11px] text-slate-600">Institusi wajib memiliki laporan implementasi SPMI tingkat perguruan tinggi secara berkala melalui PD Dikti.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg transition-colors hover:bg-white" style={{ background: "linear-gradient(135deg, rgba(248,250,252,0.8), rgba(238,242,247,0.5))", borderLeft: `2px solid ${GOLD}` }}>
                      <CircleCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TEAL }} />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Siklus PPEPP</p>
                        <p className="text-[11px] text-slate-600">Penilaian wajib menunjukkan keberfungsian siklus <strong>Penetapan, Pelaksanaan, Evaluasi, Pengendalian, dan Peningkatan</strong> standar pendidikan tinggi secara terencana dan berkelanjutan.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ============ RENDER: GLOBAL/FAKULTAS DASHBOARD ============
  const renderAggregatedDashboard = () => {
    const isGlobal = navSelection.mode === "global";
    const fakultas = !isGlobal ? getFakultasById(navSelection.id) : null;
    const prodiIds = isGlobal
      ? ALL_PRODI.map((p) => p.id)
      : getProdiByFakultas(navSelection.id).map((p) => p.id);

    const title = isGlobal ? "Global Universitas" : fakultas?.nama || "";
    const subtitle = isGlobal
      ? "Akumulasi pencapaian IKU dari seluruh program studi"
      : `Akumulasi pencapaian IKU dari ${getProdiByFakultas(navSelection.id).map((p) => p.nama).join(", ")}`;

    // Calculate values per IKU
    const ikuValues = IKU_LIST.map((iku) => ({
      ...iku,
      value: calcAggregatedValue(iku.id, prodiIds),
    }));

    // Per-prodi comparison data
    const prodiComparison = prodiIds.map((pid) => {
      const prodi = getProdiById(pid);
      return {
        id: pid,
        nama: prodi?.nama || pid,
        shortName: prodi?.nama.replace("S1 ", "").replace("D3 ", "") || pid,
        values: IKU_LIST.map((iku) => ({
          ikuId: iku.id,
          label: iku.label,
          value: calcProdiValue(iku.id, pid),
        })),
      };
    });

    // Bar chart data for each IKU
    const ikuBarData = IKU_LIST.map((iku) => ({
      name: iku.label,
      shortTitle: iku.shortTitle,
      value: calcAggregatedValue(iku.id, prodiIds),
      prodiCount: prodiIds.filter((pid) => {
        const d = getProdiData(pid);
        return d && d[iku.id as keyof IkuRecord] !== null && hasData(d[iku.id as keyof IkuRecord] as Record<string, unknown>);
      }).length,
    }));

    const barConfig: ChartConfig = {
      value: { label: "Capaian (%)", color: PRIMARY },
    };

    const radarConfig: ChartConfig = {
      value: { label: "Capaian", color: PRIMARY },
    };

    const hasAnyData = ikuValues.some((v) => v.value > 0);

    return (
      <div className="space-y-6">
        {/* Header */}
        <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-xl" style={{ borderLeft: `4px solid ${PRIMARY}` }}>
          <CardContent className="p-5">
            <h2 className="text-lg font-bold gradient-text">{title}</h2>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            <p className="text-xs text-slate-400 mt-0.5">Tahun Akademik {tahun}</p>
          </CardContent>
        </Card>

        {/* Tabs: Dashboard & SPMI */}
        <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-4">
          <TabsList className="iku-tabs w-full flex h-auto p-1.5 rounded-xl gap-1" style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.05), rgba(30,41,59,0.08))" }}>
            <TabsTrigger value="dashboard" className="text-sm font-semibold px-6 py-2.5 rounded-lg whitespace-nowrap data-[state=active]:shadow-lg transition-all duration-200 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard IKU
            </TabsTrigger>
            <TabsTrigger value="spmi" className="text-sm font-semibold px-6 py-2.5 rounded-lg whitespace-nowrap data-[state=active]:shadow-lg transition-all duration-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              SPMI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-4 space-y-6">
            {!hasAnyData ? (
              <Card className="glass-card overflow-hidden">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: `${PRIMARY}40` }} />
                  <h3 className="text-lg font-semibold text-slate-500 mb-2">Belum Ada Data</h3>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    Silakan pilih program studi di sidebar kiri dan masukkan data IKU terlebih dahulu.
                    Data yang diinput akan otomatis diagregasi di halaman ini.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Data Completeness Warning */}
                {(() => {
                  const coverageList = IKU_LIST.map((iku) => ({
                    ...iku,
                    coverage: getIkuCoverage(iku.id, prodiIds),
                  }));
                  const incompleteIkus = coverageList.filter((c) => c.coverage.filled < c.coverage.total);
                  if (incompleteIkus.length > 0) {
                    return (
                      <Card className="glass-card overflow-hidden" style={{ borderLeft: `3px solid ${GOLD}` }}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: GOLD }} />
                            <div>
                              <h4 className="text-sm font-semibold text-amber-800">Data Belum Lengkap</h4>
                              <p className="text-xs text-amber-700 mt-1">
                                Prodi yang belum mengisi data otomatis dihitung <strong>0%</strong>, sehingga mempengaruhi rata-rata universitas. 
                                Lengkapi data semua prodi untuk mendapatkan angka akumulasi yang akurat.
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {coverageList.map((c) => (
                                  <Badge key={c.id} variant="outline" className={`text-[10px] ${c.coverage.filled < c.coverage.total ? "border-amber-300 text-amber-700 bg-amber-100/50" : "border-emerald-300 text-emerald-700 bg-emerald-100/50"}`}>
                                    {c.label}: {c.coverage.filled}/{c.coverage.total} prodi
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                  return null;
                })()}

                {/* KPI Summary — Unified Horizontal Panel */}
                <div className="kpi-panel bg-white border border-slate-100 shadow-sm">
                  {/* Panel Header */}
                  <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${PRIMARY}15, ${SECONDARY}10)` }}>
                        <BarChart3 className="w-4 h-4" style={{ color: PRIMARY }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Capaian Indikator Kinerja Utama</h3>
                        <p className="text-[11px] text-slate-400 font-medium">Ringkasan persentase pencapaian setiap IKU</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-slate-400">TAHUN {tahun}</span>
                    </div>
                  </div>

                  {/* IKU Rows */}
                  <div className="px-6 pb-5 space-y-0">
                    {ikuValues.map((iku, idx) => {
                      const coverage = getIkuCoverage(iku.id, prodiIds);
                      const isComplete = coverage.filled === coverage.total;
                      const ikuColor = IKU_COLORS[iku.id] || PRIMARY;
                      const pct = Math.min(iku.value, 100);
                      // Mini SVG ring math
                      const miniR = 16;
                      const miniCirc = 2 * Math.PI * miniR;
                      const miniOffset = miniCirc - (pct / 100) * miniCirc;
                      const ikuIcon = iku.id === "iku1" ? GraduationCap : iku.id === "iku2" ? Briefcase : iku.id === "iku3" ? Trophy : iku.id === "iku5" ? Handshake : iku.id === "iku7" ? Globe : iku.id === "iku9" ? Wallet : Users;
                      const IkuIcon = ikuIcon;

                      // Determine status
                      const statusLabel = pct >= 75 ? "Baik" : pct >= 50 ? "Cukup" : pct >= 25 ? "Perlu Perhatian" : "Belum Tercapai";
                      const statusColor = pct >= 75 ? "#059669" : pct >= 50 ? "#D97706" : pct >= 25 ? "#EA580C" : "#DC2626";

                      return (
                        <div
                          key={iku.id}
                          className="kpi-row py-4"
                          style={{ "--bar-color": ikuColor } as React.CSSProperties}
                        >
                          {/* Separator line */}
                          {idx > 0 && (
                            <div className="absolute top-0 left-0 right-0 h-px bg-slate-100" />
                          )}

                          <div className="flex items-center gap-4">
                            {/* Mini circular indicator */}
                            <div className="relative shrink-0" style={{ width: 48, height: 48 }}>
                              <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
                                <circle cx="20" cy="20" r={miniR} className="kpi-mini-ring-track" stroke={ikuColor} strokeWidth="3.5" />
                                <circle
                                  cx="20" cy="20" r={miniR}
                                  className="kpi-mini-ring-fill"
                                  stroke={ikuColor}
                                  strokeWidth="3.5"
                                  strokeDasharray={miniCirc}
                                  strokeDashoffset={iku.value > 0 ? miniOffset : miniCirc}
                                  style={{ filter: iku.value > 0 ? `drop-shadow(0 0 4px ${ikuColor}60)` : "none" }}
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <IkuIcon className="w-3.5 h-3.5" style={{ color: iku.value > 0 ? ikuColor : "#CBD5E1" }} />
                              </div>
                            </div>

                            {/* Label + Bar */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold tracking-wide" style={{ color: ikuColor }}>{iku.label}</span>
                                  <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">— {iku.shortTitle}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  {/* Status badge */}
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full hidden md:inline-block"
                                    style={{
                                      color: statusColor,
                                      backgroundColor: `${statusColor}12`,
                                    }}
                                  >
                                    {statusLabel}
                                  </span>
                                  {/* Coverage */}
                                  <div className="flex items-center gap-1">
                                    {isComplete ? (
                                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    ) : (
                                      <AlertCircle className="w-3 h-3 text-amber-400" />
                                    )}
                                    <span className="text-[10px] font-semibold" style={{ color: isComplete ? "#059669" : "#D97706" }}>
                                      {coverage.filled}/{coverage.total}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Progress Bar + Percentage */}
                              <div className="flex items-center gap-3">
                                <div className="flex-1 kpi-bar-track" style={{ backgroundColor: `${ikuColor}10` }}>
                                  <div
                                    className="kpi-bar-fill"
                                    style={{
                                      width: `${pct}%`,
                                      background: iku.value > 0
                                        ? `linear-gradient(90deg, ${ikuColor}cc, ${ikuColor})`
                                        : "transparent",
                                    }}
                                  />
                                </div>
                                <div className="shrink-0 w-16 text-right">
                                  <span
                                    className="text-lg font-black leading-none"
                                    style={iku.value > 0 ? {
                                      background: `linear-gradient(135deg, ${ikuColor}, ${ikuColor}bb)`,
                                      WebkitBackgroundClip: "text",
                                      WebkitTextFillColor: "transparent",
                                    } : { color: "#E2E8F0" }}
                                  >
                                    {iku.value.toFixed(1)}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400 ml-0.5">%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Radar Chart */}
                  <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold gradient-text">Radar Pencapaian IKU</CardTitle>
                      <CardDescription>Gabungan dari {prodiIds.length} program studi</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={radarConfig} className="h-[300px] w-full">
                        <RadarChart data={ikuValues.map((v) => ({ iku: v.shortTitle, value: v.value }))}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="iku" tick={{ fontSize: 10, fill: "#475569" }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                          <Radar name="Capaian" dataKey="value" stroke={PRIMARY} fill={SECONDARY} fillOpacity={0.15} strokeWidth={2} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </RadarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Bar Chart */}
                  <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold gradient-text">Capaian per IKU</CardTitle>
                      <CardDescription>Persentase capaian setiap indikator</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={barConfig} className="h-[300px] w-full">
                        <BarChart data={ikuBarData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="value" fill={PRIMARY} radius={[6, 6, 0, 0]} barSize={35} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Per-Prodi Comparison */}
                {prodiComparison.length > 1 && (
                  <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold gradient-text">Perbandingan per Program Studi</CardTitle>
                      <CardDescription>Capaian IKU setiap program studi dalam {isGlobal ? "universitas" : fakultas?.nama}</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2" style={{ borderColor: `${PRIMARY}30`, background: "linear-gradient(135deg, #F8FAFC, #EEF2F7)" }}>
                            <th className="text-left py-2.5 px-3 font-semibold text-xs" style={{ color: PRIMARY }}>Program Studi</th>
                            {IKU_LIST.map((iku) => (
                              <th key={iku.id} className="text-center py-2.5 px-2 font-semibold text-xs" style={{ color: IKU_COLORS[iku.id] }}>{iku.label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {prodiComparison.map((prodi) => (
                            <tr key={prodi.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                              <td className="py-2 px-3 font-medium text-slate-700 text-xs">{prodi.nama}</td>
                              {prodi.values.map((v) => (
                                <td key={v.ikuId} className="py-2 px-2 text-center">
                                  <span className="text-xs font-semibold" style={{ color: v.value > 0 ? IKU_COLORS[v.ikuId] : "#CBD5E1" }}>
                                    {v.value > 0 ? `${v.value.toFixed(1)}%` : "-"}
                                  </span>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                )}

                {/* Per-IKU per-prodi bar charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {IKU_LIST.map((iku) => {
                    const data = prodiComparison.map((p) => ({
                      name: p.shortName,
                      value: p.values.find((v) => v.ikuId === iku.id)?.value || 0,
                    }));
                    const prodiConfig: ChartConfig = { value: { label: iku.shortTitle, color: CHART_COLORS[IKU_LIST.indexOf(iku) % CHART_COLORS.length] } };

                    return (
                      <Card key={iku.id} className="glass-card overflow-hidden transition-all duration-300 hover:shadow-xl">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-semibold" style={{ color: IKU_COLORS[iku.id] }}>{iku.label} - {iku.shortTitle}</CardTitle>
                          <CardDescription className="text-xs">Perbandingan antar program studi</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ChartContainer config={prodiConfig} className="h-[200px] w-full">
                            <BarChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#475569" }} />
                              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Bar dataKey="value" fill={CHART_COLORS[IKU_LIST.indexOf(iku) % CHART_COLORS.length]} radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* IKU 12 Special: Dokumen Summary */}
                {(() => {
                  const iku12DataList: Iku12Data[] = [];
                  prodiIds.forEach((pid) => {
                    const d = getProdiData(pid);
                    if (d?.iku12) iku12DataList.push(d.iku12);
                  });
                  if (iku12DataList.length === 0) return null;
                  const summary = calcIKU12_DokumenSummary(iku12DataList);
                  const pieData = [
                    { name: "Tersedia", value: summary.ya, fill: TEAL },
                    { name: "Sebagian", value: summary.sebagian, fill: GOLD },
                    { name: "Belum Tersedia", value: summary.tidak, fill: CORAL },
                  ];
                  const pieConfig: ChartConfig = { value: { label: "Jumlah Prodi" } };

                  return (
                    <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold gradient-text">IKU 12 - Ketersediaan Dokumen Perencanaan</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="max-w-sm mx-auto">
                          <ChartContainer config={pieConfig} className="h-[250px] w-full">
                            <PieChart>
                              <Pie data={pieData.filter((d) => d.value > 0)} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}>
                                {pieData.filter((d) => d.value > 0).map((d, idx) => (
                                  <Cell key={idx} fill={d.fill} />
                                ))}
                              </Pie>
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <ChartLegend content={<ChartLegendContent />} />
                            </PieChart>
                          </ChartContainer>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </>
            )}
          </TabsContent>

          <TabsContent value="spmi" className="mt-4">
            {renderSpmiTab(prodiIds, isGlobal)}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  // ============ RENDER: MAIN ============
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F8FAFC, #EEF2F7)" }}>
        <div className="text-center">
          <div className="w-14 h-14 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "rgba(185,28,28,0.2)", borderTopColor: PRIMARY }} />
          <p className="font-semibold gradient-text text-lg">Memuat Dashboard IKU...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #F8FAFC 0%, #EEF2F7 100%)" }}>
      {/* Header Banner with Wave */}
      <header className="relative text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #8B1A1A 0%, #B91C1C 30%, #1E3A5F 70%, #1E40AF 100%)" }}>
        {/* Decorative geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10" style={{ background: "radial-gradient(circle, rgba(212,168,67,0.3), transparent)" }} />
          <div className="absolute top-2 right-20 w-20 h-20 rounded-full opacity-10" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.2), transparent)" }} />
          <div className="absolute -bottom-5 left-20 w-32 h-32 rounded-full opacity-5" style={{ background: "radial-gradient(circle, rgba(212,168,67,0.3), transparent)" }} />
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        </div>
        <div className="relative flex items-center justify-between h-16 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-2.5">
              <img src="/logo-unita.png" alt="UNITA" className="w-9 h-9 object-contain rounded-lg bg-white/10 p-1" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight">Universitas Tulungagung</h1>
              <p className="text-[10px] sm:text-xs text-white/70 font-medium">Dashboard Indikator Kinerja Utama</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="font-bold text-xs px-3 py-1 border-0" style={{ background: "linear-gradient(135deg, #D4A843, #C9952E)", color: "#1a1a1a" }}>IKU WAJIB</Badge>
          </div>
        </div>
        {/* Wave bottom edge */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 32L48 26.7C96 21.3 192 10.7 288 8C384 5.3 480 10.7 576 14.7C672 18.7 768 21.3 864 20C960 18.7 1056 13.3 1152 10.7C1248 8 1344 8 1392 8L1440 8V32H1392C1344 32 1248 32 1152 32C1056 32 960 32 864 32C768 32 672 32 576 32C480 32 384 32 288 32C192 32 96 32 48 32H0Z" fill="#EEF2F7"/>
          </svg>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex relative">
        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative z-50 h-full">
              {renderSidebar()}
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden md:block">{renderSidebar()}</div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 pb-20 md:pb-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs mb-5">
            <button onClick={() => setNavSelection({ mode: "global", id: "global" })} className="transition-colors hover:underline" style={{ color: SECONDARY }}>Global</button>
            {navSelection.mode === "fakultas" && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="font-semibold" style={{ color: PRIMARY }}>{getFakultasById(navSelection.id)?.nama}</span>
              </>
            )}
            {navSelection.mode === "prodi" && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <button onClick={() => setNavSelection({ mode: "fakultas", id: getProdiById(navSelection.id)?.fakultasId || "" })} className="transition-colors hover:underline" style={{ color: SECONDARY }}>
                  {getFakultasById(getProdiById(navSelection.id)?.fakultasId || "")?.nama}
                </button>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="font-semibold" style={{ color: PRIMARY }}>{getProdiById(navSelection.id)?.nama}</span>
              </>
            )}
          </div>

          {navSelection.mode === "prodi" ? renderProdiForm() : renderAggregatedDashboard()}
        </main>
      </div>

      {/* Footer */}
      <footer className="relative text-white/70 py-3 overflow-hidden" style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)" }}>
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)", backgroundSize: "20px 20px" }} />
        <div className="relative flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" style={{ color: GOLD }} />
            <span className="text-xs">Dashboard IKU - Universitas Tulungagung</span>
          </div>
          <p className="text-[10px] text-white/40">Kepmendiktisaintek No. 358/M/KEP/2026</p>
        </div>
      </footer>
    </div>
  );
}
