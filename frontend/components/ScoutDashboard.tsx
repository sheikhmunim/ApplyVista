"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getScoutJobs, getScoutStatus, runScout } from "@/lib/api";
import type { ScoutJob, ScoutStatus } from "@/lib/api";

function formatRelative(isoString: string | null): string {
  if (!isoString) return "Never";
  const diff = Date.now() - new Date(isoString).getTime();
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m ago`;
  return `${mins}m ago`;
}

function formatFuture(isoString: string | null): string {
  if (!isoString) return "Unknown";
  const diff = new Date(isoString).getTime() - Date.now();
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (diff <= 0) return "Soon";
  if (hours > 0) return `in ${hours}h ${mins}m`;
  return `in ${mins}m`;
}

export function ScoutDashboard() {
  const [status, setStatus] = useState<ScoutStatus | null>(null);
  const [jobs, setJobs] = useState<ScoutJob[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<string>("");

  async function loadData() {
    try {
      const [s, j] = await Promise.all([getScoutStatus(), getScoutJobs()]);
      setStatus(s);
      setJobs(j.jobs);
    } catch {
      // ignore
    } finally {
      setLoadingStatus(false);
      setLoadingJobs(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleRunNow() {
    setRunning(true);
    setRunResult("");
    try {
      const res = await runScout();
      setRunResult(`Found ${res.new_jobs_count} new job(s). Total: ${res.total_jobs_count}`);
      await loadData();
    } catch {
      setRunResult("Scout run failed. Check backend logs.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Status card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scout Status</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStatus ? (
            <div className="flex gap-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 text-sm">
              <span>
                <span className="text-muted-foreground">Last run: </span>
                {formatRelative(status?.last_run ?? null)}
              </span>
              <span>
                <span className="text-muted-foreground">Next run: </span>
                {formatFuture(status?.next_run ?? null)}
              </span>
              <span>
                <span className="text-muted-foreground">Total jobs: </span>
                <strong>{status?.total_jobs ?? 0}</strong>
              </span>
              <Badge variant={status?.scheduler_running ? "default" : "secondary"}>
                {status?.scheduler_running ? "Scheduler active" : "Scheduler off"}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={handleRunNow} disabled={running}>
          {running ? "Searching..." : "Search Now"}
        </Button>
        {runResult && <p className="text-sm text-muted-foreground">{runResult}</p>}
      </div>

      {/* Jobs table */}
      {loadingJobs ? (
        <div className="flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No jobs found yet. Click &quot;Search Now&quot; to run the scout.
        </p>
      ) : (
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-sm">{job.Title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{job.Company || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={
                      (job["Fit Score"] ?? 0) >= 60
                        ? "default"
                        : (job["Fit Score"] ?? 0) >= 30
                        ? "secondary"
                        : "outline"
                    }>
                      {job["Fit Score"] ?? 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground capitalize">{job.Source}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{job["Date Found"]}</TableCell>
                  <TableCell>
                    {job.URL && (
                      <a
                        href={job.URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {job.Status ?? "New"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
