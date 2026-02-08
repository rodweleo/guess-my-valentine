import { NextResponse } from "next/server";
import { hashPhone, generateOTP } from "@/lib/crypto";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { getValentineCollection } from "@/lib/mongo";
import NotificationService from "@/app/services/NotificationService";

export async function POST(req: Request) {
  const { sender_phone, receiver_phone, message, activities } =
    await req.json();

  const otp = generateOTP();

  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const valentines = await getValentineCollection();

  await NotificationService.sendNotification({
    channel: "whatsapp",
    message_type: "OTP",
    to: sender_phone,
    message: otp,
  });

  const insertResult = await valentines.insertOne({
    senderHash: hashPhone(sender_phone),
    receiverHash: hashPhone(receiver_phone),
    senderPhone: sender_phone,
    receiverPhone: receiver_phone,
    message,
    activities,
    status: "PENDING",
    guessAttempts: 0,
    maxAttempts: 3,
    otpVerified: false,
    otpCode: otp,
    otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    expiresAt,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return NextResponse.json({
    success: true,
    valentine_id: insertResult.insertedId.toString(),
  });
}
