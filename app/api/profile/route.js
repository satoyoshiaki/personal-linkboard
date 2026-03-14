import { NextResponse } from "next/server";
import { ensureAdmin } from "../../../lib/api-auth";
import { getProfile, updateProfile } from "../../../lib/db";
import { profileSchema } from "../../../lib/validators";

export async function GET() {
  return NextResponse.json({ profile: getProfile() });
}

export async function PUT(request) {
  const unauthorized = ensureAdmin(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = await request.json();
    const parsed = profileSchema.parse(body);
    const profile = updateProfile(parsed);
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "プロフィールの保存に失敗しました。" },
      { status: 400 },
    );
  }
}
