import { NextResponse } from "next/server";
import { ensureAdmin } from "../../../lib/api-auth";
import { createLink, getLinks } from "../../../lib/db";
import { linkSchema } from "../../../lib/validators";

export async function GET() {
  return NextResponse.json({ links: getLinks() });
}

export async function POST(request) {
  const unauthorized = ensureAdmin(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = await request.json();
    const parsed = linkSchema.parse(body);
    const link = createLink(parsed);
    return NextResponse.json({ link });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "リンクの作成に失敗しました。" },
      { status: 400 },
    );
  }
}
