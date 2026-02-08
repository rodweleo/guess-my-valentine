"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heart, HeartCrack, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FloatingHearts } from "@/components/FloatingHearts";
import { PhoneInput } from "@/components/PhoneInput";
import { Button } from "@/components/ui/button";
import { ScratchCard } from "@/components/ScratchCard";
import { DATE_ACTIVITIES } from "@/lib/valentine-config";
import { cn } from "@/lib/utils";
import { normalizeKenyanPhone } from "@/lib/helpers";

type ViewState =
  | "loading"
  | "invalid"
  | "expired"
  | "already_responded"
  | "guessing"
  | "scratch"
  | "response"
  | "confirmation";

export default function ValentineView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [viewState, setViewState] = useState<ViewState>("loading");
  const [hint, setHint] = useState<string | undefined>(undefined);
  const [activities, setActivities] = useState<string[]>([]);
  const [guess, setGuess] = useState("");
  const [guessError, setGuessError] = useState("");
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [responseSubmitted, setResponseSubmitted] = useState(false);
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      if (!id) {
        setViewState("invalid");
        return;
      }

      try {
        const res = await fetch("/api/valentine/details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ shortCode: id }),
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 404) {
            setViewState("invalid");
            return;
          }
          throw new Error("Failed to load Valentine");
        }

        const data: {
          status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
          message?: string;
          activities: string[];
        } = await res.json();

        setHint(data.message);
        setActivities(data.activities || []);

        if (data.status === "EXPIRED") {
          setViewState("expired");
        } else if (data.status === "ACCEPTED" || data.status === "DECLINED") {
          setViewState("already_responded");
        } else {
          setViewState("guessing");
        }
      } catch (err) {
        console.error(err);
        setViewState("invalid");
      }
    };

    loadDetails();
  }, [id]);

  const handleGuess = () => {
    if (!id) return;

    // const normalized = guess.replace(/\D/g, "").slice(-10);
    // if (normalized.length !== 10) {
    //   setGuessError("Please enter a valid 10-digit phone number");
    //   return;
    // }

    const submit = async () => {
      try {
        const res = await fetch("/api/valentine/guess", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shortCode: id,
            guessed_phone: normalizeKenyanPhone(guess),
          }),
        });

        if (!res.ok) {
          if (res.status === 404) {
            setViewState("invalid");
            return;
          }
          throw new Error("Failed to submit guess");
        }

        const data: { correct: boolean; remaining_attempts?: number } =
          await res.json();

        if (data.correct) {
          setViewState("scratch");
        } else {
          setWrongGuesses((prev) => prev + 1);
          setGuessError(getWrongGuessMessage(wrongGuesses + 1));
          setGuess("");

          if (
            data.remaining_attempts !== undefined &&
            data.remaining_attempts <= 0
          ) {
            setViewState("expired");
          }
        }
      } catch (err) {
        console.error(err);
        setGuessError("Something went wrong. Please try again.");
      }
    };

    submit();
  };

  const getWrongGuessMessage = (count: number): string => {
    const messages = [
      "Not quite! Try again",
      "Hmm, that's not it... Keep guessing! ",
      "So close, yet so far! Who could it be? ",
      "Nope! Think harder... ",
      "Wrong number! Maybe check your recent texts? 📱",
    ];
    return messages[Math.min(count - 1, messages.length - 1)];
  };

  const handleReveal = () => {
    if (!id) return;
    setIsRevealed(true);

    // Transition to response after animation
    setTimeout(() => {
      setViewState("response");
    }, 1500);
  };

  const handleResponse = (accept: boolean) => {
    setAccepted(accept);
    if (!accept) {
      if (id) {
        const submit = async () => {
          try {
            await fetch("/api/valentine/respond", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                shortCode: id,
                response: "NO",
                activities: [],
              }),
            });
          } catch (err) {
            console.error(err);
          } finally {
            setViewState("confirmation");
          }
        };
        submit();
      }
    }
  };

  const handleActivitySelect = (activity: string) => {
    setSelectedActivity(activity);
  };

  const handleSubmitResponse = () => {
    if (!id || selectedActivity === null) return;

    const submit = async () => {
      try {
        await fetch("/api/valentine/respond", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shortCode: id,
            response: "YES",
            activities: [selectedActivity],
          }),
        });
        setResponseSubmitted(true);
        setViewState("confirmation");
      } catch (err) {
        console.error(err);
      }
    };

    submit();
  };

  const getActivityLabel = (activityId: string): string => {
    const found = DATE_ACTIVITIES.find((a) => a.id === activityId);
    return found ? found.label : `✨ ${activityId}`;
  };

  // Render different views
  if (viewState === "loading") {
    return (
      <div className="min-h-screen romantic-gradient flex items-center justify-center">
        <Heart
          className="w-12 h-12 text-primary animate-heartbeat"
          fill="currentColor"
        />
      </div>
    );
  }

  if (viewState === "invalid") {
    return (
      <div className="min-h-screen romantic-gradient relative overflow-hidden">
        <FloatingHearts />
        <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
          <Card className="max-w-md w-full glass-card card-shadow text-center">
            <CardHeader>
              <HeartCrack className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <CardTitle className="font-serif text-2xl">
                Valentine Not Found
              </CardTitle>
              <CardDescription>
                This Valentine link is invalid or has been removed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/app/create")}
                className="love-gradient text-primary-foreground"
              >
                Create Your Own Valentine
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (viewState === "expired") {
    return (
      <div className="min-h-screen romantic-gradient relative overflow-hidden">
        <FloatingHearts />
        <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
          <Card className="max-w-md w-full glass-card card-shadow text-center">
            <CardHeader>
              <HeartCrack className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <CardTitle className="font-serif text-2xl">
                This Valentine Has Expired 💔
              </CardTitle>
              <CardDescription>
                The time to respond to this Valentine has passed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/app/create")}
                className="love-gradient text-primary-foreground"
              >
                Send Your Own Valentine
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (viewState === "already_responded") {
    return (
      <div className="min-h-screen romantic-gradient relative overflow-hidden">
        <FloatingHearts />
        <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
          <Card className="max-w-md w-full glass-card card-shadow text-center">
            <CardHeader>
              <Heart
                className="w-16 h-16 mx-auto text-primary mb-4"
                fill="currentColor"
              />
              <CardTitle className="font-serif text-2xl">
                {accepted ? "Date Confirmed! 💕" : "Response Sent"}
              </CardTitle>
              <CardDescription>
                {`This Valentine has already been responded to.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/")} variant="outline">
                Send Your Own Valentine
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (viewState === "guessing") {
    return (
      <div className="min-h-screen romantic-gradient relative overflow-hidden">
        <FloatingHearts />
        <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
          <Card className="max-w-md w-full glass-card card-shadow animate-fade-in-up">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <span className="text-6xl">😏</span>
              </div>
              <CardTitle className="font-serif text-2xl">
                Someone Sent You a Valentine!
              </CardTitle>
              <CardDescription className="text-base">
                Guess their phone number to reveal the message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hint Display */}
              {hint && (
                <div className="bg-secondary/50 rounded-xl p-4 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Hint from your admirer
                  </p>
                  <p className="text-foreground font-medium italic">"{hint}"</p>
                </div>
              )}

              {/* Phone Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Who do you think sent this?
                </label>
                <PhoneInput
                  value={guess}
                  onChange={(e) => {
                    setGuess(e.target.value);
                    setGuessError("");
                  }}
                  error={!!guessError}
                />
                {guessError && (
                  <p className="text-destructive text-sm animate-fade-in-up">
                    {guessError}
                  </p>
                )}
              </div>

              <Button
                className="w-full love-gradient text-primary-foreground py-6 text-lg rounded-xl"
                onClick={handleGuess}
              >
                <Heart className="mr-2 h-5 w-5" fill="currentColor" />
                That's My Guess!
              </Button>

              {wrongGuesses > 0 && (
                <p className="text-center text-muted-foreground text-sm">
                  Attempts: {wrongGuesses} • Keep trying! 💪
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (viewState === "scratch") {
    return (
      <div className="min-h-screen romantic-gradient relative overflow-hidden">
        <FloatingHearts />
        <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
          <div className="text-center mb-8 animate-fade-in-up">
            {/* <Sparkles className="w-8 h-8 mx-auto text-accent mb-4 animate-sparkle" /> */}
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
              You Got It Right!
            </h1>
            <p className="text-muted-foreground">
              Now scratch to reveal your Valentine's message...
            </p>
          </div>

          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <ScratchCard
              width={320}
              height={200}
              revealThreshold={60}
              onReveal={handleReveal}
              revealContent={
                <div className="w-full h-full love-gradient flex flex-col items-center justify-center text-primary-foreground p-6">
                  <Heart
                    className="w-12 h-12 mb-3 animate-heartbeat"
                    fill="currentColor"
                  />
                  <h2 className="font-serif text-2xl font-bold text-center mb-2">
                    Will You Be My Valentine?
                  </h2>
                  <p className="text-sm opacity-90">💖</p>
                </div>
              }
            />
          </div>

          {isRevealed && (
            <div className="mt-6 animate-fade-in-up">
              <p className="text-muted-foreground">
                Preparing your response...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (viewState === "response") {
    return (
      <div className="min-h-screen romantic-gradient relative overflow-hidden">
        <FloatingHearts />
        <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
          <Card className="max-w-md w-full glass-card card-shadow animate-fade-in-up">
            <CardHeader className="text-center">
              <Heart
                className="w-16 h-16 mx-auto text-primary mb-4 animate-heartbeat"
                fill="currentColor"
              />
              <CardTitle className="font-serif text-3xl">
                Will You Be My Valentine &#128513; ?
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Your answer will make someone very happy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {accepted === null ? (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleResponse(true)}
                    className="py-8 text-xl love-gradient text-primary-foreground rounded-xl"
                  >
                    YES &#128522;
                  </Button>
                  <Button
                    onClick={() => handleResponse(false)}
                    variant="outline"
                    className="py-8 text-xl rounded-xl"
                  >
                    NO &#128542;
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-center font-medium text-foreground">
                    Pick a date activity! 🎉
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {activities.map((activity) => {
                      const predefined = DATE_ACTIVITIES.find(
                        (a) => a.id === activity
                      );
                      const label = predefined
                        ? predefined.label
                        : `✨ ${activity}`;
                      const emoji = predefined?.emoji || "✨";

                      return (
                        <button
                          key={activity}
                          onClick={() => handleActivitySelect(activity)}
                          className={cn(
                            "p-4 rounded-xl border-2 text-left transition-all duration-200",
                            "hover:scale-[1.02] active:scale-[0.98]",
                            selectedActivity === activity
                              ? "border-primary bg-primary/10"
                              : "border-border bg-card hover:border-primary/50"
                          )}
                        >
                          <span className="text-2xl block mb-1">{emoji}</span>
                          <span className="text-sm font-medium">
                            {label.replace(emoji + " ", "")}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    onClick={handleSubmitResponse}
                    disabled={!selectedActivity}
                    className="w-full love-gradient text-primary-foreground py-6 text-lg rounded-xl"
                  >
                    <Heart className="mr-2 h-5 w-5" fill="currentColor" />
                    Confirm My Choice
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (viewState === "confirmation") {
    return (
      <div className="min-h-screen romantic-gradient relative overflow-hidden">
        <FloatingHearts />
        <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
          <Card className="max-w-md w-full glass-card card-shadow animate-fade-in-up text-center">
            <CardHeader>
              {accepted ? (
                <>
                  <div className="relative mx-auto mb-4">
                    <div className="w-24 h-24 rounded-full love-gradient flex items-center justify-center">
                      <Heart
                        className="w-12 h-12 text-primary-foreground animate-heartbeat"
                        fill="currentColor"
                      />
                    </div>
                    <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-accent animate-sparkle" />
                  </div>
                  <CardTitle className="font-serif text-3xl">
                    It's a Date! 💕
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Your Valentine has been notified. Get ready for{" "}
                    {selectedActivity && getActivityLabel(selectedActivity)}!
                  </CardDescription>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-4 text-6xl">💔</div>
                  <CardTitle className="font-serif text-2xl">
                    Maybe Next Time
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Your response has been sent. We hope you find your Valentine
                    someday!
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/app/create")}
                variant="outline"
                className="w-full"
              >
                Send Your Own Valentine
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
