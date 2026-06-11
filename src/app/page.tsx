"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GraduationCap, Briefcase, Trophy, Handshake, Globe, Wallet, Users,
  BarChart3, ChevronRight, ChevronDown, Building2, Calendar, BookOpen,
  Save, CheckCircle2, AlertCircle, Plus, Trash2, RotateCcw, Info, Calculator
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  calcIKU2, calcIKU2_Aggregate, calcIKU3, calcIKU3_Aggregate,
  calcIKU5, calcIKU5_Aggregate, calcIKU7, calcIKU7_Aggregate,
  calcIKU9, calcIKU9_Aggregate, calcIKU12_Skor, calcIKU12_Aggregate,
  calcIKU12_DokumenSummary, hasData,
} from "@/lib/iku-calculations";
import type { Iku1Data, Iku2Data, Iku3Data, Iku5Data, Iku7Data, Iku9Data, Iku12Data } from "@/lib/iku-calculations";

// ============ COLORS ============
const NAVY = "#1a2744";
const NAVY_LIGHT = "#243558";
const TEAL = "#2d8a7e";
const GOLD = "#c9a84c";
const CORAL = "#c75c5c";
const CHART_COLORS = [NAVY, TEAL, GOLD, CORAL, "#3d5a8a", "#5bb5ab", "#e0c873"];

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

  // Form state for current prodi+tahun
  const [formData, setFormData] = useState<Record<string, Record<string, number | string>>>({});

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/iku?tahun=${tahun}`);
      const data = await res.json();
      setAllData(data);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [tahun]);

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

  // Save handler
  const handleSave = async (ikuId: string) => {
    if (navSelection.mode !== "prodi") return;
    const prodi = getProdiById(navSelection.id);
    if (!prodi) return;

    setSaving(ikuId);
    try {
      const res = await fetch("/api/iku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prodi: prodi.id,
          fakultas: prodi.fakultasId,
          tahun,
          ikuId,
          data: formData[ikuId],
        }),
      });
      if (res.ok) {
        setSaveSuccess(ikuId);
        setTimeout(() => setSaveSuccess(null), 2000);
        await fetchData();
        toast.success("Data berhasil disimpan", { description: `${IKU_LIST.find((i) => i.id === ikuId)?.label} - ${prodi.nama} (${tahun})` });
      }
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
      case "iku1": return calcAEE_AchievementRate(data as Iku1Data, prodi?.jenjang || "S1");
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
    const dataList: Record<string, unknown>[] = [];
    const prodiJenjangs: string[] = [];

    prodiIds.forEach((pid) => {
      const prodiData = getProdiData(pid);
      if (prodiData) {
        const data = prodiData[ikuId as keyof IkuRecord];
        if (data && hasData(data as Record<string, unknown>)) {
          dataList.push(data as Record<string, unknown>);
          const prodi = getProdiById(pid);
          if (prodi) prodiJenjangs.push(prodi.jenjang);
        }
      }
    });

    if (dataList.length === 0) return 0;

    switch (ikuId) {
      case "iku1": {
        const validData = dataList.map((d, i) => ({ data: d as Iku1Data, jenjang: prodiJenjangs[i] || "S1" }));
        return calcAEE_PT(validData);
      }
      case "iku2": return calcIKU2_Aggregate(dataList as Iku2Data[]);
      case "iku3": return calcIKU3_Aggregate(dataList as Iku3Data[]);
      case "iku5": return calcIKU5_Aggregate(dataList as Iku5Data[]);
      case "iku7": return calcIKU7_Aggregate(dataList as Iku7Data[]);
      case "iku9": return calcIKU9_Aggregate(dataList as Iku9Data[]);
      case "iku12": return calcIKU12_Aggregate(dataList as Iku12Data[]);
      default: return 0;
    }
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
    <aside className="w-64 lg:w-72 shrink-0 bg-white border-r border-slate-200 overflow-y-auto custom-scrollbar">
      {/* University Header */}
      <div className="p-4 bg-navy text-white">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-5 h-5 text-gold" />
          <span className="font-bold text-sm">Universitas Tulungagung</span>
        </div>
        <p className="text-xs text-white/60">Dashboard IKU Perguruan Tinggi</p>
      </div>

      {/* Year Selector */}
      <div className="p-3 border-b border-slate-100">
        <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Tahun Akademik</Label>
        <Select value={tahun.toString()} onValueChange={(v) => setTahun(parseInt(v))}>
          <SelectTrigger className="h-9 text-sm border-slate-200">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
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
          onClick={() => setNavSelection({ mode: "global", id: "global" })}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            navSelection.mode === "global"
              ? "bg-navy text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <BarChart3 className="w-4 h-4 shrink-0" />
          <span>Global Universitas</span>
          {allData.length > 0 && (
            <Badge className="ml-auto text-[10px] bg-teal text-white px-1.5 py-0">
              {allData.filter((d) => IKU_LIST.some((iku) => d[iku.id as keyof IkuRecord] !== null && hasData(d[iku.id as keyof IkuRecord] as Record<string, unknown>))).length} prodi
            </Badge>
          )}
        </button>

        <Separator className="my-2" />

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
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  isSelected ? "bg-navy/10 text-navy font-semibold" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate flex-1 text-left">{fakultas.nama.replace("Fakultas ", "F. ")}</span>
                {hasD && <div className="w-2 h-2 rounded-full bg-teal shrink-0" />}
              </button>

              {isExpanded && (
                <div className="ml-5 mt-0.5 space-y-0.5">
                  {fakultas.prodiList.map((prodi) => {
                    const isProdiSelected = navSelection.mode === "prodi" && navSelection.id === prodi.id;
                    const prodiHasD = getProdiHasData(prodi.id);
                    return (
                      <button
                        key={prodi.id}
                        onClick={() => setNavSelection({ mode: "prodi", id: prodi.id })}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all ${
                          isProdiSelected
                            ? "bg-navy text-white font-medium"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        }`}
                      >
                        <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate flex-1 text-left">{prodi.nama}</span>
                        {prodiHasD && <div className="w-1.5 h-1.5 rounded-full bg-teal shrink-0" />}
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
        <Card className="border-l-4 border-l-navy">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-navy">{prodi.nama}</h2>
                <p className="text-sm text-slate-500">{fakultas?.nama} • Tahun Akademik {tahun}</p>
              </div>
              <Badge variant="outline" className="w-fit text-xs">{prodi.jenjang}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* IKU Tabs */}
        <Tabs defaultValue="iku1" className="space-y-4">
          <TabsList className="iku-tabs w-full flex h-auto p-1 bg-slate-100/80 rounded-lg gap-0.5 overflow-x-auto">
            {IKU_LIST.map((iku) => (
              <TabsTrigger key={iku.id} value={iku.id} className="text-xs font-semibold px-3 py-2 rounded-md whitespace-nowrap data-[state=active]:shadow-md transition-all">
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
                  previewValue = calcAEE_AchievementRate(d, prodi.jenjang);
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
                  <Card className="lg:col-span-2 border border-slate-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-navy">{iku.title}</CardTitle>
                      <CardDescription className="text-xs">Masukkan data untuk {prodi.nama} tahun {tahun}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {iku.id === "iku1" && (
                        <div className="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-100">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-navy mt-0.5 shrink-0" />
                            <div className="text-xs text-slate-600">
                              <p className="font-semibold text-navy mb-1">Rumus IKU 1 (AEE PT):</p>
                              <p>AEE = (Lulus Tepat Waktu / Total Masuk) × 100%</p>
                              <p>Tingkat Pencapaian = (AEE Realisasi / AEE Ideal) × 100%</p>
                              <p>AEE Ideal {prodi.jenjang} = {(() => { const v = { D3: 33, D4: 25, S1: 25, S2: 50, S3: 33 } as Record<string, number>; return v[prodi.jenjang] || 25; })()}%</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {iku.id === "iku2" && (
                        <div className="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-100">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-navy mt-0.5 shrink-0" />
                            <div className="text-xs text-slate-600">
                              <p className="font-semibold text-navy mb-1">Rumus IKU 2:</p>
                              <p>Persentase = Σ(n × k) / t × 100%</p>
                              <p>n: Jumlah responden per kategori; k: Konstanta bobot; t: Total responden</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {iku.id === "iku3" && (
                        <div className="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-100">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-navy mt-0.5 shrink-0" />
                            <div className="text-xs text-slate-600">
                              <p className="font-semibold text-navy mb-1">Rumus IKU 3:</p>
                              <p>Persentase = (Jumlah Mhs Kegiatan × Bobot) / Total Mahasiswa × 100%</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {iku.id === "iku5" && (
                        <div className="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-100">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-navy mt-0.5 shrink-0" />
                            <div className="text-xs text-slate-600">
                              <p className="font-semibold text-navy mb-1">Rumus IKU 5:</p>
                              <p>Persentase = Jumlah Luaran / Total Kerja Sama × 100%</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {iku.id === "iku7" && (
                        <div className="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-100">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-navy mt-0.5 shrink-0" />
                            <div className="text-xs text-slate-600">
                              <p className="font-semibold text-navy mb-1">Rumus IKU 7:</p>
                              <p>Persentase = Jumlah Program SDG / Total Program × 100%</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {iku.id === "iku9" && (
                        <div className="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-100">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-navy mt-0.5 shrink-0" />
                            <div className="text-xs text-slate-600">
                              <p className="font-semibold text-navy mb-1">Rumus IKU 9:</p>
                              <p>Persentase = Pendapatan Non-Akademik / Total Pendapatan × 100%</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {iku.id === "iku12" && (
                        <div className="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-100">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-navy mt-0.5 shrink-0" />
                            <div className="text-xs text-slate-600">
                              <p className="font-semibold text-navy mb-1">Rumus IKU 12:</p>
                              <p>Ketersediaan Dokumen Perencanaan Strategis resmi peningkatan kesejahteraan dosen</p>
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
                              <SelectTrigger className="h-9 text-sm border-slate-200">
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
                              className="h-9 text-sm border-slate-200"
                            />
                          )}
                        </div>
                      ))}

                      <Separator className="my-4" />

                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => handleSave(iku.id)}
                          disabled={isSaving}
                          className="bg-navy hover:bg-navy-light text-white text-sm"
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
                  <Card className="border border-slate-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-navy flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        Hasil Perhitungan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-4">
                        <p className="text-4xl font-bold text-navy">{previewValue.toFixed(1)}%</p>
                        <p className="text-xs text-slate-500 mt-2">{iku.shortTitle}</p>
                        {iku.id === "iku1" && (
                          <p className="text-xs text-slate-400 mt-1">Tingkat Pencapaian AEE</p>
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
                              <div className="flex justify-between"><span className="text-slate-500">AEE Realisasi:</span><span className="font-medium">{aeeReal.toFixed(2)}%</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">AEE Ideal ({prodi.jenjang}):</span><span className="font-medium">{ideal}%</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Tingkat Pencapaian:</span><span className="font-bold text-navy">{previewValue.toFixed(2)}%</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Mahasiswa Masuk:</span><span className="font-medium">{d.jumlahMasuk || 0}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Lulus Tepat Waktu:</span><span className="font-medium">{d.lulusTepatWaktu || 0}</span></div>
                            </>
                          );
                        })()}
                        {iku.id === "iku2" && (() => {
                          const d = currentData as unknown as Iku2Data;
                          const weighted = d.bekerjaJumlah * d.bekerjaBobot + d.wirausahaJumlah * d.wirausahaBobot + d.studiJumlah * 0.6 + d.sudahBekerjaJumlah * d.sudahBekerjaBobot;
                          return (
                            <>
                              <div className="flex justify-between"><span className="text-slate-500">Σ(n × k) Bekerja:</span><span className="font-medium">{(d.bekerjaJumlah * d.bekerjaBobot).toFixed(1)}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Σ(n × k) Wirausaha:</span><span className="font-medium">{(d.wirausahaJumlah * d.wirausahaBobot).toFixed(1)}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Σ(n × k) Studi:</span><span className="font-medium">{(d.studiJumlah * 0.6).toFixed(1)}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Σ(n × k) Sudah Bekerja:</span><span className="font-medium">{(d.sudahBekerjaJumlah * d.sudahBekerjaBobot).toFixed(1)}</span></div>
                              <Separator className="my-1" />
                              <div className="flex justify-between"><span className="text-slate-500">Total Σ(n × k):</span><span className="font-medium">{weighted.toFixed(1)}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Total Responden:</span><span className="font-medium">{d.totalResponden || 0}</span></div>
                            </>
                          );
                        })()}
                        {iku.id === "iku3" && (() => {
                          const d = currentData as unknown as Iku3Data;
                          return (
                            <>
                              <div className="flex justify-between"><span className="text-slate-500">Mhs Kegiatan (tertimbang):</span><span className="font-medium">{d.mahasiswaKegiatan || 0}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Bobot Rata-rata:</span><span className="font-medium">{d.bobotKegiatan || 0}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Total Mahasiswa:</span><span className="font-medium">{d.totalMahasiswa || 0}</span></div>
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
      value: { label: "Capaian (%)", color: NAVY },
    };

    const radarConfig: ChartConfig = {
      value: { label: "Capaian", color: NAVY },
    };

    const hasAnyData = ikuValues.some((v) => v.value > 0);

    return (
      <div className="space-y-6">
        {/* Header */}
        <Card className="border-l-4 border-l-navy">
          <CardContent className="p-5">
            <h2 className="text-lg font-bold text-navy">{title}</h2>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            <p className="text-xs text-slate-400 mt-0.5">Tahun Akademik {tahun}</p>
          </CardContent>
        </Card>

        {!hasAnyData ? (
          <Card className="border border-slate-200">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-500 mb-2">Belum Ada Data</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Silakan pilih program studi di sidebar kiri dan masukkan data IKU terlebih dahulu.
                Data yang diinput akan otomatis diagregasi di halaman ini.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {ikuValues.map((iku, idx) => (
                <Card key={iku.id} className="border border-slate-200 animate-fade-in" style={{ animationDelay: `${idx * 80}ms` }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-md bg-navy/10">
                        {iku.id === "iku1" && <GraduationCap className="w-3.5 h-3.5 text-navy" />}
                        {iku.id === "iku2" && <Briefcase className="w-3.5 h-3.5 text-navy" />}
                        {iku.id === "iku3" && <Trophy className="w-3.5 h-3.5 text-navy" />}
                        {iku.id === "iku5" && <Handshake className="w-3.5 h-3.5 text-navy" />}
                        {iku.id === "iku7" && <Globe className="w-3.5 h-3.5 text-navy" />}
                        {iku.id === "iku9" && <Wallet className="w-3.5 h-3.5 text-navy" />}
                        {iku.id === "iku12" && <Users className="w-3.5 h-3.5 text-navy" />}
                      </div>
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{iku.shortTitle}</span>
                    </div>
                    <p className={`text-3xl font-bold ${iku.value > 0 ? "text-navy" : "text-slate-300"}`}>
                      {iku.value.toFixed(1)}%
                    </p>
                    <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-navy h-1.5 rounded-full transition-all" style={{ width: `${Math.min(iku.value, 100)}%` }} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <Card className="border border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-navy">Radar Pencapaian IKU</CardTitle>
                  <CardDescription>Gabungan dari {prodiIds.length} program studi</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={radarConfig} className="h-[300px] w-full">
                    <RadarChart data={ikuValues.map((v) => ({ iku: v.shortTitle, value: v.value }))}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="iku" tick={{ fontSize: 10, fill: "#475569" }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                      <Radar name="Capaian" dataKey="value" stroke={NAVY} fill={NAVY} fillOpacity={0.2} strokeWidth={2} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RadarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Bar Chart */}
              <Card className="border border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-navy">Capaian per IKU</CardTitle>
                  <CardDescription>Persentase capaian setiap indikator</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={barConfig} className="h-[300px] w-full">
                    <BarChart data={ikuBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill={NAVY} radius={[4, 4, 0, 0]} barSize={35} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Per-Prodi Comparison */}
            {prodiComparison.length > 1 && (
              <Card className="border border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-navy">Perbandingan per Program Studi</CardTitle>
                  <CardDescription>Capaian IKU setiap program studi dalam {isGlobal ? "universitas" : fakultas?.nama}</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left py-2.5 px-3 font-semibold text-navy text-xs">Program Studi</th>
                        {IKU_LIST.map((iku) => (
                          <th key={iku.id} className="text-center py-2.5 px-2 font-semibold text-navy text-xs">{iku.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {prodiComparison.map((prodi) => (
                        <tr key={prodi.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-2 px-3 font-medium text-slate-700 text-xs">{prodi.nama}</td>
                          {prodi.values.map((v) => (
                            <td key={v.ikuId} className="py-2 px-2 text-center">
                              <span className={`text-xs font-semibold ${v.value > 0 ? "text-navy" : "text-slate-300"}`}>
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
                  <Card key={iku.id} className="border border-slate-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-navy">{iku.label} - {iku.shortTitle}</CardTitle>
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
                <Card className="border border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-navy">IKU 12 - Ketersediaan Dokumen Perencanaan</CardTitle>
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
      </div>
    );
  };

  // ============ RENDER: MAIN ============
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Memuat Dashboard IKU...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-navy text-white shadow-lg sticky top-0 z-50">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <Building2 className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">Universitas Tulungagung</h1>
              <p className="text-[10px] text-white/60">Dashboard Indikator Kinerja Utama</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-gold text-navy font-semibold text-xs px-2.5 py-0.5">IKU WAJIB</Badge>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="hidden md:block">{renderSidebar()}</div>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 p-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setNavSelection({ mode: "global", id: "global" })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${navSelection.mode === "global" ? "bg-navy text-white" : "bg-slate-100 text-slate-600"}`}
            >
              Global
            </button>
            {FAKULTAS_LIST.map((f) => (
              <button
                key={f.id}
                onClick={() => setNavSelection({ mode: "fakultas", id: f.id })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${navSelection.mode === "fakultas" && navSelection.id === f.id ? "bg-navy text-white" : "bg-slate-100 text-slate-600"}`}
              >
                {f.nama.replace("Fakultas ", "F. ")}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 pb-20 md:pb-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
            <button onClick={() => setNavSelection({ mode: "global", id: "global" })} className="hover:text-navy transition-colors">Global</button>
            {navSelection.mode === "fakultas" && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-navy font-medium">{getFakultasById(navSelection.id)?.nama}</span>
              </>
            )}
            {navSelection.mode === "prodi" && (
              <>
                <ChevronRight className="w-3 h-3" />
                <button onClick={() => setNavSelection({ mode: "fakultas", id: getProdiById(navSelection.id)?.fakultasId || "" })} className="hover:text-navy transition-colors">
                  {getFakultasById(getProdiById(navSelection.id)?.fakultasId || "")?.nama}
                </button>
                <ChevronRight className="w-3 h-3" />
                <span className="text-navy font-medium">{getProdiById(navSelection.id)?.nama}</span>
              </>
            )}
          </div>

          {navSelection.mode === "prodi" ? renderProdiForm() : renderAggregatedDashboard()}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-navy text-white/70 py-3">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-gold" />
            <span className="text-xs">Dashboard IKU - Universitas Tulungagung</span>
          </div>
          <p className="text-[10px] text-white/40">Kepmendiktisaintek No. 358/M/KEP/2026</p>
        </div>
      </footer>
    </div>
  );
}
