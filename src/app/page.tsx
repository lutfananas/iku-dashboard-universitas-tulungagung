"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Briefcase,
  Trophy,
  Handshake,
  Globe,
  Wallet,
  Users,
  BarChart3,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Calendar,
  Building2,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// ============ CHART COLORS ============
const NAVY = "#1a2744";
const NAVY_LIGHT = "#243558";
const NAVY_LIGHTER = "#3d5a8a";
const GOLD = "#c9a84c";
const GOLD_LIGHT = "#e0c873";
const TEAL = "#2d8a7e";
const TEAL_LIGHT = "#5bb5ab";
const CORAL = "#c75c5c";
const CORAL_LIGHT = "#e88888";
const SLATE = "#64748b";
const CHART_COLORS = [NAVY, TEAL, GOLD, CORAL_LIGHT, NAVY_LIGHTER, TEAL_LIGHT, GOLD_LIGHT, SLATE];

// ============ TYPE DEFINITIONS ============
interface IkuData {
  universitas: string;
  tahun: number;
  ringkasan: Record<string, { nilai: number; target: number; satuan: string; label: string; status: string }>;
  iku1: {
    title: string; deskripsi: string; formula: string; nilai: number; target: number;
    aeeIdeal: Record<string, number>;
    perProdi: { prodi: string; jenjang: string; aeeRealisasi: number; aeeIdeal: number; pencapaian: number; mahasiswa: number; lulusTepat: number }[];
    trendTahunan: { tahun: number; nilai: number }[];
  };
  iku2: {
    title: string; deskripsi: string; formula: string; nilai: number; target: number;
    distribusi: { kategori: string; jumlah: number; persentase: number }[];
    masaTunggu: { range: string; jumlah: number; persentase: number }[];
    perFakultas: { fakultas: string; bekerja: number; wirausaha: number; studi: number; belum: number }[];
    trendTahunan: { tahun: number; nilai: number }[];
  };
  iku3: {
    title: string; deskripsi: string; formula: string; nilai: number; target: number;
    jenisKegiatan: { jenis: string; jumlah: number; persentase: number }[];
    prestasi: { tingkat: string; juara1: number; juara2_3: number; harapan: number; finalis: number }[];
    sksDiluar: { kategori: string; jumlah: number; bobot: number }[];
    trendTahunan: { tahun: number; nilai: number }[];
  };
  iku5: {
    title: string; deskripsi: string; formula: string; nilai: number; target: number;
    jenisKerjasama: { jenis: string; jumlah: number; aktif: number }[];
    luaran: { jenis: string; jumlah: number }[];
    perProdi: { prodi: string; kerjasama: number; luaran: number; persentase: number }[];
    trendTahunan: { tahun: number; nilai: number }[];
  };
  iku7: {
    title: string; deskripsi: string; formula: string; nilai: number; target: number;
    sdgDetail: { sdg: string; skor: number; kegiatan: string[]; jumlahKegiatan: number; jumlahMhsTerlibat: number }[];
    indikatorSDG: { indikator: string; skor: number }[];
    trendTahunan: { tahun: number; nilai: number }[];
  };
  iku9: {
    title: string; deskripsi: string; formula: string; nilai: number; target: number;
    sumberPendapatan: { sumber: string; nominal: number; persentase: number }[];
    perTahun: { tahun: number; akademik: number; nonAkademik: number; total: number; persentase: number }[];
    trendPersentase: { tahun: number; nilai: number }[];
  };
  iku12: {
    title: string; deskripsi: string; formula: string; nilai: number; target: number;
    indikator: { aspek: string; skor: number; ket: string }[];
    perFakultas: { fakultas: string; skor: number }[];
    realisasiAnggaran: { tahun: number; anggaran: number; realisasi: number; persentase: number }[];
    trendTahunan: { tahun: number; nilai: number }[];
  };
}

// ============ HELPER FUNCTIONS ============
function getStatusColor(nilai: number, target: number) {
  const ratio = nilai / target;
  if (ratio >= 0.95) return "text-emerald-600";
  if (ratio >= 0.8) return "text-amber-600";
  return "text-red-500";
}

