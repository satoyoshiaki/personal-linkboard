import { NextResponse } from "next/server";
import { ensureAdmin } from "../../../../lib/api-auth";
import { deleteLink, updateLink } from "../../../../lib/db";
import { linkSchema } from "../../../../lib/validators";

export async function PUT(request, { params }) {
  const unauthorized = ensureAdmin(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = await request.json();
    const parsed = linkSchema.parse(body);
    const link = updateLink(Number(params.id), parsed);
    return NextResponse.json({ link });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "リンクの更新に失敗しました。" },
      { status: 400 },
    );
  }
}

export async function DELETE(_request, { params }) {
  const unauthorized = ensureAdmin(_request);
  if (unauthorized) {
    return unauthorized;
  }

  deleteLink(Number(params.id));
  return NextResponse.json({ ok: true });
}
