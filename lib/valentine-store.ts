// Valentine data store using localStorage (frontend-only solution)

export interface Valentine {
  id: string;
  senderPhone: string; // Stored as hash in real app
  receiverPhone: string; // Stored as hash in real app
  hint?: string;
  activities: string[];
  expiresAt: string; // ISO date string
  status: "pending" | "revealed" | "accepted" | "declined";
  response?: {
    accepted: boolean;
    chosenActivity?: string;
    respondedAt: string;
  };
  createdAt: string;
}

export interface OTPSession {
  phone: string;
  code: string;
  valentineData: Omit<Valentine, "id" | "status" | "createdAt">;
  expiresAt: number;
}

const STORAGE_KEY = "valentines";
const OTP_KEY = "otp_session";

// Generate a simple token for the URL
export function generateToken(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Simple hash function (not cryptographically secure, just for demo)
export function hashPhone(phone: string): string {
  let hash = 0;
  for (let i = 0; i < phone.length; i++) {
    const char = phone.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Normalize phone number for comparison
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

// Get all valentines
export function getValentines(): Valentine[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Get valentine by ID
export function getValentine(id: string): Valentine | null {
  const valentines = getValentines();
  return valentines.find((v) => v.id === id) || null;
}

// Save valentine
export function saveValentine(valentine: Valentine): void {
  const valentines = getValentines();
  const index = valentines.findIndex((v) => v.id === valentine.id);
  if (index >= 0) {
    valentines[index] = valentine;
  } else {
    valentines.push(valentine);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(valentines));
}

// Create OTP session
export function createOTPSession(
  phone: string,
  valentineData: Omit<Valentine, "id" | "status" | "createdAt">
): string {
  const code = generateOTP();
  const session: OTPSession = {
    phone: normalizePhone(phone),
    code,
    valentineData,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  };
  localStorage.setItem(OTP_KEY, JSON.stringify(session));

  // Log OTP to console for testing
  console.log("📱 Mock SMS sent!");
  console.log(`Your Valentine OTP code is: ${code}`);
  console.log("(This would be sent via SMS in production)");

  return code;
}

// Verify OTP and create valentine
export function verifyOTP(code: string): Valentine | null {
  const sessionData = localStorage.getItem(OTP_KEY);
  if (!sessionData) return null;

  const session: OTPSession = JSON.parse(sessionData);

  if (Date.now() > session.expiresAt) {
    localStorage.removeItem(OTP_KEY);
    return null;
  }

  if (session.code !== code) {
    return null;
  }

  // Create the valentine
  const valentine: Valentine = {
    id: generateToken(),
    ...session.valentineData,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  saveValentine(valentine);
  //   localStorage.removeItem(OTP_KEY);

  // Log "SMS" notification
  console.log("💌 Valentine created successfully!");
  console.log(`Share this link: ${window.location.origin}/v/${valentine.id}`);

  return valentine;
}

// Get current OTP session phone (for display)
export function getOTPSessionPhone(): string | null {
  const sessionData = localStorage.getItem(OTP_KEY);
  if (!sessionData) return null;
  const session: OTPSession = JSON.parse(sessionData);
  return session.phone;
}

// Check if valentine is expired
export function isExpired(valentine: Valentine): boolean {
  return new Date(valentine.expiresAt) < new Date();
}

// Validate receiver's guess
export function validateGuess(
  valentineId: string,
  guessPhone: string
): boolean {
  const valentine = getValentine(valentineId);
  if (!valentine) return false;

  const normalizedGuess = normalizePhone(guessPhone);
  const normalizedSender = normalizePhone(valentine.senderPhone);

  return normalizedGuess === normalizedSender;
}

// Update valentine status after correct guess
export function markAsRevealed(valentineId: string): void {
  const valentine = getValentine(valentineId);
  if (valentine) {
    valentine.status = "revealed";
    saveValentine(valentine);
  }
}

// Submit receiver's response
export function submitResponse(
  valentineId: string,
  accepted: boolean,
  chosenActivity?: string
): void {
  const valentine = getValentine(valentineId);
  if (valentine) {
    valentine.status = accepted ? "accepted" : "declined";
    valentine.response = {
      accepted,
      chosenActivity,
      respondedAt: new Date().toISOString(),
    };
    saveValentine(valentine);

    // Log "notification" to sender
    console.log("💝 Response received!");
    if (accepted) {
      console.log(`They said YES! 🎉 Chosen activity: ${chosenActivity}`);
    } else {
      console.log("They declined this time 💔");
    }
    console.log(
      "(In production, the sender would receive an SMS notification)"
    );
  }
}

// NOTE: This file contains a legacy localStorage-based implementation that has
// been replaced by real API routes backed by a database. The UI now uses
// server APIs for all operations instead of these mock helpers. Shared
// configuration such as activities and expiry options lives in
// `lib/valentine-config.ts`.
