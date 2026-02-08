import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { getShortTokenCollection, getValentineCollection } from "@/lib/mongo";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  const { shortCode } = (await req.json()) as { shortCode: string | number };

  try {
    const shortTokens = await getShortTokenCollection();
    const shortRecord = await shortTokens.findOne({ shortCode });

    if (!shortRecord || shortRecord.used) {
      throw new Error("Invalid or used short code");
    }

    const decoded = verifyToken(shortRecord.token);

    const valentines = await getValentineCollection();
    let objectId;
    try {
      objectId = new ObjectId(decoded.vid as string);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid Valentine ID" },
        { status: 400 }
      );
    }
    const valentine = await valentines.findOne({
      _id: objectId,
    });

    if (!valentine) {
      return NextResponse.json(
        { error: "Valentine not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: valentine.status,
      message: valentine.message,
      activities: valentine.activities,
    });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
