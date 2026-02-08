export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import {
  getShortTokenCollection,
  getTokenCollection,
  getValentineCollection,
} from "@/lib/mongo";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { ObjectId } from "mongodb";
import NotificationService from "@/app/services/NotificationService";

export async function POST(req: Request) {
  const { shortCode, response, activities } = await req.json();

  const shortTokens = await getShortTokenCollection();
  const tokens = await getTokenCollection();
  const valentines = await getValentineCollection();

  const shortRecord = await shortTokens.findOne({ shortCode });
  if (!shortRecord || shortRecord.used) {
    throw new Error("Invalid or used short code");
  }

  const decoded = verifyToken(shortRecord.token);

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
    { _id: new ObjectId(String(decoded.vid as string)) },
    {
      $set: {
        status: newStatus,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  const valentine = result;

  await NotificationService.sendNotification({
    channel: "whatsapp",
    message_type: "RESPONSE",
    to: valentine?.senderPhone,
    message:
      response === "YES"
        ? `They said YES!!! \n\n Plans: ${activities.join(", ")}`
        : `Your Valentine was viewed but declined. I'm sorry.`,
  });

  return NextResponse.json({ success: true });
}
