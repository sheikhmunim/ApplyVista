import { ScoutDashboard } from "@/components/ScoutDashboard";

export default function ScoutPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Job Scout</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Automatically searches LinkedIn and Seek every 6 hours for relevant roles.
        </p>
      </div>
      <ScoutDashboard />
    </div>
  );
}
