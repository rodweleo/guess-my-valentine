import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { getValentineCollection } from "@/lib/mongo";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  const { token } = (await req.json()) as { token: string };

  try {
    const decoded = verifyToken(token);

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
