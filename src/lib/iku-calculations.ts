// IKU Calculation Utilities for Universitas Tulungagung
// Based on Kepmendiktisaintek No. 358/M/KEP/2026

import { AEE_IDEAL } from "./iku-config";

// ============ IKU 1: Angka Efisiensi Edukasi (AEE PT) ============

export interface Iku1Data {
  jumlahMasuk: number;
  lulusTepatWaktu: number;
}

export function calcAEE_Realisation(data: Iku1Data): number {
  if (!data.jumlahMasuk || data.jumlahMasuk === 0) return 0;
  return (data.lulusTepatWaktu / data.jumlahMasuk) * 100;
}

export function calcAEE_AchievementRate(data: Iku1Data, jenjang: string): number {
  const realisasi = calcAEE_Realisation(data);
  const ideal = AEE_IDEAL[jenjang] || 25;
  if (ideal === 0) return 0;
  return (realisasi / ideal) * 100;
}

export function calcAEE_PT(prodiDataList: { data: Iku1Data; jenjang: string }[]): number {
  if (prodiDataList.length === 0) return 0;
  const validData = prodiDataList.filter((d) => d.data.jumlahMasuk > 0);
  if (validData.length === 0) return 0;
  const sum = validData.reduce((acc, d) => acc + calcAEE_AchievementRate(d.data, d.jenjang), 0);
  return sum / validData.length;
}

// ============ IKU 2: Lulusan Bekerja/Berwirausaha/Lanjut Studi ============

export interface Iku2Data {
  bekerjaJumlah: number;
  bekerjaBobot: number;
  wirausahaJumlah: number;
  wirausahaBobot: number;
  studiJumlah: number;
  sudahBekerjaJumlah: number;
  sudahBekerjaBobot: number;
  totalResponden: number;
}

export function calcIKU2(data: Iku2Data): number {
  if (!data.totalResponden || data.totalResponden === 0) return 0;
  const weightedSum =
    data.bekerjaJumlah * data.bekerjaBobot +
    data.wirausahaJumlah * data.wirausahaBobot +
    data.studiJumlah * 0.6 +
    data.sudahBekerjaJumlah * data.sudahBekerjaBobot;
  return (weightedSum / data.totalResponden) * 100;
}

export function calcIKU2_Aggregate(dataList: Iku2Data[]): number {
  if (dataList.length === 0) return 0;
  const totalWeightedSum = dataList.reduce((acc, d) => {
    return acc + d.bekerjaJumlah * d.bekerjaBobot + d.wirausahaJumlah * d.wirausahaBobot + d.studiJumlah * 0.6 + d.sudahBekerjaJumlah * d.sudahBekerjaBobot;
  }, 0);
  const totalResponden = dataList.reduce((acc, d) => acc + d.totalResponden, 0);
  if (totalResponden === 0) return 0;
  return (totalWeightedSum / totalResponden) * 100;
}

// ============ IKU 3: Mahasiswa Berprestasi di Luar Prodi ============

export interface Iku3Data {
  mahasiswaKegiatan: number;
  bobotKegiatan: number;
  totalMahasiswa: number;
}

export function calcIKU3(data: Iku3Data): number {
  if (!data.totalMahasiswa || data.totalMahasiswa === 0) return 0;
  return (data.mahasiswaKegiatan * data.bobotKegiatan / data.totalMahasiswa) * 100;
}

export function calcIKU3_Aggregate(dataList: Iku3Data[]): number {
  if (dataList.length === 0) return 0;
  const totalWeighted = dataList.reduce((acc, d) => acc + d.mahasiswaKegiatan * d.bobotKegiatan, 0);
  const totalMahasiswa = dataList.reduce((acc, d) => acc + d.totalMahasiswa, 0);
  if (totalMahasiswa === 0) return 0;
  return (totalWeighted / totalMahasiswa) * 100;
}

// ============ IKU 5: Kerja Sama & Hilirisasi Industri ============

export interface Iku5Data {
  jumlahLuaran: number;
  totalKerjasama: number;
}

export function calcIKU5(data: Iku5Data): number {
  if (!data.totalKerjasama || data.totalKerjasama === 0) return 0;
  return (data.jumlahLuaran / data.totalKerjasama) * 100;
}

export function calcIKU5_Aggregate(dataList: Iku5Data[]): number {
  if (dataList.length === 0) return 0;
  const totalLuaran = dataList.reduce((acc, d) => acc + d.jumlahLuaran, 0);
  const totalKerjasama = dataList.reduce((acc, d) => acc + d.totalKerjasama, 0);
  if (totalKerjasama === 0) return 0;
  return (totalLuaran / totalKerjasama) * 100;
}

