import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { getValentineCollection } from "@/lib/mongo";
import { hashPhone } from "@/lib/crypto";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  const { token, guessed_phone } = await req.json();
  const decoded = verifyToken(token);

  const valentines = await getValentineCollection();
  const valentine = await valentines.findOne({
    _id: new ObjectId(decoded.vid),
  });

  if (!valentine) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (hashPhone(guessed_phone) === valentine.senderHash) {
    return NextResponse.json({ correct: true });
  }

  const attempts = (valentine.guessAttempts ?? 0) + 1;

  const newStatus =
    attempts >= (valentine.maxAttempts ?? 3) ? "EXPIRED" : valentine.status;

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
    remaining_attempts: Math.max(0, valentine.maxAttempts - attempts),
  });
}
