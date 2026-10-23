# Omnichannel Growth Lab / 全渠道增长工作台

[Open bilingual dashboard / 打开双语看板](https://milanchen0307-cmyk.github.io/omnichannel-growth-lab/)

An interactive portfolio demonstration of turning a broad digital-adoption question into five decisions: **WHO, WHEN, WHAT, WHERE, HOW**. The methodology is inspired by an industry-sponsored academic capstone. This repository is a new, independently implemented public demonstration, not the original client delivery or production system.

本项目展示如何将线上采用目标拆解为客户优先级、触达时机、内容假设、渠道选择与试点规划。公开版本重新实现交互与规则，使用完全独立生成的虚构数据，不包含企业原始数据、内部分析结果或原始交付代码。

## Explore

- Filter by segment, region, channel and minimum score. All views share the audience filter.
- Inspect ranked customers, transparent scoring components and segment-specific messaging hypotheses.
- Compare consented versus non-consented customers by preferred channel.
- Explore a weekday × time-window heatmap of fictional customer preferences.
- Change budget, capacity and assumed response range in the pilot planner.
- Export the full filtered **consented** audience as CSV; the on-screen table shows only the top 12.
- Switch Chinese / English without resetting filter state.

## Data provenance

`scripts/generate_data.py` uses only Python's seeded random generator and constants defined in that file. It does not read any company datasets, learn distributions from private records, or anonymize real customers. All 1,200 records, preferences, consent flags, scoring weights and unit costs are invented demonstration inputs. They are not evidence of achieved business outcomes. Synthetic preferences describe activity windows, not message response rates.

Seed: `20261023`. Each ID begins with `DEMO-`. One record represents one fictional customer with one preferred channel. The data contains no names, addresses, phone numbers or email addresses.

| Field | Definition |
|---|---|
| `segment` | Fictional repeat-shopper, digital-explorer or reactivation cohort |
| `region` | Fictional north, central or south region |
| `channel`, `consent` | Preferred channel and fictional permission flag |
| `recency`, `visits` | Days since purchase and illustrative purchase frequency |
| `readiness`, `score` | 0–100 digital readiness and derived rounded priority |
| `weekday` | 0 = Monday through 6 = Sunday |
| `period` | 0–3: 08–12, 12–16, 16–20, 20–24; no overnight preference is modeled |

The pilot CSV is separate from the full eligible-audience CSV. Both include consent and per-contact cost. The pilot export contains only the budget-selected contacts.

## Methods

Priority is an illustrative rule, not a fitted propensity model:

```text
recency_component = max(0, 100 - recency_days / 1.8)
frequency_component = min(100, visits * 5)
priority = round(0.4 * recency_component
               + 0.3 * frequency_component
               + 0.3 * digital_readiness)
```

The planner removes non-consented customers, sorts descending by priority (ID breaks ties), and greedily adds affordable contacts until capacity or available candidates are exhausted. It prioritizes rank, not mathematically optimal ROI. Unit costs are email `0.2`, SMS `0.5`, app `0.1` in arbitrary demo budget units. If one contact is unaffordable, a later cheaper contact may still be included.

Assumed responses are contact count multiplied by user-entered response-rate bounds. These are scenario endpoints, **not confidence intervals, predictions, or measured incremental conversions**. The next-step randomized holdout design described in the UI is a proposal; this repository does not execute an experiment.

## Run locally

No frontend build or external runtime dependencies are needed. Python 3 generates data and serves the site; Node runs the optional calculation tests.

```sh
python scripts/generate_data.py
python -m unittest discover -s tests
node tests/engine.test.js
python -m http.server 8000 --directory docs
```

Open `http://localhost:8000`. Do not open the HTML directly via `file://`, because the browser fetches `data.json`.

## Repository

| Path | Purpose |
|---|---|
| `docs/index.html` | Bilingual page structure |
| `docs/style.css` | Responsive dashboard styling |
| `docs/app.js` | Filtering, charts, inspection, export and language switching |
| `docs/engine.js` | Shared selection and budget-planning calculations |
| `docs/data.json` | Reproducible synthetic records |
| `scripts/generate_data.py` | Independent synthetic-data generator |
| `tests/` | Reproducibility and planning checks |

GitHub Pages serves `/docs` from `main`. There is no login, backend, tracking or paid API requirement.