function getStatusBg(nilai: number, target: number) {
  const ratio = nilai / target;
  if (ratio >= 0.95) return "bg-emerald-50 border-emerald-200";
  if (ratio >= 0.8) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

function getStatusIcon(nilai: number, target: number) {
  const ratio = nilai / target;
  if (ratio >= 0.95) return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  if (ratio >= 0.8) return <AlertTriangle className="w-4 h-4 text-amber-600" />;
  return <ArrowDownRight className="w-4 h-4 text-red-500" />;
}

function getProgressColor(nilai: number, target: number) {
  const ratio = nilai / target;
  if (ratio >= 0.95) return "bg-emerald-500";
  if (ratio >= 0.8) return "bg-amber-500";
  return "bg-red-500";
}

function getGapInfo(nilai: number, target: number) {
  const gap = target - nilai;
  if (gap <= 0) return { text: "Tercapai", color: "text-emerald-600" };
  return { text: `Gap: ${gap.toFixed(1)}%`, color: gap <= 5 ? "text-amber-600" : "text-red-500" };
}

// ============ KPI CARD COMPONENT ============
function KpiCard({ title, nilai, target, satuan, icon, index }: {
  title: string; nilai: number; target: number; satuan: string; icon: React.ReactNode; index: number;
}) {
  const pct = Math.min((nilai / target) * 100, 100);
  const gap = getGapInfo(nilai, target);

  return (
    <Card className={`border-l-4 ${getStatusBg(nilai, target)} transition-all hover:shadow-md animate-fade-in`} style={{ animationDelay: `${index * 80}ms` }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-navy/10">{icon}</div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
            </div>
          </div>
          {getStatusIcon(nilai, target)}
        </div>
        <div className="flex items-end justify-between mb-2">
          <div>
            <span className={`text-3xl font-bold ${getStatusColor(nilai, target)}`}>{nilai.toFixed(1)}</span>
            <span className="text-sm text-slate-400 ml-1">{satuan}</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Target: {target}{satuan}</p>
            <p className={`text-xs font-semibold ${gap.color}`}>{gap.text}</p>
          </div>
        </div>
        <div className="mt-2">
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor(nilai, target)}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-1 text-right">{pct.toFixed(0)}% dari target</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============ CHART CONFIGS ============
const trendConfig: ChartConfig = {
  nilai: { label: "Capaian", color: NAVY },
  target: { label: "Target", color: GOLD },
};

const barConfig: ChartConfig = {
  pencapaian: { label: "Pencapaian (%)", color: NAVY },
  target: { label: "Target (%)", color: GOLD },
};

const pieConfig: ChartConfig = {
  value: { label: "Jumlah" },
};

// ============ MAIN DASHBOARD ============
export default function IKUDashboard() {
  const [data, setData] = useState<IkuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ringkasan");

  useEffect(() => {
    fetch("/api/iku")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Memuat Dashboard IKU...</p>
          <p className="text-sm text-slate-400 mt-1">Universitas Tulungagung</p>
        </div>
      </div>
    );
  }

  const { ringkasan } = data;

  // ============ IKU ICONS MAP ============
  const ikuIcons: Record<string, React.ReactNode> = {
    iku1: <GraduationCap className="w-4 h-4 text-navy" />,
    iku2: <Briefcase className="w-4 h-4 text-navy" />,
    iku3: <Trophy className="w-4 h-4 text-navy" />,
    iku5: <Handshake className="w-4 h-4 text-navy" />,
    iku7: <Globe className="w-4 h-4 text-navy" />,
    iku9: <Wallet className="w-4 h-4 text-navy" />,
    iku12: <Users className="w-4 h-4 text-navy" />,
  };

  // ============ RINGKASAN TAB ============
  const renderRingkasan = () => {
    const radarData = Object.entries(ringkasan).map(([key, val]) => ({
      iku: val.label,
      nilai: val.nilai,
      target: val.target,
    }));

    const radarConfig: ChartConfig = {
      nilai: { label: "Capaian", color: NAVY },
      target: { label: "Target", color: GOLD },
    };

    const overallTrend = [
      { tahun: "2021", IKU1: 68.2, IKU2: 58.5, IKU3: 28.5, IKU5: 42.5, IKU7: 48.2, IKU9: 21.1, IKU12: 68.5 },
      { tahun: "2022", IKU1: 71.5, IKU2: 63.2, IKU3: 33.2, IKU5: 48.3, IKU7: 53.5, IKU9: 23.3, IKU12: 73.2 },
      { tahun: "2023", IKU1: 74.8, IKU2: 67.8, IKU3: 38.8, IKU5: 53.8, IKU7: 59.8, IKU9: 27.1, IKU12: 77.8 },
      { tahun: "2024", IKU1: 76.3, IKU2: 70.1, IKU3: 42.1, IKU5: 58.2, IKU7: 64.2, IKU9: 31.2, IKU12: 80.1 },
      { tahun: "2025", IKU1: 78.5, IKU2: 72.3, IKU3: 45.8, IKU5: 62.1, IKU7: 68.4, IKU9: 35.2, IKU12: 82.0 },
    ];

    const overallTrendConfig: ChartConfig = {
      IKU1: { label: "IKU 1 (AEE)", color: "#1a2744" },
      IKU2: { label: "IKU 2 (Lulusan)", color: "#2d8a7e" },
      IKU3: { label: "IKU 3 (Prestasi)", color: "#c9a84c" },
      IKU5: { label: "IKU 5 (Kerja Sama)", color: "#c75c5c" },
      IKU7: { label: "IKU 7 (SDGs)", color: "#3d5a8a" },
      IKU9: { label: "IKU 9 (Non-Akademik)", color: "#5bb5ab" },
      IKU12: { label: "IKU 12 (Dosen)", color: "#e0c873" },
    };

    // Target vs Achievement bar chart
    const targetVsAchievement = Object.entries(ringkasan).map(([key, val]) => ({
      name: val.label.length > 15 ? val.label.substring(0, 15) + "..." : val.label,
      fullName: val.label,
      capaian: val.nilai,
      target: val.target,
      gap: val.target - val.nilai,
    }));

    const targetConfig: ChartConfig = {
      capaian: { label: "Capaian", color: NAVY },
      target: { label: "Target", color: GOLD },
    };

    return (
      <div className="space-y-6 animate-fade-in">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(ringkasan).map(([key, val], idx) => (
            <KpiCard key={key} title={val.label} nilai={val.nilai} target={val.target} satuan={val.satuan} icon={ikuIcons[key]} index={idx} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Radar Pencapaian IKU</CardTitle>
              <CardDescription>Perbandingan capaian vs target seluruh IKU</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={radarConfig} className="h-[320px] w-full">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="iku" tick={{ fontSize: 11, fill: "#475569" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Radar name="Capaian" dataKey="nilai" stroke={NAVY} fill={NAVY} fillOpacity={0.2} strokeWidth={2} />
                  <Radar name="Target" dataKey="target" stroke={GOLD} fill={GOLD} fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </RadarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Target vs Achievement */}
          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Target vs Capaian IKU</CardTitle>
              <CardDescription>Perbandingan target dan capaian setiap indikator</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={targetConfig} className="h-[320px] w-full">
                <BarChart data={targetVsAchievement} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: "#475569" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="capaian" fill={NAVY} radius={[0, 4, 4, 0]} barSize={16} />
                  <Bar dataKey="target" fill={GOLD} radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Overall Trend Line */}
        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-navy">Tren Pencapaian IKU 2021-2025</CardTitle>
            <CardDescription>Perkembangan capaian seluruh IKU dalam 5 tahun terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={overallTrendConfig} className="h-[350px] w-full">
              <LineChart data={overallTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="tahun" tick={{ fontSize: 12, fill: "#475569" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="IKU1" stroke="#1a2744" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="IKU2" stroke="#2d8a7e" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="IKU3" stroke="#c9a84c" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="IKU5" stroke="#c75c5c" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="IKU7" stroke="#3d5a8a" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="IKU9" stroke="#5bb5ab" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="IKU12" stroke="#e0c873" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ============ IKU 1 TAB ============
  const renderIKU1 = () => {
    const iku = data.iku1;
    const prodiChartData = iku.perProdi.map((p) => ({
      name: p.prodi.length > 18 ? p.prodi.substring(0, 18) + "..." : p.prodi,
      pencapaian: p.pencapaian,
      target: 100,
    }));

    const aeeCompareData = iku.perProdi.map((p) => ({
      name: p.prodi.length > 15 ? p.prodi.substring(0, 15) + "..." : p.prodi,
      realisasi: p.aeeRealisasi,
      ideal: p.aeeIdeal,
    }));

    const aeeConfig: ChartConfig = {
      realisasi: { label: "AEE Realisasi (%)", color: NAVY },
      ideal: { label: "AEE Ideal (%)", color: GOLD },
    };

    const jenjangData = Object.entries(iku.aeeIdeal).map(([key, ideal]) => {
      const prodiInJenjang = iku.perProdi.filter((p) => p.jenjang === key);
      const avgPencapaian = prodiInJenjang.length > 0 ? prodiInJenjang.reduce((a, b) => a + b.pencapaian, 0) / prodiInJenjang.length : 0;
      return { jenjang: key, pencapaian: Math.round(avgPencapaian * 10) / 10, ideal: 100 };
    });

    const jenjangConfig: ChartConfig = {
      pencapaian: { label: "Tingkat Pencapaian (%)", color: NAVY },
    };

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header Card */}
        <Card className="border-l-4 border-l-navy border border-slate-200">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-navy/10">
                  <GraduationCap className="w-6 h-6 text-navy" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-navy">{iku.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">{iku.deskripsi}</p>
                  <p className="text-xs text-slate-400 mt-1 font-mono bg-slate-50 px-2 py-1 rounded inline-block">{iku.formula}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center px-4 py-2 rounded-lg bg-navy/5">
                  <p className="text-3xl font-bold text-navy">{iku.nilai.toFixed(1)}%</p>
                  <p className="text-xs text-slate-500">Capaian</p>
                </div>
                <div className="text-center px-4 py-2 rounded-lg bg-gold/10">
                  <p className="text-3xl font-bold text-gold">{iku.target}%</p>
                  <p className="text-xs text-slate-500">Target</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Chart */}
          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Tren AEE PT (2021-2025)</CardTitle>
              <CardDescription>Perkembangan capaian AEE dari tahun ke tahun</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trendConfig} className="h-[280px] w-full">
                <AreaChart data={iku.trendTahunan}>
                  <defs>
                    <linearGradient id="fillNavy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={NAVY} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={NAVY} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="tahun" tick={{ fontSize: 12, fill: "#475569" }} />
                  <YAxis domain={[60, 90]} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="nilai" stroke={NAVY} fill="url(#fillNavy)" strokeWidth={2} name="Capaian" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Jenjang Chart */}
          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Pencapaian per Jenjang</CardTitle>
              <CardDescription>Rata-rata tingkat pencapaian AEE per jenjang pendidikan</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={jenjangConfig} className="h-[280px] w-full">
                <BarChart data={jenjangData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="jenjang" tick={{ fontSize: 12, fill: "#475569" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="pencapaian" fill={NAVY} radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Per Prodi Detail */}
        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-navy">AEE per Program Studi</CardTitle>
            <CardDescription>Perbandingan AEE realisasi vs AEE ideal setiap program studi</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={aeeConfig} className="h-[400px] w-full">
              <BarChart data={aeeCompareData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 10, fill: "#475569" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="realisasi" fill={NAVY} radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="ideal" fill={GOLD} radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-navy">Data Detail per Program Studi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-3 font-semibold text-navy">Program Studi</th>
                    <th className="text-center py-3 px-3 font-semibold text-navy">Jenjang</th>
                    <th className="text-center py-3 px-3 font-semibold text-navy">AEE Realisasi</th>
                    <th className="text-center py-3 px-3 font-semibold text-navy">AEE Ideal</th>
                    <th className="text-center py-3 px-3 font-semibold text-navy">Pencapaian</th>
                    <th className="text-center py-3 px-3 font-semibold text-navy">Mahasiswa</th>
                    <th className="text-center py-3 px-3 font-semibold text-navy">Lulus Tepat</th>
                  </tr>
                </thead>
                <tbody>
                  {iku.perProdi.map((p, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-slate-700">{p.prodi}</td>
                      <td className="py-2.5 px-3 text-center"><Badge variant="outline" className="text-xs">{p.jenjang}</Badge></td>
                      <td className="py-2.5 px-3 text-center">{p.aeeRealisasi}%</td>
                      <td className="py-2.5 px-3 text-center">{p.aeeIdeal}%</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`font-semibold ${getStatusColor(p.pencapaian, 100)}`}>{p.pencapaian}%</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">{p.mahasiswa}</td>
                      <td className="py-2.5 px-3 text-center">{p.lulusTepat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ============ IKU 2 TAB ============
  const renderIKU2 = () => {
    const iku = data.iku2;
    const pieData = iku.distribusi.map((d) => ({ name: d.kategori, value: d.jumlah }));
    const pieColors = [NAVY, TEAL, GOLD, GOLD_LIGHT, NAVY_LIGHTER, TEAL_LIGHT, CORAL_LIGHT];

    const stackedData = iku.perFakultas.map((f) => ({
      fakultas: f.fakultas,
      Bekerja: f.bekerja,
      Wirausaha: f.wirausaha,
      "Lanjut Studi": f.studi,
      "Belum Bekerja": f.belum,
    }));

    const stackedConfig: ChartConfig = {
      Bekerja: { label: "Bekerja", color: NAVY },
      Wirausaha: { label: "Wirausaha", color: TEAL },
      "Lanjut Studi": { label: "Lanjut Studi", color: GOLD },
      "Belum Bekerja": { label: "Belum Bekerja", color: CORAL },
    };

    const masaTungguConfig: ChartConfig = {
      jumlah: { label: "Jumlah Lulusan", color: NAVY },
    };

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <Card className="border-l-4 border-l-navy border border-slate-200">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-navy/10"><Briefcase className="w-6 h-6 text-navy" /></div>
                <div>
                  <h2 className="text-lg font-bold text-navy">{iku.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">{iku.deskripsi}</p>
                  <p className="text-xs text-slate-400 mt-1 font-mono bg-slate-50 px-2 py-1 rounded inline-block">{iku.formula}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center px-4 py-2 rounded-lg bg-navy/5">
                  <p className="text-3xl font-bold text-navy">{iku.nilai.toFixed(1)}%</p>
                  <p className="text-xs text-slate-500">Capaian</p>
                </div>
                <div className="text-center px-4 py-2 rounded-lg bg-gold/10">
                  <p className="text-3xl font-bold text-gold">{iku.target}%</p>
                  <p className="text-xs text-slate-500">Target</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Distribusi */}
          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Distribusi Status Lulusan</CardTitle>
              <CardDescription>Komposisi status lulusan 1 tahun pasca kelulusan</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={pieConfig} className="h-[320px] w-full">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={110} innerRadius={60} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: "#94a3b8" }}>
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Stacked Bar per Fakultas */}
          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Status Lulusan per Fakultas</CardTitle>
              <CardDescription>Komposisi status lulusan berdasarkan fakultas</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={stackedConfig} className="h-[320px] w-full">
                <BarChart data={stackedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="fakultas" tick={{ fontSize: 11, fill: "#475569" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="Bekerja" stackId="a" fill={NAVY} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Wirausaha" stackId="a" fill={TEAL} />
                  <Bar dataKey="Lanjut Studi" stackId="a" fill={GOLD} />
                  <Bar dataKey="Belum Bekerja" stackId="a" fill={CORAL} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Masa Tunggu */}
          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Distribusi Masa Tunggu</CardTitle>
              <CardDescription>Lama waktu lulusan mendapatkan pekerjaan pertama</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={masaTungguConfig} className="h-[280px] w-full">
                <BarChart data={iku.masaTunggu}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#475569" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="jumlah" fill={TEAL} radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Trend */}
          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Tren Capaian (2021-2025)</CardTitle>
              <CardDescription>Perkembangan persentase lulusan yang terserap</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trendConfig} className="h-[280px] w-full">
                <AreaChart data={iku.trendTahunan}>
                  <defs>
                    <linearGradient id="fillTeal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={TEAL} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="tahun" tick={{ fontSize: 12, fill: "#475569" }} />
                  <YAxis domain={[50, 80]} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="nilai" stroke={TEAL} fill="url(#fillTeal)" strokeWidth={2} name="Capaian" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // ============ IKU 3 TAB ============
  const renderIKU3 = () => {
    const iku = data.iku3;
    const kegiatanConfig: ChartConfig = {
      jumlah: { label: "Jumlah Mahasiswa", color: NAVY },
    };

    const prestasiStacked = iku.prestasi.map((p) => ({
      tingkat: p.tingkat,
      "Juara 1": p.juara1,
      "Juara 2/3": p.juara2_3,
      "Harapan": p.harapan,
      "Finalis": p.finalis,
    }));

    const prestasiConfig: ChartConfig = {
      "Juara 1": { label: "Juara 1", color: NAVY },
      "Juara 2/3": { label: "Juara 2/3", color: TEAL },
      "Harapan": { label: "Harapan", color: GOLD },
      "Finalis": { label: "Finalis", color: CORAL_LIGHT },
    };

    const sksData = iku.sksDiluar.map((s) => ({ ...s, name: s.kategori }));
    const sksConfig: ChartConfig = {
      jumlah: { label: "Jumlah", color: NAVY },
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="border-l-4 border-l-navy border border-slate-200">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-navy/10"><Trophy className="w-6 h-6 text-navy" /></div>
                <div>
                  <h2 className="text-lg font-bold text-navy">{iku.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">{iku.deskripsi}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center px-4 py-2 rounded-lg bg-navy/5">
                  <p className="text-3xl font-bold text-navy">{iku.nilai.toFixed(1)}%</p>
                  <p className="text-xs text-slate-500">Capaian</p>
                </div>
                <div className="text-center px-4 py-2 rounded-lg bg-gold/10">
                  <p className="text-3xl font-bold text-gold">{iku.target}%</p>
                  <p className="text-xs text-slate-500">Target</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Jenis Kegiatan di Luar Prodi</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={kegiatanConfig} className="h-[280px] w-full">
                <BarChart data={iku.jenisKegiatan} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis type="category" dataKey="jenis" width={140} tick={{ fontSize: 10, fill: "#475569" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="jumlah" fill={NAVY} radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Prestasi per Tingkat Kompetisi</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={prestasiConfig} className="h-[280px] w-full">
                <BarChart data={prestasiStacked}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="tingkat" tick={{ fontSize: 11, fill: "#475569" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="Juara 1" stackId="a" fill={NAVY} />
                  <Bar dataKey="Juara 2/3" stackId="a" fill={TEAL} />
                  <Bar dataKey="Harapan" stackId="a" fill={GOLD} />
                  <Bar dataKey="Finalis" stackId="a" fill={CORAL_LIGHT} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Bobot SKS di Luar Kampus</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={sksConfig} className="h-[280px] w-full">
                <PieChart>
                  <Pie data={sksData} cx="50%" cy="50%" outerRadius={100} innerRadius={55} dataKey="jumlah" nameKey="name" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {sksData.map((_, idx) => (
                      <Cell key={idx} fill={[NAVY, TEAL, GOLD][idx]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Tren Capaian (2021-2025)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trendConfig} className="h-[280px] w-full">
                <AreaChart data={iku.trendTahunan}>
                  <defs>
                    <linearGradient id="fillGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="tahun" tick={{ fontSize: 12, fill: "#475569" }} />
                  <YAxis domain={[20, 55]} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="nilai" stroke={GOLD} fill="url(#fillGold)" strokeWidth={2} name="Capaian" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // ============ IKU 5 TAB ============
  const renderIKU5 = () => {
    const iku = data.iku5;
    const kerjasamaConfig: ChartConfig = {
      jumlah: { label: "Total Kerja Sama", color: NAVY },
      aktif: { label: "Kerja Sama Aktif", color: TEAL },
    };

    const luaranConfig: ChartConfig = {
      jumlah: { label: "Jumlah", color: NAVY },
    };

    const prodiConfig: ChartConfig = {
      kerjasama: { label: "Kerja Sama", color: NAVY },
      luaran: { label: "Luaran", color: TEAL },
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="border-l-4 border-l-navy border border-slate-200">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-navy/10"><Handshake className="w-6 h-6 text-navy" /></div>
                <div>
                  <h2 className="text-lg font-bold text-navy">{iku.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">{iku.deskripsi}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center px-4 py-2 rounded-lg bg-navy/5">
                  <p className="text-3xl font-bold text-navy">{iku.nilai.toFixed(1)}%</p>
                  <p className="text-xs text-slate-500">Capaian</p>
                </div>
                <div className="text-center px-4 py-2 rounded-lg bg-gold/10">
                  <p className="text-3xl font-bold text-gold">{iku.target}%</p>
                  <p className="text-xs text-slate-500">Target</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Jenis Kerja Sama</CardTitle>
              <CardDescription>Total kerja sama vs kerja sama aktif</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={kerjasamaConfig} className="h-[280px] w-full">
                <BarChart data={iku.jenisKerjasama} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis type="category" dataKey="jenis" width={130} tick={{ fontSize: 10, fill: "#475569" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="jumlah" fill={NAVY} radius={[0, 4, 4, 0]} barSize={10} />
                  <Bar dataKey="aktif" fill={TEAL} radius={[0, 4, 4, 0]} barSize={10} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Luaran Kerja Sama</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={luaranConfig} className="h-[280px] w-full">
                <BarChart data={iku.luaran}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="jenis" tick={{ fontSize: 10, fill: "#475569" }} angle={-15} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="jumlah" fill={NAVY} radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Kerja Sama & Luaran per Prodi</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={prodiConfig} className="h-[300px] w-full">
                <BarChart data={iku.perProdi}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="prodi" tick={{ fontSize: 10, fill: "#475569" }} angle={-15} textAnchor="end" height={55} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="kerjasama" fill={NAVY} radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="luaran" fill={TEAL} radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Tren Capaian (2021-2025)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trendConfig} className="h-[300px] w-full">
                <AreaChart data={iku.trendTahunan}>
                  <defs>
                    <linearGradient id="fillNavy5" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={NAVY} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={NAVY} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="tahun" tick={{ fontSize: 12, fill: "#475569" }} />
                  <YAxis domain={[35, 70]} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="nilai" stroke={NAVY} fill="url(#fillNavy5)" strokeWidth={2} name="Capaian" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // ============ IKU 7 TAB ============
  const renderIKU7 = () => {
    const iku = data.iku7;
    const radarData = iku.indikatorSDG.map((i) => ({ indikator: i.indikator, skor: i.skor }));
    const radarConfig7: ChartConfig = { skor: { label: "Skor", color: TEAL } };

    const sdgBarData = iku.sdgDetail.map((s) => ({
      sdg: s.sdg.length > 20 ? s.sdg.substring(0, 20) + "..." : s.sdg,
      skor: s.skor,
      kegiatan: s.jumlahKegiatan,
      mahasiswa: s.jumlahMhsTerlibat,
    }));
    const sdgConfig: ChartConfig = { skor: { label: "Skor", color: TEAL } };

    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="border-l-4 border-l-navy border border-slate-200">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-navy/10"><Globe className="w-6 h-6 text-navy" /></div>
                <div>
                  <h2 className="text-lg font-bold text-navy">{iku.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">{iku.deskripsi}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center px-4 py-2 rounded-lg bg-navy/5">
                  <p className="text-3xl font-bold text-navy">{iku.nilai.toFixed(1)}%</p>
                  <p className="text-xs text-slate-500">Capaian</p>
                </div>
                <div className="text-center px-4 py-2 rounded-lg bg-gold/10">
                  <p className="text-3xl font-bold text-gold">{iku.target}%</p>
                  <p className="text-xs text-slate-500">Target</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Radar Indikator SDG</CardTitle>
              <CardDescription>Skor setiap aspek keterlibatan SDG</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={radarConfig7} className="h-[320px] w-full">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="indikator" tick={{ fontSize: 10, fill: "#475569" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Radar name="Skor" dataKey="skor" stroke={TEAL} fill={TEAL} fillOpacity={0.2} strokeWidth={2} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RadarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Skor per SDG Prioritas</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={sdgConfig} className="h-[320px] w-full">
                <BarChart data={sdgBarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis type="category" dataKey="sdg" width={160} tick={{ fontSize: 10, fill: "#475569" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="skor" fill={TEAL} radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* SDG Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {iku.sdgDetail.map((sdg, idx) => (
            <Card key={idx} className="border border-slate-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-navy">{sdg.sdg}</CardTitle>
                  <Badge className="bg-teal text-white text-xs">{sdg.skor}%</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Kegiatan: {sdg.jumlahKegiatan}</span>
                    <span>Mhs Terlibat: {sdg.jumlahMhsTerlibat}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-teal h-2 rounded-full" style={{ width: `${sdg.skor}%` }} />
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1 mt-3">
                    {sdg.kegiatan.map((k, ki) => (
                      <li key={ki} className="flex items-start gap-1.5">
                        <ChevronRight className="w-3 h-3 text-teal mt-0.5 shrink-0" />
                        <span>{k}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trend */}
        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-navy">Tren Keterlibatan SDGs (2021-2025)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={trendConfig} className="h-[280px] w-full">
              <AreaChart data={iku.trendTahunan}>
                <defs>
                  <linearGradient id="fillTeal7" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={TEAL} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="tahun" tick={{ fontSize: 12, fill: "#475569" }} />
                <YAxis domain={[40, 75]} tick={{ fontSize: 11, fill: "#64748b" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="nilai" stroke={TEAL} fill="url(#fillTeal7)" strokeWidth={2} name="Capaian" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ============ IKU 9 TAB ============
  const renderIKU9 = () => {
    const iku = data.iku9;
    const sumberConfig: ChartConfig = { nominal: { label: "Nominal (Juta)", color: NAVY } };

    const yearData = iku.perTahun.map((y) => ({
      tahun: y.tahun.toString(),
      Akademik: y.akademik,
      "Non-Akademik": y.nonAkademik,
    }));

    const yearConfig: ChartConfig = {
      Akademik: { label: "Akademik", color: SLATE },
      "Non-Akademik": { label: "Non-Akademik", color: TEAL },
    };

    const pieSumberData = iku.sumberPendapatan.map((s) => ({ name: s.sumber, value: s.nominal }));
    const pieSumberColors = [NAVY, TEAL, GOLD, CORAL_LIGHT, NAVY_LIGHTER, TEAL_LIGHT, SLATE];

    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="border-l-4 border-l-navy border border-slate-200">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-navy/10"><Wallet className="w-6 h-6 text-navy" /></div>
                <div>
                  <h2 className="text-lg font-bold text-navy">{iku.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">{iku.deskripsi}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center px-4 py-2 rounded-lg bg-navy/5">
                  <p className="text-3xl font-bold text-navy">{iku.nilai.toFixed(1)}%</p>
                  <p className="text-xs text-slate-500">Capaian</p>
                </div>
                <div className="text-center px-4 py-2 rounded-lg bg-gold/10">
                  <p className="text-3xl font-bold text-gold">{iku.target}%</p>
                  <p className="text-xs text-slate-500">Target</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Pendapatan Akademik vs Non-Akademik</CardTitle>
              <CardDescription>Dalam jutaan Rupiah</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={yearConfig} className="h-[280px] w-full">
                <BarChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="tahun" tick={{ fontSize: 12, fill: "#475569" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="Akademik" fill={SLATE} radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="Non-Akademik" fill={TEAL} radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Sumber Pendapatan Non-Akademik</CardTitle>
              <CardDescription>Komposisi sumber pendapatan tahun 2025</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={pieConfig} className="h-[280px] w-full">
                <PieChart>
                  <Pie data={pieSumberData} cx="50%" cy="50%" outerRadius={100} innerRadius={55} dataKey="value" nameKey="name" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                    {pieSumberData.map((_, idx) => (
                      <Cell key={idx} fill={pieSumberColors[idx % pieSumberColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-navy">Tren Persentase Pendapatan Non-Akademik</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={trendConfig} className="h-[280px] w-full">
              <AreaChart data={iku.trendPersentase}>
                <defs>
                  <linearGradient id="fillTeal9" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={TEAL} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="tahun" tick={{ fontSize: 12, fill: "#475569" }} />
                <YAxis domain={[15, 45]} tick={{ fontSize: 11, fill: "#64748b" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="nilai" stroke={TEAL} fill="url(#fillTeal9)" strokeWidth={2} name="Persentase" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ============ IKU 12 TAB ============
  const renderIKU12 = () => {
    const iku = data.iku12;
    const indikatorConfig: ChartConfig = { skor: { label: "Skor", color: NAVY } };

    const fakultasConfig: ChartConfig = { skor: { label: "Skor", color: TEAL } };

    const anggaranData = iku.realisasiAnggaran.map((r) => ({
      tahun: r.tahun.toString(),
      Anggaran: r.anggaran,
      Realisasi: r.realisasi,
    }));
    const anggaranConfig: ChartConfig = {
      Anggaran: { label: "Anggaran (Juta)", color: NAVY },
      Realisasi: { label: "Realisasi (Juta)", color: TEAL },
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="border-l-4 border-l-navy border border-slate-200">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-navy/10"><Users className="w-6 h-6 text-navy" /></div>
                <div>
                  <h2 className="text-lg font-bold text-navy">{iku.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">{iku.deskripsi}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center px-4 py-2 rounded-lg bg-navy/5">
                  <p className="text-3xl font-bold text-navy">{iku.nilai.toFixed(1)}%</p>
                  <p className="text-xs text-slate-500">Capaian</p>
                </div>
                <div className="text-center px-4 py-2 rounded-lg bg-gold/10">
                  <p className="text-3xl font-bold text-gold">{iku.target}%</p>
                  <p className="text-xs text-slate-500">Target</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Skor per Aspek Kesejahteraan</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={indikatorConfig} className="h-[300px] w-full">
                <BarChart data={iku.indikator} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis type="category" dataKey="aspek" width={150} tick={{ fontSize: 10, fill: "#475569" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="skor" fill={NAVY} radius={[0, 4, 4, 0]} barSize={18}>
                    {iku.indikator.map((_, idx) => (
                      <Cell key={idx} fill={idx % 2 === 0 ? NAVY : NAVY_LIGHTER} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Skor per Fakultas</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={fakultasConfig} className="h-[300px] w-full">
                <BarChart data={iku.perFakultas}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="fakultas" tick={{ fontSize: 11, fill: "#475569" }} />
                  <YAxis domain={[70, 90]} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="skor" fill={TEAL} radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Realisasi Anggaran Kesejahteraan</CardTitle>
              <CardDescription>Dalam jutaan Rupiah</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={anggaranConfig} className="h-[280px] w-full">
                <BarChart data={anggaranData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="tahun" tick={{ fontSize: 12, fill: "#475569" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="Anggaran" fill={NAVY} radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="Realisasi" fill={TEAL} radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy">Tren Capaian (2021-2025)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trendConfig} className="h-[280px] w-full">
                <AreaChart data={iku.trendTahunan}>
                  <defs>
                    <linearGradient id="fillNavy12" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={NAVY} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={NAVY} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="tahun" tick={{ fontSize: 12, fill: "#475569" }} />
                  <YAxis domain={[60, 85]} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="nilai" stroke={NAVY} fill="url(#fillNavy12)" strokeWidth={2} name="Capaian" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Indicator Detail Table */}
        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-navy">Detail Indikator Kesejahteraan Dosen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {iku.indikator.map((ind, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="text-sm text-slate-600 w-44 shrink-0">{ind.aspek}</span>
                  <div className="flex-1">
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div className={`h-3 rounded-full transition-all ${ind.skor >= 85 ? 'bg-emerald-500' : ind.skor >= 75 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${ind.skor}%` }} />
                    </div>
                  </div>
                  <span className={`text-sm font-semibold w-12 text-right ${ind.skor >= 85 ? 'text-emerald-600' : ind.skor >= 75 ? 'text-amber-600' : 'text-red-500'}`}>{ind.skor}%</span>
                  <span className="text-xs text-slate-400 w-40">{ind.ket}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ============ ANALISA TAB ============
  const renderAnalisa = () => {
    // Gap Analysis
    const gapData = Object.entries(ringkasan).map(([key, val]) => ({
      iku: `IKU ${key.replace("iku", "")}`,
      label: val.label,
      capaian: val.nilai,
      target: val.target,
      gap: Math.max(0, val.target - val.nilai),
      pctTarget: Math.round((val.nilai / val.target) * 100),
    }));

    const gapConfig: ChartConfig = {
      gap: { label: "Gap (%)", color: CORAL },
    };

    // Growth Rate
    const growthData = [
      { iku: "IKU 1", label: "AEE PT", growth2024: ((78.5 - 76.3) / 76.3 * 100).toFixed(1), growth2023: ((76.3 - 74.8) / 74.8 * 100).toFixed(1) },
      { iku: "IKU 2", label: "Lulusan", growth2024: ((72.3 - 70.1) / 70.1 * 100).toFixed(1), growth2023: ((70.1 - 67.8) / 67.8 * 100).toFixed(1) },
      { iku: "IKU 3", label: "Prestasi", growth2024: ((45.8 - 42.1) / 42.1 * 100).toFixed(1), growth2023: ((42.1 - 38.8) / 38.8 * 100).toFixed(1) },
      { iku: "IKU 5", label: "Kerja Sama", growth2024: ((62.1 - 58.2) / 58.2 * 100).toFixed(1), growth2023: ((58.2 - 53.8) / 53.8 * 100).toFixed(1) },
      { iku: "IKU 7", label: "SDGs", growth2024: ((68.4 - 64.2) / 64.2 * 100).toFixed(1), growth2023: ((64.2 - 59.8) / 59.8 * 100).toFixed(1) },
      { iku: "IKU 9", label: "Non-Akademik", growth2024: ((35.2 - 31.2) / 31.2 * 100).toFixed(1), growth2023: ((31.2 - 27.1) / 27.1 * 100).toFixed(1) },
      { iku: "IKU 12", label: "Dosen", growth2024: ((82.0 - 80.1) / 80.1 * 100).toFixed(1), growth2023: ((80.1 - 77.8) / 77.8 * 100).toFixed(1) },
    ];

    const growthConfig: ChartConfig = {
      growth2024: { label: "Pertumbuhan 2025 (%)", color: NAVY },
      growth2023: { label: "Pertumbuhan 2024 (%)", color: TEAL },
    };

    // Projection
    const avgGrowthRates: Record<string, number> = {};
    const trendKeys = ["iku1", "iku2", "iku3", "iku5", "iku7", "iku9", "iku12"] as const;
    const trendMap: Record<string, { tahun: number; nilai: number }[]> = {
      iku1: data.iku1.trendTahunan,
      iku2: data.iku2.trendTahunan,
      iku3: data.iku3.trendTahunan,
      iku5: data.iku5.trendTahunan,
      iku7: data.iku7.trendTahunan,
      iku9: data.iku9.trendPersentase,
      iku12: data.iku12.trendTahunan,
    };

    trendKeys.forEach((key) => {
      const trend = trendMap[key];
      if (trend && trend.length >= 2) {
        const last = trend[trend.length - 1].nilai;
        const prev = trend[trend.length - 2].nilai;
        avgGrowthRates[key] = last - prev;
      }
    });

    const projectionData = trendKeys.map((key) => {
      const trend = trendMap[key];
      const lastVal = trend ? trend[trend.length - 1].nilai : 0;
      const growth = avgGrowthRates[key] || 0;
      return {
        iku: `IKU ${key.replace("iku", "")}`,
        current: lastVal,
        projected2026: Math.min(100, lastVal + growth),
        projected2027: Math.min(100, lastVal + growth * 2),
        target: ringkasan[key]?.target || 0,
      };
    });

    const projectionConfig: ChartConfig = {
      current: { label: "2025", color: NAVY },
      projected2026: { label: "Proyeksi 2026", color: TEAL },
      projected2027: { label: "Proyeksi 2027", color: TEAL_LIGHT },
      target: { label: "Target", color: GOLD },
    };

    // Priority matrix (gap vs growth)
    const priorityData = trendKeys.map((key) => {
      const trend = trendMap[key];
      const last = trend ? trend[trend.length - 1].nilai : 0;
      const prev = trend && trend.length >= 2 ? trend[trend.length - 2].nilai : 0;
      const growth = last - prev;
      const target = ringkasan[key]?.target || 0;
      const gap = Math.max(0, target - last);
      return {
        iku: `IKU ${key.replace("iku", "")}`,
        label: ringkasan[key]?.label || key,
        gap,
        growth: Math.round(growth * 10) / 10,
        target,
        current: last,
      };
    });

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Gap Analysis */}
        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-navy flex items-center gap-2">
              <Target className="w-5 h-5" />
              Analisis Gap (Selisih Capaian vs Target)
            </CardTitle>
            <CardDescription>Identifikasi IKU yang memerlukan perhatian khusus</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={gapConfig} className="h-[300px] w-full">
              <BarChart data={gapData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="iku" tick={{ fontSize: 12, fill: "#475569" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value, name, item) => [`${value}% gap (Capaian: ${item.payload.capaian}%, Target: ${item.payload.target}%)`, "Gap"]} />} />
                <Bar dataKey="gap" radius={[4, 4, 0, 0]} barSize={40}>
                  {gapData.map((d, idx) => (
                    <Cell key={idx} fill={d.gap > 10 ? CORAL : d.gap > 5 ? GOLD : TEAL} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Growth Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Laju Pertumbuhan YoY
              </CardTitle>
              <CardDescription>Perbandingan pertumbuhan antar tahun</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={growthConfig} className="h-[300px] w-full">
                <BarChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="iku" tick={{ fontSize: 11, fill: "#475569" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="growth2024" fill={NAVY} radius={[4, 4, 0, 0]} barSize={18} />
                  <Bar dataKey="growth2023" fill={TEAL} radius={[4, 4, 0, 0]} barSize={18} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-navy flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Proyeksi Pencapaian
              </CardTitle>
              <CardDescription>Estimasi capaian berdasarkan tren pertumbuhan</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={projectionConfig} className="h-[300px] w-full">
                <BarChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="iku" tick={{ fontSize: 11, fill: "#475569" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="current" fill={NAVY} radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="projected2026" fill={TEAL} radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="projected2027" fill={TEAL_LIGHT} radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="target" fill={GOLD} radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Priority Matrix */}
        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-navy">Matriks Prioritas</CardTitle>
            <CardDescription>Berdasarkan gap dan laju pertumbuhan saat ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {priorityData.sort((a, b) => b.gap - a.gap).map((item, idx) => {
                const urgency = item.gap > 10 ? "high" : item.gap > 5 ? "medium" : "low";
                const colors = {
                  high: "border-red-300 bg-red-50",
                  medium: "border-amber-300 bg-amber-50",
                  low: "border-emerald-300 bg-emerald-50",
                };
                const badgeColors = {
                  high: "bg-red-100 text-red-700",
                  medium: "bg-amber-100 text-amber-700",
                  low: "bg-emerald-100 text-emerald-700",
                };
                const labels = {
                  high: "Prioritas Tinggi",
                  medium: "Prioritas Sedang",
                  low: "Prioritas Rendah",
                };

                return (
                  <Card key={idx} className={`border ${colors[urgency]}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-navy text-sm">{item.iku}</span>
                        <Badge className={`${badgeColors[urgency]} text-[10px]`}>{labels[urgency]}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">{item.label}</p>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between"><span className="text-slate-500">Capaian:</span><span className="font-semibold">{item.current.toFixed(1)}%</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Target:</span><span className="font-semibold">{item.target}%</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Gap:</span><span className={`font-semibold ${item.gap > 10 ? 'text-red-600' : item.gap > 5 ? 'text-amber-600' : 'text-emerald-600'}`}>{item.gap.toFixed(1)}%</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Pertumbuhan:</span><span className={`font-semibold ${item.growth > 0 ? 'text-emerald-600' : 'text-red-500'}`}>+{item.growth}%/th</span></div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className={`h-2 rounded-full ${item.gap <= 5 ? 'bg-emerald-500' : item.gap <= 10 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min((item.current / item.target) * 100, 100)}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 text-right">{Math.round((item.current / item.target) * 100)}% tercapai</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-navy flex items-center gap-2">
              <Info className="w-5 h-5" />
              Rekomendasi Strategis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { iku: "IKU 9 - Pendapatan Non-Akademik", gap: 4.8, rekomendasi: "Perlu peningkatan diversifikasi sumber pendapatan melalui kerja sama industri, jasa konsultasi, dan pelatihan bersertifikasi. Target peningkatan 5% per tahun dapat dicapai melalui optimalisasi unit bisnis kampus.", prioritas: "Tinggi" },
                { iku: "IKU 3 - Mahasiswa Berprestasi", gap: 4.2, rekomendasi: "Perlu peningkatan program magang dan pertukaran mahasiswa. Pembentukan center of excellence dan peningkatan pendanaan kegiatan mahasiswa di luar prodi dapat mempercepat pencapaian target.", prioritas: "Tinggi" },
                { iku: "IKU 5 - Kerja Sama Industri", gap: 7.9, rekomendasi: "Fokus pada peningkatan hilirisasi riset dan transfer teknologi ke industri. Pembentukan tim dedikasi untuk pengelolaan kerja sama dan inkubator bisnis perlu diperkuat.", prioritas: "Tinggi" },
                { iku: "IKU 7 - Keterlibatan SDGs", gap: 6.6, rekomendasi: "Penguatan kurikulum berbasis SDG dan peningkatan kegiatan pengabdian masyarakat terintegrasi SDG. Perlu dokumen pelaporan SDG yang komprehensif.", prioritas: "Sedang" },
                { iku: "IKU 2 - Lulusan Bekerja", gap: 7.7, rekomendasi: "Peningkatan career center, program entrepreneurship, dan tracer study yang lebih komprehensif. Kemitraan dengan industri untuk penyerapan lulusan perlu diperluas.", prioritas: "Sedang" },
                { iku: "IKU 1 - AEE PT", gap: 6.5, rekomendasi: "Penguatan program mentoring dan tutoring bagi mahasiswa yang terancam tidak lulus tepat waktu. Evaluasi kurikulum dan beban SKS perlu dilakukan.", prioritas: "Sedang" },
                { iku: "IKU 12 - Kesejahteraan Dosen", gap: 3.0, rekomendasi: "Fokus pada peningkatan beban kerja optimal dan kompensasi kompetitif. Review sistem tunjangan dan penghargaan perlu dilakukan secara berkala.", prioritas: "Rendah" },
              ].map((rec, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className={`px-2.5 py-1 rounded text-xs font-bold text-white shrink-0 ${rec.prioritas === 'Tinggi' ? 'bg-red-500' : rec.prioritas === 'Sedang' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                    {rec.prioritas}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-navy">{rec.iku}</h4>
                      <span className="text-xs text-slate-400">Gap: {rec.gap}%</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{rec.rekomendasi}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ============ RENDER ============
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-navy text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Building2 className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Universitas Tulungagung</h1>
                <p className="text-xs text-white/60">Dashboard Indikator Kinerja Utama</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-xs text-white/70">
                <Calendar className="w-3.5 h-3.5" />
                <span>Tahun Akademik {data.tahun}</span>
              </div>
              <Badge className="bg-gold text-navy font-semibold text-xs px-3 py-1">
                IKU WAJIB
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="sticky top-16 z-40 bg-white pb-2 border-b border-slate-200 -mx-4 sm:-mx-6 px-4 sm:px-6">
            <TabsList className="iku-tabs w-full flex h-auto p-1 bg-slate-100/80 rounded-lg gap-0.5 overflow-x-auto">
              <TabsTrigger value="ringkasan" className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2.5 rounded-md whitespace-nowrap data-[state=active]:shadow-md transition-all">
                Ringkasan
              </TabsTrigger>
              <TabsTrigger value="iku1" className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2.5 rounded-md whitespace-nowrap data-[state=active]:shadow-md transition-all">
                IKU 1
              </TabsTrigger>
              <TabsTrigger value="iku2" className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2.5 rounded-md whitespace-nowrap data-[state=active]:shadow-md transition-all">
                IKU 2
              </TabsTrigger>
              <TabsTrigger value="iku3" className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2.5 rounded-md whitespace-nowrap data-[state=active]:shadow-md transition-all">
                IKU 3
              </TabsTrigger>
              <TabsTrigger value="iku5" className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2.5 rounded-md whitespace-nowrap data-[state=active]:shadow-md transition-all">
                IKU 5
              </TabsTrigger>
              <TabsTrigger value="iku7" className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2.5 rounded-md whitespace-nowrap data-[state=active]:shadow-md transition-all">
                IKU 7
              </TabsTrigger>
              <TabsTrigger value="iku9" className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2.5 rounded-md whitespace-nowrap data-[state=active]:shadow-md transition-all">
                IKU 9
              </TabsTrigger>
              <TabsTrigger value="iku12" className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2.5 rounded-md whitespace-nowrap data-[state=active]:shadow-md transition-all">
                IKU 12
              </TabsTrigger>
              <TabsTrigger value="analisa" className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2.5 rounded-md whitespace-nowrap data-[state=active]:shadow-md transition-all">
                <BarChart3 className="w-3.5 h-3.5 mr-1" />
                Analisa
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ringkasan" className="mt-4">{renderRingkasan()}</TabsContent>
          <TabsContent value="iku1" className="mt-4">{renderIKU1()}</TabsContent>
          <TabsContent value="iku2" className="mt-4">{renderIKU2()}</TabsContent>
          <TabsContent value="iku3" className="mt-4">{renderIKU3()}</TabsContent>
          <TabsContent value="iku5" className="mt-4">{renderIKU5()}</TabsContent>
          <TabsContent value="iku7" className="mt-4">{renderIKU7()}</TabsContent>
          <TabsContent value="iku9" className="mt-4">{renderIKU9()}</TabsContent>
          <TabsContent value="iku12" className="mt-4">{renderIKU12()}</TabsContent>
          <TabsContent value="analisa" className="mt-4">{renderAnalisa()}</TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-navy text-white/70 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gold" />
              <span className="text-sm">Dashboard IKU - Universitas Tulungagung</span>
            </div>
            <p className="text-xs text-white/40">Berdasarkan Kepmendiktisaintek No. 358/M/KEP/2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