// ============ IKU 7: Keterlibatan SDGs ============

export interface Iku7Data {
  jumlahProgramSDG: number;
  totalProgram: number;
}

export function calcIKU7(data: Iku7Data): number {
  if (!data.totalProgram || data.totalProgram === 0) return 0;
  return (data.jumlahProgramSDG / data.totalProgram) * 100;
}

export function calcIKU7_Aggregate(dataList: Iku7Data[]): number {
  if (dataList.length === 0) return 0;
  const totalSDG = dataList.reduce((acc, d) => acc + d.jumlahProgramSDG, 0);
  const totalProgram = dataList.reduce((acc, d) => acc + d.totalProgram, 0);
  if (totalProgram === 0) return 0;
  return (totalSDG / totalProgram) * 100;
}

// ============ IKU 9: Pendapatan Non-Akademik ============

export interface Iku9Data {
  pendapatanNonAkademik: number;
  totalPendapatan: number;
}

export function calcIKU9(data: Iku9Data): number {
  if (!data.totalPendapatan || data.totalPendapatan === 0) return 0;
  return (data.pendapatanNonAkademik / data.totalPendapatan) * 100;
}

export function calcIKU9_Aggregate(dataList: Iku9Data[]): number {
  if (dataList.length === 0) return 0;
  const totalNonAkademik = dataList.reduce((acc, d) => acc + d.pendapatanNonAkademik, 0);
  const totalPendapatan = dataList.reduce((acc, d) => acc + d.totalPendapatan, 0);
  if (totalPendapatan === 0) return 0;
  return (totalNonAkademik / totalPendapatan) * 100;
}

// ============ IKU 12: Kesejahteraan Dosen ============

export interface Iku12Data {
  dokumenTersedia: "ya" | "sebagian" | "tidak";
  skorKomposit: number;
}

export function calcIKU12_Skor(data: Iku12Data): number {
  let baseScore = 0;
  if (data.dokumenTersedia === "ya") baseScore = 100;
  else if (data.dokumenTersedia === "sebagian") baseScore = 60;
  else baseScore = 0;
  
  // If skorKomposit is provided and > 0, use it; otherwise use dokumen-based score
  if (data.skorKomposit > 0) return data.skorKomposit;
  return baseScore;
}

export function calcIKU12_Aggregate(dataList: Iku12Data[]): number {
  if (dataList.length === 0) return 0;
  const totalSkor = dataList.reduce((acc, d) => acc + calcIKU12_Skor(d), 0);
  return totalSkor / dataList.length;
}

export function calcIKU12_DokumenSummary(dataList: Iku12Data[]): { ya: number; sebagian: number; tidak: number } {
  return {
    ya: dataList.filter((d) => d.dokumenTersedia === "ya").length,
    sebagian: dataList.filter((d) => d.dokumenTersedia === "sebagian").length,
    tidak: dataList.filter((d) => d.dokumenTersedia === "tidak").length,
  };
}

// ============ Generic calculate function ============

export type AnyIkuData = Iku1Data | Iku2Data | Iku3Data | Iku5Data | Iku7Data | Iku9Data | Iku12Data;

export function calcIku(ikuId: string, data: AnyIkuData): number {
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
}

export function calcIkuAggregate(ikuId: string, dataList: AnyIkuData[]): number {
  switch (ikuId) {
    case "iku1": {
      // IKU1 aggregate needs jenjang info, handled separately
      const nonEmpty = dataList.filter((d) => (d as Iku1Data).jumlahMasuk > 0);
      if (nonEmpty.length === 0) return 0;
      // Simple average of realisation for aggregate without jenjang
      return nonEmpty.reduce((acc, d) => acc + calcAEE_Realisation(d as Iku1Data), 0) / nonEmpty.length;
    }
    case "iku2": return calcIKU2_Aggregate(dataList as Iku2Data[]);
    case "iku3": return calcIKU3_Aggregate(dataList as Iku3Data[]);
    case "iku5": return calcIKU5_Aggregate(dataList as Iku5Data[]);
    case "iku7": return calcIKU7_Aggregate(dataList as Iku7Data[]);
    case "iku9": return calcIKU9_Aggregate(dataList as Iku9Data[]);
    case "iku12": return calcIKU12_Aggregate(dataList as Iku12Data[]);
    default: return 0;
  }
}

export function hasData(data: Record<string, unknown> | null | undefined): boolean {
  if (!data) return false;
  return Object.values(data).some((v) => {
    if (typeof v === "number") return v > 0;
    if (typeof v === "string") return v !== "" && v !== "tidak";
    return false;
  });
}
