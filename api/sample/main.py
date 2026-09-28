# SPDX-License-Identifier: AGPL-3.0-or-later
"""A small FastAPI service that trusts PocketBase for who the person is.

    conda install -c conda-forge fastapi uvicorn httpx
    POCKETBASE_URL=http://127.0.0.1:8090 uvicorn main:app --host 127.0.0.1 --port 8400

Every request carries "Authorization: <token>" as PocketBase issues it. The
service asks PocketBase to refresh the token (introspection) and keeps the
answer for a short while, so PocketBase is not asked on every call. What the
person may do is decided here, not in PocketBase.

This is a working example to rebuild, not a verified part. It has not been
run yet in this repository (2026-09-28): the packages are not installed here.
"""
import os
import time

import httpx
from fastapi import Depends, FastAPI, Header, HTTPException

POCKETBASE_URL = os.environ.get("POCKETBASE_URL", "http://127.0.0.1:8090")
COLLECTION = os.environ.get("POCKETBASE_COLLECTION", "users")
CACHE_SECONDS = 60

app = FastAPI(title="aiai pro sample API")
_cache: dict[str, tuple[float, dict]] = {}


def verify_token(authorization: str = Header(default="")) -> dict:
    """Returns the PocketBase record of the signed-in person, or 401."""
    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(401, "sign in first")
    hit = _cache.get(token)
    if hit and hit[0] > time.monotonic():
        return hit[1]
    r = httpx.post(f"{POCKETBASE_URL}/api/collections/{COLLECTION}/auth-refresh",
                   headers={"Authorization": token}, timeout=5)
    if r.status_code != 200:
        raise HTTPException(401, "token not accepted")
    record = r.json()["record"]
    _cache[token] = (time.monotonic() + CACHE_SECONDS, record)
    return record


@app.get("/api/me")
def me(user: dict = Depends(verify_token)):
    """Who am I: only the id and the verified email, nothing else."""
    return {"id": user["id"], "email": user.get("email")}


@app.get("/api/orders")
def orders(user: dict = Depends(verify_token)):
    """Example: the permission is decided here, per person, before any data.

    Replace the list with a query on the PostgreSQL of dodai/ and a rule
    the company gave you (who may see which orders), written down in the
    specification first.
    """
    if not can_read_orders(user["id"]):
        raise HTTPException(403, "not allowed")
    return {"orders": []}


def can_read_orders(user_id: str) -> bool:
    """The company's rule goes here. Deny until the rule is written."""
    return False
