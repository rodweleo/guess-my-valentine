import { NextResponse } from "next/server";
import { getValentineCollection } from "@/lib/mongo";
import { generateOTP } from "@/lib/crypto";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { ObjectId } from "mongodb";
import NotificationService from "@/app/services/NotificationService";

export async function POST(req: Request) {
  const { valentine_id } = (await req.json()) as { valentine_id: string };

  const valentines = await getValentineCollection();
  const valentine = await valentines.findOne({
    _id: new ObjectId(valentine_id),
  });

  if (!valentine) {
    return NextResponse.json(
      { success: false, error: "Valentine not found" },
      { status: 404 }
    );
  }

  const otp = generateOTP();

  await valentines.updateOne(
    { _id: valentine._id },
    {
      $set: {
        otpCode: otp,
        otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        updatedAt: new Date(),
      },
    }
  );

  await NotificationService.sendNotification({
    channel: "whatsapp",
    message_type: "OTP",
    to: valentine.senderPhone,
    message: otp,
  });

  return NextResponse.json({ success: true });
}
