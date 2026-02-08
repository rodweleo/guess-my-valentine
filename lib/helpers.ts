export const normalizeKenyanPhone = (phone: string): string | null => {
  // Remove spaces, dashes, etc.
  const digits = phone.replace(/\D/g, "");

  // Case 1: 07XXXXXXXX or 01XXXXXXXX
  if (
    digits.length === 10 &&
    (digits.startsWith("07") || digits.startsWith("01"))
  ) {
    return "+254" + digits.slice(1);
  }

  // Case 2: 7XXXXXXXX or 1XXXXXXXX
  if (
    digits.length === 9 &&
    (digits.startsWith("7") || digits.startsWith("1"))
  ) {
    return "+254" + digits;
  }

  // Case 3: 2547XXXXXXXX or 2541XXXXXXXX
  if (
    digits.length === 12 &&
    (digits.startsWith("2547") || digits.startsWith("2541"))
  ) {
    return `+${digits}`;
  }

  return null; // Invalid
};
