# Decision: Approach Strategy
# Date: 2026-05-29
# Status: Decided

---

## Context

ต้องเลือก approach สำหรับ 3 เรื่องหลัก: offline, photo storage, product strategy

## Options Considered

### 1. Offline Strategy
| Option | Description |
|---|---|
| A: PWA + IndexedDB | browser-based offline |
| **B: Local-first (SQLite/PGlite)** ✅ | data อยู่ local จริง |
| C: Electron/Tauri | desktop app |

### 2. Photo Storage
| Option | Description |
|---|---|
| A: Cloud only | ต้องมี net |
| B: Local only | เปลือง device |
| **C: Hybrid (local → sync to server)** ✅ | local ก่อน → sync ไป hosted server, มี retention period |

### 3. Product Strategy
| Option | Description |
|---|---|
| A: SaaS multi-tenant | scale ง่าย |
| B: License per shop | ร้านเป็นเจ้าของ data |
| **C: ทำร้านแรกก่อน → productize** ✅ | แต่ออกแบบรองรับ A+B ได้ (hybrid) |

## Decision

- Offline: **B — Local-first** (SQLite/PGlite)
- Photos: **C — Hybrid** (local → sync to hosted server with retention)
- Product: **C — ร้านแรกก่อน** แต่ architecture รองรับ A+B ด้วย

## Rationale

- Local-first เพราะร้านไม่มี server + internet อาจไม่เสถียร
- Photo hybrid เพราะต้อง offline ได้ + backup ต้องมี + hosted server มี file service อยู่แล้ว
- ทำร้านแรกก่อนเพราะ deadline สำคัญกว่า scale ตอนนี้ แต่วาง architecture ให้ขยายได้

## Consequences

- ต้องเลือก local DB ที่ sync ได้ (PGlite, SQLite + sync engine)
- Photo module ต้อง handle offline queue
- Architecture ต้อง abstract tenant layer ไว้ตั้งแต่ต้น
