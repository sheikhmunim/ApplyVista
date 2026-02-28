"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { downloadExcel } from "@/lib/api";
import type { Engineer } from "@/lib/api";

interface EngineersTableProps {
  engineers: Engineer[];
  excelFilename: string;
  companyName: string;
}

export function EngineersTable({ engineers, excelFilename, companyName }: EngineersTableProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDownload() {
    if (!excelFilename) return;
    setLoading(true);
    setError("");
    try {
      await downloadExcel(excelFilename);
    } catch {
      setError("Failed to download Excel file");
    } finally {
      setLoading(false);
    }
  }

  if (engineers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No engineers found for &quot;{companyName}&quot;.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {engineers.length} engineer{engineers.length !== 1 ? "s" : ""} found at {companyName}
        </p>
        {excelFilename && (
          <Button variant="outline" size="sm" disabled={loading} onClick={handleDownload}>
            {loading ? "Downloading..." : "Download Excel"}
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>GitHub</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Languages</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Repos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {engineers.map((eng) => (
              <TableRow key={eng.username}>
                <TableCell className="font-medium">
                  {eng.name || eng.username}
                </TableCell>
                <TableCell>
                  <a
                    href={eng.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    @{eng.username}
                  </a>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {eng.email || "—"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {eng.top_languages?.map((lang) => (
                      <Badge key={lang} variant="secondary" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {eng.location || "—"}
                </TableCell>
                <TableCell className="text-right text-sm">{eng.public_repos}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
