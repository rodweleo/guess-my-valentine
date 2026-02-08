import { NextResponse } from "next/server";
import {
  getShortTokenCollection,
  getTokenCollection,
  getValentineCollection,
} from "@/lib/mongo";
import { ObjectId } from "mongodb";
import { signToken } from "@/lib/jwt";
import crypto from "crypto";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { generateShortCode } from "@/lib/crypto";
import NotificationService from "@/app/services/NotificationService";

export async function POST(req: Request) {
  const { valentine_id, otp } = (await req.json()) as {
    valentine_id: string;
    otp: string;
  };

  const valentines = await getValentineCollection();
  const tokens = await getTokenCollection();
  const shortTokens = await getShortTokenCollection();

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

  // Mark OTP verified
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

  const jwt = signToken({
    vid: valentine._id.toString(),
    jti,
  });

  // Generate UNIQUE short code
  let shortCode: string = "";
  let exists = true;

  while (exists) {
    shortCode = generateShortCode(6);
    exists = !!(await shortTokens.findOne({ shortCode }));
  }

  await shortTokens.insertOne({
    shortCode,
    token: jwt,
    jti,
    valentineId: valentine._id,
    used: false,
    expiresAt: valentine.expiresAt,
    createdAt: new Date(),
  });

  // Send SHORT URL (not JWT)
  await NotificationService.sendNotification({
    channel: "whatsapp",
    message_type: "default",
    to: valentine.receiverPhone,
    message: shortCode,
  });

  // Never return JWT to client
  return NextResponse.json({
    success: true,
    shortCode,
  });
}
