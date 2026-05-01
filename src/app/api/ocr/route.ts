import { NextResponse } from "next/server";
import Tesseract from "tesseract.js";
import { translate } from "@/i18n/dictionaries";
import { langFromRequest } from "@/i18n/locale-from-request";
import { apiT } from "@/i18n/api-translate";

function extractPrice(text: string) {
  const match = text.match(/(\d+[\.,]\d{2})/);
  if (!match) return null;
  return Number(match[1].replace(",", "."));
}

function extractName(text: string) {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  return lines[0]?.trim() ?? "";
}

export async function POST(req: import("next/server").NextRequest) {
  const lang = langFromRequest(req);
  const form = await req.formData();
  const image = form.get("image");

  if (!(image instanceof File)) {
    return NextResponse.json({ error: apiT(req, "api.imageRequired") }, { status: 400 });
  }

  const buffer = Buffer.from(await image.arrayBuffer());
  const result = await Tesseract.recognize(buffer, "por");
  const rawText = result.data.text;

  return NextResponse.json({
    rawText,
    suggestion: {
      productName: extractName(rawText) || translate(lang, "api.productNoName"),
      price: extractPrice(rawText),
    },
  });
}
