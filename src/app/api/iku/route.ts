import { NextRequest, NextResponse } from "next/server";

let dbAvailable = false;
let db: Awaited<typeof import("@/lib/db")>["db"] | null = null;

try {
  // Dynamically import db - will fail gracefully on Vercel if SQLite file doesn't exist
  const dbModule = await import("@/lib/db");
  db = dbModule.db;
  // Test if db works by doing a simple query
  await db.ikuData.findMany({ take: 1 });
  dbAvailable = true;
} catch {
  console.warn("Database not available - running in localStorage-only mode");
  dbAvailable = false;
}

// GET /api/iku?tahun=2025 or GET /api/iku (all data)
export async function GET(request: NextRequest) {
  if (!dbAvailable || !db) {
    return NextResponse.json([]);
  }

  try {
    const { searchParams } = new URL(request.url);
    const tahun = searchParams.get("tahun");
    const prodi = searchParams.get("prodi");

    const where: Record<string, unknown> = {};
    if (tahun) where.tahun = parseInt(tahun);
    if (prodi) where.prodi = prodi;

    const data = await db.ikuData.findMany({ where, orderBy: [{ tahun: "desc" }, { prodi: "asc" }] });

    // Parse JSON fields
    const parsed = data.map((d) => ({
      ...d,
      iku1: d.iku1 ? JSON.parse(d.iku1) : null,
      iku2: d.iku2 ? JSON.parse(d.iku2) : null,
      iku3: d.iku3 ? JSON.parse(d.iku3) : null,
      iku5: d.iku5 ? JSON.parse(d.iku5) : null,
      iku7: d.iku7 ? JSON.parse(d.iku7) : null,
      iku9: d.iku9 ? JSON.parse(d.iku9) : null,
      iku12: d.iku12 ? JSON.parse(d.iku12) : null,
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("GET /api/iku error:", error);
    return NextResponse.json([]);
  }
}

// POST /api/iku - Create or update IKU data for a prodi+tahun
export async function POST(request: NextRequest) {
  if (!dbAvailable || !db) {
    return NextResponse.json({ ok: true, mode: "localStorage-only" });
  }

  try {
    const body = await request.json();
    const { prodi, fakultas, tahun, ikuId, data: ikuData } = body;

    if (!prodi || !fakultas || !tahun || !ikuId) {
      return NextResponse.json({ error: "Missing required fields: prodi, fakultas, tahun, ikuId" }, { status: 400 });
    }

    const validIkuIds = ["iku1", "iku2", "iku3", "iku5", "iku7", "iku9", "iku12"];
    if (!validIkuIds.includes(ikuId)) {
      return NextResponse.json({ error: "Invalid ikuId" }, { status: 400 });
    }

    const jsonData = JSON.stringify(ikuData);

    // Upsert: find existing record for this prodi+tahun, or create new
    const existing = await db.ikuData.findUnique({
      where: { prodi_tahun: { prodi, tahun: parseInt(tahun) } },
    });

    let result;
    if (existing) {
      result = await db.ikuData.update({
        where: { id: existing.id },
        data: { [ikuId]: jsonData },
      });
    } else {
      result = await db.ikuData.create({
        data: {
          prodi,
          fakultas,
          tahun: parseInt(tahun),
          [ikuId]: jsonData,
        },
      });
    }

    return NextResponse.json({
      ...result,
      iku1: result.iku1 ? JSON.parse(result.iku1) : null,
      iku2: result.iku2 ? JSON.parse(result.iku2) : null,
      iku3: result.iku3 ? JSON.parse(result.iku3) : null,
      iku5: result.iku5 ? JSON.parse(result.iku5) : null,
      iku7: result.iku7 ? JSON.parse(result.iku7) : null,
      iku9: result.iku9 ? JSON.parse(result.iku9) : null,
      iku12: result.iku12 ? JSON.parse(result.iku12) : null,
    });
  } catch (error) {
    console.error("POST /api/iku error:", error);
    return NextResponse.json({ ok: true, mode: "localStorage-only" });
  }
}

// DELETE /api/iku?prodi=s1-akuntansi&tahun=2025
export async function DELETE(request: NextRequest) {
  if (!dbAvailable || !db) {
    return NextResponse.json({ success: true });
  }

  try {
    const { searchParams } = new URL(request.url);
    const prodi = searchParams.get("prodi");
    const tahun = searchParams.get("tahun");

    if (!prodi || !tahun) {
      return NextResponse.json({ error: "Missing required fields: prodi, tahun" }, { status: 400 });
    }

    await db.ikuData.deleteMany({
      where: { prodi, tahun: parseInt(tahun) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/iku error:", error);
    return NextResponse.json({ success: true });
  }
}
