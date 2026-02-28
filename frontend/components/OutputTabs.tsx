"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocTab } from "./DocTab";
import { EngineersTable } from "./EngineersTable";
import type { JDResult } from "@/lib/api";

interface OutputTabsProps {
  result: JDResult;
}

const DOC_TABS = [
  { key: "skills", label: "Skills" },
  { key: "cover", label: "Cover Letter" },
  { key: "emails", label: "Emails" },
  { key: "ats", label: "ATS Summary" },
  { key: "top_choice", label: "Top Choice" },
  { key: "short_recruiter_email", label: "Recruiter Email" },
] as const;

export function OutputTabs({ result }: OutputTabsProps) {
  const availableTabs = DOC_TABS.filter(
    (t) => result[t.key as keyof JDResult]
  );

  return (
    <Tabs defaultValue={availableTabs[0]?.key ?? "engineers"} className="w-full">
      <TabsList className="flex flex-wrap h-auto gap-1 mb-4">
        {availableTabs.map((t) => (
          <TabsTrigger key={t.key} value={t.key}>
            {t.label}
          </TabsTrigger>
        ))}
        <TabsTrigger value="engineers">Engineers</TabsTrigger>
      </TabsList>

      {availableTabs.map((t) => (
        <TabsContent key={t.key} value={t.key}>
          <DocTab initialText={(result[t.key as keyof JDResult] as string) ?? ""} />
        </TabsContent>
      ))}

      <TabsContent value="engineers">
        <EngineersTable
          engineers={result.engineers ?? []}
          excelFilename={result.excel_filename ?? ""}
          companyName={result.company_name ?? ""}
        />
      </TabsContent>
    </Tabs>
  );
}
