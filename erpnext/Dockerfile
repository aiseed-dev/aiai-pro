# syntax=docker/dockerfile:1
# ERPNext in Japanese for aiai tools: the official image, the Noto CJK fonts
# for PDFs (fonts-noto-cjk of Debian, OFL-1.1), and erpnext_jp_core from
# maihatch/erpnext-ja-starter (MIT), which brings a ja.csv translation and
# a few fields for the invoice system. Clone the starter next to this file,
# at the commit named in SKILL.md, and read it before building.
# Sample only: has not been run yet (2026-09-29).

ARG ERPNEXT_VERSION=v16.36.1

FROM frappe/erpnext:${ERPNEXT_VERSION}

USER root
RUN apt-get update \
    && apt-get install -y --no-install-recommends fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

USER frappe
WORKDIR /home/frappe/frappe-bench
COPY --chown=frappe:frappe erpnext-ja-starter ./apps/erpnext_jp_core
RUN ./env/bin/pip install --no-cache-dir -e ./apps/erpnext_jp_core
