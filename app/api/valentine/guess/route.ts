import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import {
  getValentineCollection,
  getTokenCollection,
  getShortTokenCollection, // short token collection
} from "@/lib/mongo";
import { hashPhone } from "@/lib/crypto";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  const { shortCode, guessed_phone } = await req.json();

  if (!shortCode || !guessed_phone) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    /**
     * 1. Resolve short token → JWT
     */
    const shortTokens = await getShortTokenCollection();
    const shortRecord = await shortTokens.findOne({ shortCode });

    if (!shortRecord || shortRecord.used) {
      throw new Error("Invalid or used short code");
    }

    const tokens = await getTokenCollection();
    const tokenRecord = await tokens.findOne({ jti: shortRecord.jti });

    if (!tokenRecord || tokenRecord.used) {
      return NextResponse.json(
        { error: "Invalid or expired link" },
        { status: 401 }
      );
    }

    /**
     * 2. Verify JWT
     */
    const decoded = verifyToken(shortRecord.token);

    /**
     * 3. Load Valentine
     */
    const valentines = await getValentineCollection();

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(String(decoded.vid));
    } catch {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const valentine = await valentines.findOne({ _id: objectId });

    if (!valentine) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    /**
     * 4. Check phone guess
     */
    if (hashPhone(guessed_phone) === valentine.senderHash) {
      return NextResponse.json({ correct: true });
    }

    /**
     * 5. Handle failed attempt
     */
    const attempts = (valentine.guessAttempts ?? 0) + 1;

    const maxAttempts = valentine.maxAttempts ?? 3;
    const newStatus = attempts >= maxAttempts ? "EXPIRED" : valentine.status;

    await valentines.updateOne(
      { _id: valentine._id },
      {
        $set: {
          guessAttempts: attempts,
          status: newStatus,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      correct: false,
      remaining_attempts: Math.max(0, maxAttempts - attempts),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid or expired link" },
      { status: 401 }
    );
  }
}
