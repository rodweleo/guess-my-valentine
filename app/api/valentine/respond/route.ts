export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { getTokenCollection, getValentineCollection } from "@/lib/mongo";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  const { token, response, activities } = await req.json();
  const decoded = verifyToken(token);

  const tokens = await getTokenCollection();
  const valentines = await getValentineCollection();

  await tokens.updateOne(
    { jti: decoded.jti },
    {
      $set: {
        used: true,
      },
    }
  );

  const newStatus = response === "YES" ? "ACCEPTED" : "DECLINED";

  const result = await valentines.findOneAndUpdate(
    { _id: new ObjectId(decoded.vid) },
    {
      $set: {
        status: newStatus,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  const valentine = result?.value;

  await sendWhatsAppMessage(
    valentine.senderPhone,
    response === "YES"
      ? `SHE SAID YES 💕 Plans: ${activities.join(", ")}`
      : `Your Valentine was viewed 💙`
  );

  return NextResponse.json({ success: true });
}
