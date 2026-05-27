// app/api/cubecobra/[code]/route.ts
import { NextRequest, NextResponse } from "next/server";

interface Ctx { params: Promise<{ code: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { code } = await params;

  const res = await fetch(`https://cubecobra.com/cube/api/cubeJSON/${code}`, {
    headers: { "User-Agent": "los-cubes-hermanos/1.0" },
    next: { revalidate: 3600 }, // cache for 1 hour
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `CubeCobra returned ${res.status}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
