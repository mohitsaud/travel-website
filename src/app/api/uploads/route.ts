import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdmin, requireSameOrigin } from "@/lib/require-admin";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const maxDuration = 15;

function detectImageType(bytes: Uint8Array) {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.length >= 6 && String.fromCharCode(...bytes.subarray(0, 6)).match(/^GIF8[79]a$/)) return "gif";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" && String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP") return "webp";
  return null;
}

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_FILE_SIZE + 64 * 1024) {
      return NextResponse.json({ error: "Images must be smaller than 5 MB." }, { status: 413 });
    }
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Images must be smaller than 5 MB." }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const detectedExtension = detectImageType(bytes);
    if (!detectedExtension || detectedExtension === "gif") {
      return NextResponse.json({ error: "Upload a valid PNG, JPEG, or WebP image." }, { status: 400 });
    }

    const output = await sharp(bytes, { limitInputPixels: 25_000_000, animated: false })
      .rotate()
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const filename = `${randomUUID()}.webp`;
    const uploadDirectory = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(path.join(uploadDirectory, filename), output, { flag: "wx" });

    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to upload this image." }, { status: 500 });
  }
}