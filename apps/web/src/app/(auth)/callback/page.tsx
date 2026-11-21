"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 1000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Card className="text-center p-8">
      <CardContent className="space-y-4">
        <div className="animate-spin text-3xl">⏳</div>
        <p className="text-sm font-medium">Verifying authentication token and permissions...</p>
      </CardContent>
    </Card>
  );
}
