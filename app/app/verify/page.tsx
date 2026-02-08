"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Heart, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { FloatingHearts } from "@/components/FloatingHearts";

export default function VerifyOTP() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const searchParams = useSearchParams();
  const valentineId = searchParams.get("valentineId");
  const sessionPhone = searchParams.get("phone");

  useEffect(() => {
    // Redirect if no session
    if (!valentineId || !sessionPhone) {
      router.push("/app/create");
      return;
    }

    // Countdown timer
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionPhone, router]);

  const handleOTPChange = (value: string) => {
    setOtp(value);
    setError("");

    // Auto-submit when complete
    if (value.length === 6) {
      handleVerify(value);
    }
  };

  const handleVerify = async (code: string) => {
    setIsVerifying(true);
    setError("");

    // Small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      if (!valentineId) {
        throw new Error("Missing Valentine ID");
      }

      const res = await fetch("/api/valentine/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          valentine_id: valentineId,
          otp: code,
        }),
      });

      if (!res.ok) {
        throw new Error("Invalid code. Please try again.");
      }

      const data = await res.json();

      if (!data.shortCode) {
        throw new Error("Invalid response from server");
      }

      router.push(
        "/app/success?shortCode=" + encodeURIComponent(data.shortCode)
      );
    } catch (err) {
      console.error(err);
      setError("Invalid code. Please try again.");
      setOtp("");
    }

    setIsVerifying(false);
  };

  const handleResend = async () => {
    if (!valentineId) return;

    setResendTimer(30);
    setCanResend(false);
    setError("");
    setOtp("");

    try {
      await fetch("/api/valentine/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ valentine_id: valentineId }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const formatPhone = (phone: string) => {
    if (!phone || phone.length !== 10) return phone;
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
  };

  return (
    <div className="min-h-screen romantic-gradient relative overflow-hidden">
      <FloatingHearts />

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/app/create")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Verification Card */}
        <Card className="max-w-md w-full glass-card card-shadow animate-fade-in-up">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full love-gradient flex items-center justify-center">
              <Heart
                className="w-8 h-8 text-primary-foreground animate-heartbeat"
                fill="currentColor"
              />
            </div>
            <CardTitle className="font-serif text-2xl">
              Verify Your Number
            </CardTitle>
            <CardDescription className="text-base">
              We sent a 6-digit code to
              <span className="block font-semibold text-foreground mt-1">
                {formatPhone(sessionPhone || "")}
              </span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* OTP Input */}
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={handleOTPChange}
                disabled={isVerifying}
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot
                    index={0}
                    className="w-12 h-14 text-xl font-serif rounded-lg border-2"
                  />
                  <InputOTPSlot
                    index={1}
                    className="w-12 h-14 text-xl font-serif rounded-lg border-2"
                  />
                  <InputOTPSlot
                    index={2}
                    className="w-12 h-14 text-xl font-serif rounded-lg border-2"
                  />
                  <InputOTPSlot
                    index={3}
                    className="w-12 h-14 text-xl font-serif rounded-lg border-2"
                  />
                  <InputOTPSlot
                    index={4}
                    className="w-12 h-14 text-xl font-serif rounded-lg border-2"
                  />
                  <InputOTPSlot
                    index={5}
                    className="w-12 h-14 text-xl font-serif rounded-lg border-2"
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-destructive text-center text-sm animate-fade-in-up">
                {error}
              </p>
            )}

            {/* Verifying State */}
            {isVerifying && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Verifying...</span>
              </div>
            )}

            {/* Resend */}
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-2">
                Didn't receive the code?
              </p>
              <Button
                variant="link"
                className="text-primary"
                disabled={!canResend}
                onClick={handleResend}
              >
                {canResend ? "Resend Code" : `Resend in ${resendTimer}s`}
              </Button>
            </div>

            {/* Info */}
            <div className="bg-secondary/50 rounded-xl p-4 text-center">
              <p className="text-muted-foreground text-xs">
                Enter the 6-digit code we sent to your phone to verify your
                number.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
