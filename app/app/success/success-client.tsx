"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Heart,
  Copy,
  Share2,
  Check,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FloatingHearts } from "@/components/FloatingHearts";
import Link from "next/link";

export default function SuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/");
      return;
    }

    setShareLink(`${window.location.origin}/v/${token}`);
  }, [router, token]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "You received a Valentine! 💝",
        text: "Someone sent you a secret Valentine! Open to find out who...",
        url: shareLink,
      });
    } else {
      handleCopy();
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen romantic-gradient relative overflow-hidden">
      <FloatingHearts />

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
        <Card className="max-w-md w-full glass-card card-shadow animate-fade-in-up text-center">
          <CardHeader>
            <div className="relative mx-auto mb-4">
              <div className="w-24 h-24 rounded-full love-gradient flex items-center justify-center animate-heartbeat">
                <Heart
                  className="w-12 h-12 text-primary-foreground"
                  fill="currentColor"
                />
              </div>
            </div>

            <CardTitle className="font-serif text-3xl">
              Your Valentine is Ready!
            </CardTitle>
            <CardDescription>
              Share the link below with your special someone
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Share Link */}
            <div className="bg-secondary/50 rounded-xl p-4 space-y-4 ">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">
                Your Secret Link
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-background rounded-lg px-3 py-2 truncate border">
                  {shareLink}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleCopy} variant="outline" className="py-6">
                  {copied ? (
                    <>
                      {" "}
                      <Check className="mr-2 h-5 w-5 text-green-600" /> Copied!{" "}
                    </>
                  ) : (
                    <>
                      {" "}
                      <Copy className="mr-2 h-5 w-5" /> Copy Link{" "}
                    </>
                  )}
                </Button>{" "}
                <Button
                  onClick={handleShare}
                  className="love-gradient text-primary-foreground py-6"
                >
                  <Share2 className="mr-2 h-5 w-5" /> Share{" "}
                </Button>{" "}
              </div>{" "}
              {/* Preview Link */}
              <Link
                href={`/app/v/${token}`}
                className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
              >
                <ExternalLink className="h-4 w-4" /> Preview how it looks{" "}
              </Link>{" "}
              {/* Instructions */}
              <div className="bg-blush rounded-xl p-4 text-left space-y-2">
                <p className="font-semibold text-sm text-foreground">
                  {" "}
                  What happens next?{" "}
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-decimal ml-4">
                  <li>Share this link with your Valentine</li>
                  <li>They'll try to guess your phone number</li>
                  <li>Once guessed, they'll reveal your message</li>
                  <li>You'll be notified of their response!</li>
                </ul>
              </div>{" "}
              {/* Back Home */}
              <Link href="/">
                <Button variant="link" className="w-full">
                  {" "}
                  Send Another Valentine{" "}
                </Button>{" "}
              </Link>{" "}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
