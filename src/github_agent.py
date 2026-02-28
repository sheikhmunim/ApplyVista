"""
github_agent.py
GitHub API functions for discovering engineers at companies mentioned in JDs.
"""

from __future__ import annotations

import os
from typing import Optional
from dotenv import load_dotenv
import requests

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
_BASE = "https://api.github.com"


def _headers() -> dict:
    h = {"Accept": "application/vnd.github+json"}
    if GITHUB_TOKEN:
        h["Authorization"] = f"token {GITHUB_TOKEN}"
    return h


def search_github_engineers(company_name: str, max_results: int = 20) -> list[dict]:
    """
    Search GitHub for users associated with a company.
    Returns a list of basic user dicts (login, html_url, etc.).
    """
    url = f"{_BASE}/search/users"
    params = {"q": f'company:"{company_name}"', "per_page": min(max_results, 30)}
    try:
        resp = requests.get(url, headers=_headers(), params=params, timeout=10)
        resp.raise_for_status()
        return resp.json().get("items", [])
    except Exception:
        return []


def get_user_details(username: str) -> dict:
    """
    Fetch detailed profile info for a GitHub user.
    Returns dict with: name, email, bio, location, company, followers, public_repos, html_url.
    """
    url = f"{_BASE}/users/{username}"
    try:
        resp = requests.get(url, headers=_headers(), timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return {
            "name": data.get("name") or "",
            "username": username,
            "email": data.get("email") or "",
            "bio": data.get("bio") or "",
            "location": data.get("location") or "",
            "company": data.get("company") or "",
            "followers": data.get("followers", 0),
            "public_repos": data.get("public_repos", 0),
            "html_url": data.get("html_url", f"https://github.com/{username}"),
        }
    except Exception:
        return {
            "name": "",
            "username": username,
            "email": "",
            "bio": "",
            "location": "",
            "company": "",
            "followers": 0,
            "public_repos": 0,
            "html_url": f"https://github.com/{username}",
        }


def get_user_top_languages(username: str, max_repos: int = 10) -> list[str]:
    """
    Aggregate programming language usage across a user's repos.
    Returns the top 3 languages by byte count.
    """
    url = f"{_BASE}/users/{username}/repos"
    params = {"per_page": max_repos, "sort": "pushed"}
    try:
        resp = requests.get(url, headers=_headers(), params=params, timeout=10)
        resp.raise_for_status()
        repos = resp.json()
    except Exception:
        return []

    lang_bytes: dict[str, int] = {}
    for repo in repos:
        lang = repo.get("language")
        if lang:
            lang_bytes[lang] = lang_bytes.get(lang, 0) + (repo.get("size", 1) or 1)

    sorted_langs = sorted(lang_bytes.items(), key=lambda x: x[1], reverse=True)
    return [lang for lang, _ in sorted_langs[:3]]


def build_engineers_list(company_name: str, max_results: int = 20) -> list[dict]:
    """
    Orchestrate GitHub search to build a rich list of engineers at a company.
    Returns list of dicts with full profile info + top languages.
    """
    users = search_github_engineers(company_name, max_results=max_results)
    engineers = []
    for user in users:
        username = user.get("login", "")
        if not username:
            continue
        details = get_user_details(username)
        details["top_languages"] = get_user_top_languages(username)
        engineers.append(details)
    return engineers
