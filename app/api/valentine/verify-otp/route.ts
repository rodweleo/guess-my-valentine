import { NextResponse } from "next/server";
import { getTokenCollection, getValentineCollection } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import { signToken } from "@/lib/jwt";
import crypto from "crypto";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: Request) {
  const { valentine_id, otp } = (await req.json()) as {
    valentine_id: string;
    otp: string;
  };

  const valentines = await getValentineCollection();
  const tokens = await getTokenCollection();

  const valentine = await valentines.findOne({
    _id: new ObjectId(valentine_id),
  });

  if (
    !valentine ||
    !valentine.otpCode ||
    !valentine.otpExpiresAt ||
    valentine.otpCode !== otp ||
    valentine.otpExpiresAt < new Date()
  ) {
    return NextResponse.json(
      { success: false, error: "Invalid or expired code" },
      { status: 400 }
    );
  }

  await valentines.updateOne(
    { _id: valentine._id },
    {
      $set: {
        otpVerified: true,
        otpCode: null,
        otpExpiresAt: null,
        updatedAt: new Date(),
      },
    }
  );

  const jti = crypto.randomUUID();

  await tokens.insertOne({
    valentineId: valentine._id,
    jti,
    used: false,
    expiresAt: valentine.expiresAt,
    createdAt: new Date(),
  });

  const token = signToken({ vid: valentine._id.toString(), jti });

  await sendWhatsAppMessage(
    valentine.receiverPhone,
    `💌 Someone sent you a Valentine 👉 https://vln.tld/v/${token}`
  );

  return NextResponse.json({ success: true, token });
}
