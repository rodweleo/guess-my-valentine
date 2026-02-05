import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { getTokenCollection, getValentineCollection } from "@/lib/mongo";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  const { token } = await req.json();

  try {
    const decoded = verifyToken(token);

    const tokens = await getTokenCollection();
    const tokenRecord = await tokens.findOne({ jti: decoded.jti });

    if (!tokenRecord || tokenRecord.used) throw new Error();

    const valentines = await getValentineCollection();
    const valentine = await valentines.findOne({
      _id: new ObjectId(decoded.vid),
    });

    if (!valentine || valentine.status !== "PENDING") throw new Error();

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
