// IKU Configuration for Universitas Tulungagung

export interface ProdiConfig {
  id: string;
  nama: string;
  jenjang: "D3" | "S1" | "S2" | "S3";
  fakultasId: string;
}

export interface FakultasConfig {
  id: string;
  nama: string;
  prodiList: ProdiConfig[];
}

export const FAKULTAS_LIST: FakultasConfig[] = [
  {
    id: "fe",
    nama: "Fakultas Ekonomi",
    prodiList: [
      { id: "s1-akuntansi", nama: "S1 Akuntansi", jenjang: "S1", fakultasId: "fe" },
      { id: "s1-manajemen", nama: "S1 Manajemen", jenjang: "S1", fakultasId: "fe" },
    ],
  },
  {
    id: "fh",
    nama: "Fakultas Hukum",
    prodiList: [
      { id: "s1-hukum", nama: "S1 Hukum", jenjang: "S1", fakultasId: "fh" },
    ],
  },
  {
    id: "fisip",
    nama: "Fakultas Ilmu Sosial dan Ilmu Politik",
    prodiList: [
      { id: "s1-administrasi-publik", nama: "S1 Administrasi Publik", jenjang: "S1", fakultasId: "fisip" },
    ],
  },
  {
    id: "fp",
    nama: "Fakultas Pertanian",
    prodiList: [
      { id: "s1-agribisnis", nama: "S1 Agribisnis", jenjang: "S1", fakultasId: "fp" },
    ],
  },
  {
    id: "ft",
    nama: "Fakultas Teknik",
    prodiList: [
      { id: "s1-teknik-sipil", nama: "S1 Teknik Sipil", jenjang: "S1", fakultasId: "ft" },
      { id: "s1-teknik-elektro", nama: "S1 Teknik Elektro", jenjang: "S1", fakultasId: "ft" },
    ],
  },
  {
    id: "fkes",
    nama: "Fakultas Kesehatan",
    prodiList: [
      { id: "d3-kebidanan", nama: "D3 Kebidanan", jenjang: "D3", fakultasId: "fkes" },
    ],
  },
];

export const ALL_PRODI: ProdiConfig[] = FAKULTAS_LIST.flatMap((f) => f.prodiList);

export function getProdiById(id: string): ProdiConfig | undefined {
  return ALL_PRODI.find((p) => p.id === id);
}

export function getFakultasById(id: string): FakultasConfig | undefined {
  return FAKULTAS_LIST.find((f) => f.id === id);
}

export function getProdiByFakultas(fakultasId: string): ProdiConfig[] {
  const fakultas = FAKULTAS_LIST.find((f) => f.id === fakultasId);
  return fakultas?.prodiList || [];
}

// AEE Ideal based on jenjang
export const AEE_IDEAL: Record<string, number> = {
  D1: 100,
  D2: 50,
  D3: 33,
  D4: 25,
  S1: 25,
  S2: 50,
  S3: 33,
};

// IKU Types
export const IKU_LIST = [
  { id: "iku1", label: "IKU 1", title: "Angka Efisiensi Edukasi (AEE PT)", shortTitle: "AEE PT" },
  { id: "iku2", label: "IKU 2", title: "Lulusan Bekerja, Berwirausaha, atau Lanjut Studi", shortTitle: "Lulusan Bekerja" },
  { id: "iku3", label: "IKU 3", title: "Mahasiswa Berkegiatan/Prestasi di Luar Prodi", shortTitle: "Mahasiswa Prestasi" },
  { id: "iku5", label: "IKU 5", title: "Luaran Hasil Kerja Sama & Hilirisasi Industri", shortTitle: "Kerja Sama Industri" },
  { id: "iku7", label: "IKU 7", title: "Keterlibatan dalam SDGs", shortTitle: "SDGs" },
  { id: "iku9", label: "IKU 9", title: "Pendapatan dari Bidang Non-Akademik", shortTitle: "Pendapatan Non-Akademik" },
  { id: "iku12", label: "IKU 12", title: "Kesejahteraan Dosen", shortTitle: "Kesejahteraan Dosen" },
] as const;

export type IkuId = typeof IKU_LIST[number]["id"];

// Input field definitions per IKU
export interface IkuFieldDef {
  key: string;
  label: string;
  type: "number" | "select" | "text";
  placeholder?: string;
  helperText?: string;
  defaultValue?: number | string;
  min?: number;
  step?: number;
  options?: { value: string; label: string }[];
}

