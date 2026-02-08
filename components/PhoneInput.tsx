import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, error, onChange, value, ...props }, ref) => {
    const formatPhoneNumber = (input: string) => {
      const numbers = input.replace(/\D/g, "");
      const truncated = numbers.slice(0, 10);

      if (truncated.length <= 3) return truncated;
      if (truncated.length <= 6)
        return `(${truncated.slice(0, 3)}) ${truncated.slice(3)}`;
      return `(${truncated.slice(0, 3)}) ${truncated.slice(
        3,
        6
      )}-${truncated.slice(6)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value);
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: formatted,
        },
      };
      onChange?.(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    };

    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="numeric"
        placeholder="(071) 234-5678"
        className={cn(
          "text-lg tracking-wide",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        value={value}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";
