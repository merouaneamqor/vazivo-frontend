import { NextResponse } from "next/server";

// Silences Chrome DevTools automatic probe for com.chrome.devtools.json
export function GET() {
  return NextResponse.json({}, { status: 200 });
}
