"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface JDInputProps {
  onGenerate: (jdText: string) => void;
  loading: boolean;
}

export function JDInput({ onGenerate, loading }: JDInputProps) {
  const [jdText, setJdText] = useState("");

  function handleSubmit() {
    if (!jdText.trim() || loading) return;
    onGenerate(jdText);
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        placeholder="Paste the job description here..."
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        className="min-h-[200px] resize-y text-sm"
        disabled={loading}
      />
      <Button
        onClick={handleSubmit}
        disabled={loading || jdText.trim().length < 30}
        className="self-start"
      >
        {loading ? "Generating..." : "Generate Documents"}
      </Button>
    </div>
  );
}
