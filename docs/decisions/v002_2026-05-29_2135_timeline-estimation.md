# Decision: Timeline Estimation
# Date: 2026-05-29
# Status: Proposed → รอ confirm

---

## Context

Scope มี 10 modules (core) — 30 วันตึงเกินไปถ้าต้องมี photo + ทุกอย่างเดินได้ดี
เลือกขยายเวลาแทนตัด scope — เพื่อให้ระบบพอใจ ไม่ใช่แค่ "ทำงานได้"

---

## Estimation แบบ Realistic

### Phase 1: Foundation + Core (สัปดาห์ 1-2)

| วัน | งาน | Output |
|---|---|---|
| 1-2 | Setup project + architecture + DB schema | project structure, schema.prisma |
| 3-4 | Auth + Settings module | login, roles, configurable settings |
| 5-6 | Products & Services (CRUD + variant) | product list, categories, variants |
| 7-8 | Pricing system (tiers + custom + negotiable) | pricing logic |
| 9-10 | Stock module (input + movement + balance) | stock management |

### Phase 2: Operations (สัปดาห์ 3-4)

| วัน | งาน | Output |
|---|---|---|
| 11-12 | Customers + Vehicles (CRUD + link + search) | customer/vehicle management |
| 13-14 | Service Jobs (เปิด/ปิด/คิว/สถานะ) | job workflow |
| 15-16 | Service Jobs (test → deliver + history) | complete job flow |
| 17-18 | Photos module (upload + view + link to job) | photo management |
| 19-20 | Photos (multi-step: before/during/after) | full photo workflow |

### Phase 3: Sales + Integration (สัปดาห์ 5-6)

| วัน | งาน | Output |
|---|---|---|
| 21-22 | POS (ขาย + ออกบิล) | basic POS |
| 23-24 | POS (ชำระเงิน + VAT + discount) | complete POS |
| 25-26 | Warranty (configurable + link to job) | warranty tracking |
| 27-28 | Service History (ค้นหาทะเบียน + ลูกค้า) | history search |
| 29-30 | Integration test + bug fix | stable system |

### Phase 4: Polish + Deliver (สัปดาห์ 7)

| วัน | งาน | Output |
|---|---|---|
| 31-33 | UI polish + UX flow testing | smooth experience |
| 34-35 | Data migration support (import tool) | ready for real data |
| 36-37 | Offline local-first (sync engine) | works without internet |
| 38-40 | Photo sync + retention + final testing | production ready |

---

## สรุป

| | Timeline | Scope | Quality |
|---|---|---|---|
| ~~30 วัน~~ | ❌ ตึงเกิน | ต้องตัด photo/warranty | พอใช้ |
| **40 วัน** | ✅ แนะนำ | ครบ 10 modules + photo | ดี |
| 45 วัน | 🔷 comfortable | + offline + polish | ดีมาก |

---

## Recommendation

**40 วัน (8 สัปดาห์ทำงาน)** — ได้ทุก module + photo + ระบบเดินได้ดี

ถ้าเพิ่มอีก 5 วัน (45 วัน) → ได้ offline + photo sync + migration tool ด้วย

---

## สิ่งที่เลื่อนไป Phase 2 (หลัง launch):
- Boss approval flow (ดูรูปก่อนส่งมอบ)
- Reports/Dashboard
- Multi-tenant / SaaS features
- Advanced pricing per payment method
