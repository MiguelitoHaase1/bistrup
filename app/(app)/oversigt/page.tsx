import { Suspense } from "react";
import HomeContent from "@/components/HomeContent";

export default function OversigtPage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
