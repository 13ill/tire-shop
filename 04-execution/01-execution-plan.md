# Execution Plan — แผนการทำงาน
# ใช้เมื่อ: ผ่าน Gate 1-4 แล้ว พร้อมลงมือทำ → ต้องแบ่งงานเป็นขั้นตอน
# หลัก: แบ่ง task ให้เล็กพอจะทำจบใน 2-4 ชั่วโมง

---

## Template: Execution Plan

### Project/Feature: _______________

### สรุป Scope
```
ทำอะไร: _______________
ไม่ทำอะไร: _______________
MVP (เวอร์ชันแรก): _______________
```

### Task Breakdown

| # | Task | ประเมินเวลา | Priority | Dependencies (ต้องทำอะไรก่อน) | Status |
|---|---|---|---|---|---|
| 1 | | | P1/P2/P3 | - | ⬜ |
| 2 | | | | Task 1 | ⬜ |
| 3 | | | | Task 1 | ⬜ |
| 4 | | | | Task 2, 3 | ⬜ |
| 5 | | | | | ⬜ |

Status: ⬜ ยังไม่เริ่ม | 🔄 กำลังทำ | ✅ เสร็จ | ❌ ยกเลิก

### ลำดับการทำ (Execution Order)

```
Phase 1 (MVP):
  Task 1 → Task 2 → Task 3

Phase 2 (Enhancement):
  Task 4 → Task 5
```

### Risk / Blockers ที่อาจเจอ

| # | Risk/Blocker | ถ้าเจอจะทำยังไง |
|---|---|---|
| 1 | | |
| 2 | | |

---

## ตัวอย่าง: ระบบ Stock MVP

### สรุป Scope
```
ทำ: CRUD product + stock movement (เข้า/ออก) + ดู stock คงเหลือ
ไม่ทำ: report, alert, multi-warehouse, barcode scan
MVP: เพิ่ม/ลด stock ได้ + ดูจำนวนคงเหลือ
```

### Task Breakdown

| # | Task | เวลา | Priority | Dependencies | Status |
|---|---|---|---|---|---|
| 1 | Setup project (Next.js + Supabase + Prisma) | 2h | P1 | - | ⬜ |
| 2 | Design database schema (products, stock_movements) | 1h | P1 | - | ⬜ |
| 3 | CRUD Product (API + UI) | 3h | P1 | Task 1, 2 | ⬜ |
| 4 | Stock Movement API (เพิ่ม/ลด stock) | 3h | P1 | Task 2, 3 | ⬜ |
| 5 | Stock Dashboard UI (ดู stock คงเหลือ) | 2h | P1 | Task 4 | ⬜ |
| 6 | Auth (login/logout) | 2h | P2 | Task 1 | ⬜ |
| 7 | Input validation + error handling | 2h | P2 | Task 3, 4 | ⬜ |
| 8 | Basic testing | 2h | P2 | Task 5 | ⬜ |

### ลำดับ
```
Phase 1 (MVP - 2 วัน):
  Task 1 → Task 2 → Task 3 → Task 4 → Task 5

Phase 2 (Polish - 1 วัน):
  Task 6 → Task 7 → Task 8
```

---

## เทคนิคการแบ่ง Task

1. **แต่ละ task ต้องมีผลลัพธ์ชัดเจน** — "เสร็จแล้วเห็นอะไร?"
2. **ไม่เกิน 4 ชั่วโมง** — ถ้านานกว่านี้ แบ่งย่อยอีก
3. **ระบุ dependency** — task ไหนต้องทำก่อน-หลัง
4. **แยก MVP ออกจาก nice-to-have** — ทำ MVP ให้เสร็จก่อน
5. **ใส่ buffer 20%** — เผื่อเวลา unexpected issues
