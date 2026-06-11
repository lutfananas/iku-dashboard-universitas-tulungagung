---
Task ID: 2
Agent: Main Agent
Task: Restructure IKU Dashboard with sidebar navigation, prodi input forms, and formula calculations

Work Log:
- Redesigned Prisma schema with IkuData model storing JSON per IKU per prodi+tahun
- Created iku-config.ts with prodi/fakultas structure, AEE ideals, IKU field definitions
- Created iku-calculations.ts with all formula implementations (IKU 1-12)
- Rewrote API route with GET/POST/DELETE for IKU data CRUD with upsert logic
- Built sidebar navigation with expandable fakultas tree and prodi items
- Built prodi input forms with 7 IKU tabs, formula explanations, and calculation previews
- Built aggregated dashboard views for Global and Fakultas levels with radar/bar charts
- Added toast notifications on save
- Verified with Agent Browser - all 8 test steps passed
- Calculation verification: IKU 1 formula (AEE = lulusTepat/masuk × 100%, Tingkat Pencapaian = realisasi/ideal × 100%) works correctly

Stage Summary:
- Dashboard now has proper navigation: Global Universitas → Fakultas → Prodi
- Each prodi can input all 7 IKU indicators with formula-based auto-calculation
- Data persists in SQLite via Prisma
- Aggregated views show calculated summaries with charts
- All formulas match Kepmendiktisaintek No. 358/M/KEP/2026 specifications
