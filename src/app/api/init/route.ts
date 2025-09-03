import { NextResponse } from "next/server";

export async function GET() {
  const data = {
    message: "API no ar!",
    status: "online",
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(data);
}
