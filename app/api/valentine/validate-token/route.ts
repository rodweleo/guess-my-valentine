import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import {
  getTokenCollection,
  getValentineCollection,
  getShortTokenCollection,
} from "@/lib/mongo";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  const { shortCode } = await req.json();

  try {
    // Resolve short code → long token
    const shortTokens = await getShortTokenCollection();
    const shortRecord = await shortTokens.findOne({ shortCode });

    if (!shortRecord || shortRecord.used) {
      throw new Error("Invalid or used short code");
    }

    // Verify JWT
    const decoded = verifyToken(shortRecord.token);

    // Validate token record (existing logic)
    const tokens = await getTokenCollection();
    const tokenRecord = await tokens.findOne({ jti: decoded.jti });

    if (!tokenRecord || tokenRecord.used) {
      throw new Error("Invalid token");
    }

    // Validate valentine
    const valentines = await getValentineCollection();
    const valentine = await valentines.findOne({
      _id: new ObjectId(String(decoded.vid)),
    });

    if (!valentine || valentine.status !== "PENDING") {
      throw new Error("Invalid valentine");
    }

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
