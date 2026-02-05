import { Suspense } from "react";
import SuccessClient from "./success-client";
import { HeartLoader } from "@/components/HeartLoader";

export default function SuccessPage() {
  return (
    <Suspense fallback={<HeartLoader message="Wrapping your Valentine..." />}>
      <SuccessClient />
    </Suspense>
  );
}
