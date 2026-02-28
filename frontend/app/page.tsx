"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { JDInput } from "@/components/JDInput";
import { OutputTabs } from "@/components/OutputTabs";
import { processJD } from "@/lib/api";
import type { JDResult } from "@/lib/api";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JDResult | null>(null);
  const [error, setError] = useState("");

  async function handleGenerate(jdText: string) {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await processJD(jdText);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Job Application Assistant</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paste a job description to generate tailored documents and discover engineers.
        </p>
      </div>

      <JDInput onGenerate={handleGenerate} loading={loading} />

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </p>
      )}

      {loading && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex gap-2">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-24" />
            ))}
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      )}

      {result && !loading && (
        <>
          <Separator />
          <div className="flex gap-2 flex-wrap items-center">
            {result.company_name && (
              <Badge variant="default">{result.company_name}</Badge>
            )}
            {result.role_name && (
              <Badge variant="secondary">{result.role_name}</Badge>
            )}
          </div>
          <OutputTabs result={result} />
        </>
      )}
    </div>
  );
}
