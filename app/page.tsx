import Link from "next/link";
import { Heart, Send, Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingHearts } from "@/components/FloatingHearts";

const Index = () => {
  return (
    <div className="min-h-screen romantic-gradient relative overflow-hidden">
      <FloatingHearts />

      <div className="relative z-10 container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
          {/* Decorative Heart */}
          <div className="mb-8 relative inline-block">
            <Heart
              className="w-20 h-20 text-primary animate-heartbeat"
              fill="currentColor"
            />
            {/* <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-accent animate-sparkle" /> */}
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-8xl font-serif font-bold text-foreground mb-4 leading-tight">
            Send a Secret
            <span className="block text-primary">Valentine</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground font-body mb-8 max-w-lg mx-auto leading-relaxed">
            Create a magical guessing game for your special someone. They'll
            have to guess who sent it before revealing your message.
          </p>

          {/* CTA Button */}
          <Link href="/app/create">
            <Button
              size="lg"
              className="love-gradient text-primary-foreground text-lg px-8 py-6 rounded-full romantic-shadow hover:scale-105 transition-transform duration-300"
            >
              {/* <Send className="mr-2 h-5 w-5" /> */}
              Send a Valentine
            </Button>
          </Link>
        </div>

        {/* How It Works Section */}
        <div
          className="mt-20 w-full max-w-4xl animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <h2 className="text-3xl font-serif font-semibold text-center text-foreground mb-10">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8 place-items-center">
            {/* Step 1 */}
            <div className="glass-card rounded-2xl p-6 card-shadow">
              <div className="size-14 text-3xl gold-gradient rounded-full flex items-center justify-center mb-4">
                {/* <Send className="w-6 h-6 text-primary-foreground" /> */}
                &#128527;
              </div>
              <h3 className="font-serif font-semibold text-lg mb-2">
                Create & Send
              </h3>
              <p className="text-muted-foreground text-sm">
                Write your Valentine, pick date ideas, and get a secret link to
                share
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card rounded-2xl p-6 card-shadow">
              <div className="size-14 text-3xl gold-gradient rounded-full flex items-center justify-center mb-4">
                {/* <Send className="w-6 h-6 text-primary-foreground" /> */}
                &#129300;
              </div>
              <h3 className="font-serif font-semibold text-lg mb-2">
                Guess the Sender
              </h3>
              <p className="text-muted-foreground text-sm">
                They must guess your phone number to unlock the surprise
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card rounded-2xl p-6 card-shadow">
              <div className="size-14 text-3xl gold-gradient rounded-full flex items-center justify-center mb-4">
                {/* <Send className="w-6 h-6 text-primary-foreground" /> */}
                &#128517;
              </div>
              <h3 className="font-serif font-semibold text-lg mb-2">
                Reveal & Respond
              </h3>
              <p className="text-muted-foreground text-sm">
                Scratch to reveal the message and pick a date together
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} | Made with 💕 for 💕</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
