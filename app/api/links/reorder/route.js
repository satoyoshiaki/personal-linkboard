import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureAdmin } from "../../../../lib/api-auth";
import { updateLinkOrder } from "../../../../lib/db";

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.number(),
      sortOrder: z.number().min(0).max(999),
    }),
  ),
});

export async function POST(request) {
  const unauthorized = ensureAdmin(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = await request.json();
    const parsed = reorderSchema.parse(body);
    const links = updateLinkOrder(parsed.items);
    return NextResponse.json({ links });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "並び順の更新に失敗しました。" },
      { status: 400 },
    );
  }
}
