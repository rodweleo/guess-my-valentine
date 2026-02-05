"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, Plus, X, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PhoneInput } from "@/components/PhoneInput";
import { FloatingHearts } from "@/components/FloatingHearts";
import { DATE_ACTIVITIES, EXPIRY_OPTIONS } from "@/lib/valentine-config";
import { cn } from "@/lib/utils";

export default function CreateValentine() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [senderPhone, setSenderPhone] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [hint, setHint] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [customActivity, setCustomActivity] = useState("");
  const [expiryDays, setExpiryDays] = useState("7");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    const senderDigits = senderPhone.replace(/\D/g, "").slice(-10);
    const receiverDigits = receiverPhone.replace(/\D/g, "").slice(-10);

    if (senderDigits.length !== 10) {
      newErrors.senderPhone = "Please enter a valid 10-digit phone number";
    }
    if (receiverDigits.length !== 10) {
      newErrors.receiverPhone = "Please enter a valid 10-digit phone number";
    }
    if (senderDigits === receiverDigits && senderDigits.length === 10) {
      newErrors.receiverPhone = "You can't send a Valentine to yourself! 💝";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (selectedActivities.length === 0) {
      newErrors.activities = "Please select at least one date activity";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      try {
        setIsSubmitting(true);

        const senderDigits = senderPhone.replace(/\D/g, "").slice(-10);
        const receiverDigits = receiverPhone.replace(/\D/g, "").slice(-10);

        const res = await fetch("/api/valentine/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender_phone: senderDigits,
            receiver_phone: receiverDigits,
            message: hint.trim() || undefined,
            activities: selectedActivities,
            // expiryDays is currently not wired to backend; backend controls expiry window
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to create Valentine");
        }

        const data = await res.json();

        if (!data.valentine_id) {
          throw new Error("Invalid response from server");
        }

        router.push(
          `/app/verify?valentineId=${encodeURIComponent(
            data.valentine_id
          )}&phone=${encodeURIComponent(senderDigits)}`
        );
      } catch (err) {
        console.error(err);
        setErrors((prev) => ({
          ...prev,
          activities:
            "Something went wrong creating your Valentine. Please try again.",
        }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const toggleActivity = (activityId: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
    );
    setErrors((prev) => ({ ...prev, activities: "" }));
  };

  const addCustomActivity = () => {
    if (customActivity.trim()) {
      const customId = `custom_${Date.now()}`;
      setSelectedActivities((prev) => [...prev, customActivity.trim()]);
      setCustomActivity("");
    }
  };

  const removeCustomActivity = (activity: string) => {
    setSelectedActivities((prev) => prev.filter((a) => a !== activity));
  };

  const getCustomActivities = () =>
    selectedActivities.filter((a) => !DATE_ACTIVITIES.some((d) => d.id === a));

  return (
    <div className="min-h-screen romantic-gradient relative overflow-hidden">
      <FloatingHearts />

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (step === 1 ? router.push("/") : setStep(1))}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Create Your Valentine
            </h1>
            <p className="text-muted-foreground text-sm">Step {step} of 2</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-secondary rounded-full mb-8 overflow-hidden">
          <div
            className="h-full love-gradient transition-all duration-500 ease-out"
            style={{ width: `${step * 50}%` }}
          />
        </div>

        {/* Form Card */}
        <Card className="max-w-lg mx-auto w-full glass-card card-shadow animate-fade-in-up">
          {step === 1 ? (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-2">
                  <Heart
                    className="w-10 h-10 text-primary animate-heartbeat"
                    fill="currentColor"
                  />
                </div>
                <CardTitle className="font-serif text-2xl">
                  Who's the lucky one?
                </CardTitle>
                <CardDescription>
                  Enter your details to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sender Phone */}
                <div className="space-y-2">
                  <Label htmlFor="senderPhone" className="font-medium">
                    Your Phone Number
                  </Label>
                  <PhoneInput
                    id="senderPhone"
                    value={senderPhone}
                    onChange={(e) => {
                      setSenderPhone(e.target.value);
                      setErrors((prev) => ({ ...prev, senderPhone: "" }));
                    }}
                    error={!!errors.senderPhone}
                  />
                  {errors.senderPhone && (
                    <p className="text-destructive text-sm">
                      {errors.senderPhone}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    We'll send you a verification code
                  </p>
                </div>

                {/* Receiver Phone */}
                <div className="space-y-2">
                  <Label htmlFor="receiverPhone" className="font-medium">
                    Their Phone Number
                  </Label>
                  <PhoneInput
                    id="receiverPhone"
                    value={receiverPhone}
                    onChange={(e) => {
                      setReceiverPhone(e.target.value);
                      setErrors((prev) => ({ ...prev, receiverPhone: "" }));
                    }}
                    error={!!errors.receiverPhone}
                  />
                  {errors.receiverPhone && (
                    <p className="text-destructive text-sm">
                      {errors.receiverPhone}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    This is who they'll need to guess to reveal your message
                  </p>
                </div>

                {/* Optional Hint */}
                <div className="space-y-2">
                  <Label htmlFor="hint" className="font-medium">
                    Hint or Nickname{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="hint"
                    placeholder="e.g., Your secret admirer from work 😉"
                    value={hint}
                    onChange={(e) => setHint(e.target.value)}
                    maxLength={100}
                  />
                  <p className="text-muted-foreground text-xs">
                    This hint will help them guess who you are
                  </p>
                </div>

                <Button
                  className="w-full love-gradient text-primary-foreground py-6 text-lg rounded-xl"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Creating..."
                  ) : (
                    <>
                      Continue
                      {/* <Sparkles className="ml-2 h-5 w-5" /> */}
                    </>
                  )}
                </Button>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-2">
                  <Calendar className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="font-serif text-2xl">
                  Plan Your Date
                </CardTitle>
                <CardDescription>
                  Pick activities for when they say yes!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Activities */}
                <div className="space-y-3">
                  <Label className="font-medium">Date Activities</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {DATE_ACTIVITIES.map((activity) => (
                      <button
                        key={activity.id}
                        type="button"
                        onClick={() => toggleActivity(activity.id)}
                        className={cn(
                          "p-4 rounded-xl border-2 text-left transition-all duration-200",
                          "hover:scale-[1.02] active:scale-[0.98]",
                          selectedActivities.includes(activity.id)
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-card hover:border-primary/50"
                        )}
                      >
                        <span className="text-2xl block mb-1">
                          {activity.emoji}
                        </span>
                        <span className="text-sm font-medium">
                          {activity.label.replace(activity.emoji + " ", "")}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Activities */}
                  {getCustomActivities().length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {getCustomActivities().map((activity) => (
                        <span
                          key={activity}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 border border-primary text-sm"
                        >
                          ✨ {activity}
                          <button
                            type="button"
                            onClick={() => removeCustomActivity(activity)}
                            className="hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Add Custom */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom activity..."
                      value={customActivity}
                      onChange={(e) => setCustomActivity(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && addCustomActivity()
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addCustomActivity}
                      disabled={!customActivity.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {errors.activities && (
                    <p className="text-destructive text-sm">
                      {errors.activities}
                    </p>
                  )}
                </div>

                {/* Expiry Selection */}
                <div className="space-y-3">
                  <Label className="font-medium">Link Expires In</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {EXPIRY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setExpiryDays(option.value)}
                        className={cn(
                          "p-3 rounded-xl border-2 text-center transition-all duration-200 text-sm",
                          expiryDays === option.value
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary/50"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full love-gradient text-primary-foreground py-6 text-lg rounded-xl"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  <Heart className="mr-2 h-5 w-5" fill="currentColor" />
                  {isSubmitting ? "Sending..." : "Send Valentine"}
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
