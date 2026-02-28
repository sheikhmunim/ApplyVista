"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { downloadDocx, downloadPdf } from "@/lib/api";

interface DocTabProps {
  initialText: string;
}

export function DocTab({ initialText }: DocTabProps) {
  const [text, setText] = useState(initialText);
  const [loadingDocx, setLoadingDocx] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError] = useState("");

  async function handleDownload(type: "docx" | "pdf") {
    setError("");
    if (type === "docx") {
      setLoadingDocx(true);
      try {
        await downloadDocx(text);
      } catch {
        setError("Failed to download DOCX");
      } finally {
        setLoadingDocx(false);
      }
    } else {
      setLoadingPdf(true);
      try {
        await downloadPdf(text);
      } catch {
        setError("Failed to download PDF");
      } finally {
        setLoadingPdf(false);
      }
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[320px] font-mono text-sm resize-y"
      />
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={loadingDocx}
          onClick={() => handleDownload("docx")}
        >
          {loadingDocx ? "Generating..." : "Download DOCX"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={loadingPdf}
          onClick={() => handleDownload("pdf")}
        >
          {loadingPdf ? "Generating..." : "Download PDF"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
