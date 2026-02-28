"""
scheduler.py
APScheduler setup for the job scout agent.
Runs every 6 hours automatically when FastAPI starts.
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from .job_scout_agent import run_scout

scheduler = AsyncIOScheduler()


def start_scheduler() -> None:
    """Start the APScheduler with the job scout task."""
    scheduler.add_job(
        run_scout,
        IntervalTrigger(hours=6),
        id="job_scout",
        replace_existing=True,
    )
    scheduler.start()
