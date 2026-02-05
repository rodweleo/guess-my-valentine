import { useRef, useEffect, useState, useCallback } from "react";

interface ScratchCardProps {
  width?: number;
  height?: number;
  coverImage?: string;
  revealContent: React.ReactNode;
  onReveal?: () => void;
  revealThreshold?: number;
}

export function ScratchCard({
  width = 300,
  height = 200,
  coverImage,
  revealContent,
  onReveal,
  revealThreshold = 60,
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const drawCover = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create romantic gradient cover
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#e8b4b8"); // Soft pink
    gradient.addColorStop(0.5, "#d4a5a5"); // Rose
    gradient.addColorStop(1, "#c9a0dc"); // Light purple

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add hearts pattern
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.font = "24px serif";

    for (let i = 0; i < 15; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.fillText("💕", x, y);
    }

    // Add scratch text
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "italic 20px Playfair Display, serif";
    ctx.textAlign = "center";
    ctx.fillText("Scratch to reveal...", width / 2, height / 2);

    ctx.font = "14px Lora, serif";
    ctx.fillText("✨ Use your finger or mouse ✨", width / 2, height / 2 + 30);
  }, [width, height]);

  useEffect(() => {
    drawCover();
  }, [drawCover]);

  const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const scratch = (pos: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();

    if (lastPos.current) {
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.lineWidth = 40;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
    ctx.fill();

    lastPos.current = pos;

    // Check reveal percentage
    checkRevealPercentage();
  };

  const checkRevealPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    const total = pixels.length / 4;

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 128) {
        transparent++;
      }
    }

    const percentage = (transparent / total) * 100;

    if (percentage >= revealThreshold) {
      setIsRevealed(true);
      onReveal?.();
    }
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isRevealed) return;
    e.preventDefault();
    setIsScratching(true);
    lastPos.current = getPosition(e);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isScratching || isRevealed) return;
    e.preventDefault();
    scratch(getPosition(e));
  };

  const handleEnd = () => {
    setIsScratching(false);
    lastPos.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden card-shadow"
      style={{ width, height }}
    >
      {/* Reveal Content */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
          isRevealed ? "opacity-100" : "opacity-100"
        }`}
      >
        {revealContent}
      </div>

      {/* Scratch Canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`absolute inset-0 touch-none cursor-pointer transition-opacity duration-500 ${
          isRevealed ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />

      {/* Revealed overlay effect */}
      {isRevealed && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent animate-fade-in-up" />
        </div>
      )}
    </div>
  );
}