export const IKU_FIELDS: Record<string, IkuFieldDef[]> = {
  iku1: [
    { key: "jumlahMasuk", label: "Total Mahasiswa Terdaftar Tahun Akademik", type: "number", placeholder: "0", helperText: "Total mahasiswa yang terdaftar pada tahun akademik tersebut", min: 0 },
    { key: "lulusTepatWaktu", label: "Jumlah Mahasiswa Lulus Tepat Waktu", type: "number", placeholder: "0", helperText: "Mahasiswa lulus sesuai masa tempuh kurikulum standar", min: 0 },
  ],
  iku2: [
    { key: "bekerjaJumlah", label: "Jumlah Lulusan Bekerja", type: "number", placeholder: "0", helperText: "Lulusan yang bekerja setelah lulus (semua kategori)", min: 0 },
    { key: "bekerjaBobot", label: "Bobot Rata-rata Bekerja", type: "number", placeholder: "0.8", helperText: "Bobot sesuai kriteria masa tunggu & gaji (0.6 - 1.0)", defaultValue: 0.8, min: 0, max: 1.2, step: 0.1 },
    { key: "wirausahaJumlah", label: "Jumlah Lulusan Berwirausaha", type: "number", placeholder: "0", helperText: "Lulusan yang berwirausaha (founder/co-founder/freelancer)", min: 0 },
    { key: "wirausahaBobot", label: "Bobot Rata-rata Wirausaha", type: "number", placeholder: "0.7", helperText: "Bobot sesuai kriteria (0.2 - 1.2)", defaultValue: 0.7, min: 0, max: 1.2, step: 0.1 },
    { key: "studiJumlah", label: "Jumlah Lulusan Melanjutkan Studi", type: "number", placeholder: "0", helperText: "Lulusan yang melanjutkan studi dalam 1 tahun", min: 0 },
    { key: "sudahBekerjaJumlah", label: "Jumlah Sudah Bekerja/Wirausaha Sebelum Lulus", type: "number", placeholder: "0", helperText: "Mahasiswa yang sudah bekerja/berwirausaha sebelum lulus", min: 0 },
    { key: "sudahBekerjaBobot", label: "Bobot Sudah Bekerja Sebelum Lulus", type: "number", placeholder: "1.0", helperText: "Bobot rata-rata (0.6 - 1.0)", defaultValue: 1.0, min: 0, max: 1.2, step: 0.1 },
    { key: "totalResponden", label: "Total Responden Tracer Study", type: "number", placeholder: "0", helperText: "Total responden yang berhasil dikumpulkan", min: 0 },
  ],
  iku3: [
    { key: "mahasiswaKegiatan", label: "Jumlah Mahasiswa Kegiatan Luar Prodi (Tertimbang)", type: "number", placeholder: "0", helperText: "Jumlah mahasiswa yang berkegiatan di luar prodi dikali bobot masing-masing", min: 0 },
    { key: "bobotKegiatan", label: "Bobot Rata-rata Kegiatan", type: "number", placeholder: "0.5", helperText: "Bobot rata-rata kegiatan (0.05 - 1.0)", defaultValue: 0.5, min: 0, max: 1, step: 0.05 },
    { key: "totalMahasiswa", label: "Total Mahasiswa Terdaftar", type: "number", placeholder: "0", helperText: "Total mahasiswa program studi yang terdaftar", min: 0 },
  ],
  iku5: [
    { key: "jumlahLuaran", label: "Jumlah Luaran Hasil Kerja Sama", type: "number", placeholder: "0", helperText: "Jumlah luaran nyata dari kerja sama dengan industri/lembaga", min: 0 },
    { key: "totalKerjasama", label: "Total Kerja Sama Perguruan Tinggi", type: "number", placeholder: "0", helperText: "Total kerja sama yang dilakukan perguruan tinggi", min: 0 },
  ],
  iku7: [
    { key: "jumlahProgramSDG", label: "Jumlah Program/Kegiatan SDG", type: "number", placeholder: "0", helperText: "Jumlah program/kegiatan PT yang berkontribusi pada SDGs (khususnya SDG 1, 4, 17)", min: 0 },
    { key: "totalProgram", label: "Total Program Perguruan Tinggi", type: "number", placeholder: "0", helperText: "Total program/kegiatan perguruan tinggi", min: 0 },
  ],
  iku9: [
    { key: "pendapatanNonAkademik", label: "Pendapatan Non-Akademik (Rp)", type: "number", placeholder: "0", helperText: "Pendapatan/penghasilan dari bidang non-akademik", min: 0 },
    { key: "totalPendapatan", label: "Total Pendapatan Perguruan Tinggi (Rp)", type: "number", placeholder: "0", helperText: "Total seluruh pendapatan perguruan tinggi dalam satu periode", min: 0 },
  ],
  iku12: [
    { key: "dokumenTersedia", label: "Ketersediaan Dokumen Perencanaan", type: "select", helperText: "Apakah dokumen perencanaan strategis kesejahteraan dosen tersedia?", options: [
      { value: "ya", label: "Ya - Tersedia dan Terimplementasi" },
      { value: "sebagian", label: "Sebagian - Tersedia tapi Belum Terimplementasi Penuh" },
      { value: "tidak", label: "Tidak - Belum Tersedia" },
    ]},
    { key: "skorKomposit", label: "Skor Komposit Kesejahteraan (%)", type: "number", placeholder: "0", helperText: "Skor komposit berdasarkan indikator kesejahteraan dosen (0-100)", min: 0, defaultValue: 0 },
  ],
};
