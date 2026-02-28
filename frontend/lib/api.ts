const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface JDOptions {
  generate_skills?: boolean;
  generate_cover?: boolean;
  generate_emails?: boolean;
  generate_ats?: boolean;
  generate_top_choice?: boolean;
  generate_short_recruiter_email?: boolean;
}

export interface Engineer {
  name: string;
  username: string;
  html_url: string;
  email: string;
  bio: string;
  location: string;
  top_languages: string[];
  followers: number;
  public_repos: number;
}

export interface JDResult {
  skills?: string;
  cover?: string;
  emails?: string;
  ats?: string;
  top_choice?: string;
  short_recruiter_email?: string;
  company_name?: string;
  role_name?: string;
  engineers?: Engineer[];
  excel_filename?: string;
  error?: string;
}

export interface ScoutJob {
  Title?: string;
  Company?: string;
  URL?: string;
  "Fit Score"?: number;
  Source?: string;
  "Date Found"?: string;
  Status?: string;
}

export interface ScoutStatus {
  last_run: string | null;
  next_run: string | null;
  total_jobs: number;
  scheduler_running: boolean;
}

export async function processJD(jd_text: string, options: JDOptions = {}): Promise<JDResult> {
  const resp = await fetch(`${API_BASE}/jd`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jd_text, options }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: resp.statusText }));
    throw new Error(err.detail || "Failed to process JD");
  }
  return resp.json();
}

export async function downloadDocx(text: string): Promise<void> {
  const resp = await fetch(`${API_BASE}/export/docx`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!resp.ok) throw new Error("Failed to generate DOCX");
  const blob = await resp.blob();
  triggerDownload(blob, "document.docx");
}

export async function downloadPdf(text: string): Promise<void> {
  const resp = await fetch(`${API_BASE}/export/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!resp.ok) throw new Error("Failed to generate PDF");
  const blob = await resp.blob();
  triggerDownload(blob, "document.pdf");
}

export async function downloadExcel(filename: string): Promise<void> {
  const resp = await fetch(`${API_BASE}/download/${encodeURIComponent(filename)}`);
  if (!resp.ok) throw new Error("File not found");
  const blob = await resp.blob();
  triggerDownload(blob, filename);
}

export async function getScoutJobs(): Promise<{ jobs: ScoutJob[]; total: number }> {
  const resp = await fetch(`${API_BASE}/scout/jobs`);
  if (!resp.ok) throw new Error("Failed to fetch scout jobs");
  return resp.json();
}

export async function getScoutStatus(): Promise<ScoutStatus> {
  const resp = await fetch(`${API_BASE}/scout/status`);
  if (!resp.ok) throw new Error("Failed to fetch scout status");
  return resp.json();
}

export async function runScout(): Promise<{ new_jobs_count: number; total_jobs_count: number; timestamp: string }> {
  const resp = await fetch(`${API_BASE}/scout/run`, { method: "POST" });
  if (!resp.ok) throw new Error("Scout run failed");
  return resp.json();
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
