# Project Playbook: ระบบ Stock Management
# ใช้เป็น reference เมื่อทำ project ระบบ stock — ลดเวลาคิดใหม่จากศูนย์

---

## ภาพรวม

| รายการ | ข้อมูล |
|---|---|
| ประเภท | Inventory Management System |
| ลูกค้าเป้าหมาย | ร้านค้าปลีก/ส่ง ขนาดเล็ก-กลาง |
| Users ทั่วไป | เจ้าของร้าน, พนักงานคลัง, พนักงานขาย |
| ระบบที่มักเชื่อม | POS, บัญชี, Shipping, E-commerce |

---

## Features ทั่วไป (เรียงตาม priority)

### MVP (ต้องมี)
- [ ] CRUD สินค้า (product master)
- [ ] Stock movement (เพิ่ม/ลด stock + เหตุผล)
- [ ] ดู stock คงเหลือ (real-time)
- [ ] ค้นหาสินค้า (ชื่อ, SKU, barcode)
- [ ] Authentication (login/logout, role)

### Phase 2 (ควรมี)
- [ ] Stock alert (แจ้งเตือนเมื่อ stock ต่ำ)
- [ ] Report (stock summary, movement history)
- [ ] Import/Export (CSV, Excel)
- [ ] Barcode scan
- [ ] Stock audit (ตรวจนับ stock)

### Phase 3 (Nice to have)
- [ ] Multi-warehouse (หลายคลัง)
- [ ] Stock transfer (ย้าย stock ระหว่างคลัง)
- [ ] Lot/Batch tracking (ตามล็อตผลิต)
- [ ] Expiry date tracking (สินค้าหมดอายุ)
- [ ] Supplier management
- [ ] Purchase Order (PO)
- [ ] Forecast / Reorder point

---

## Database Schema (ตัวอย่าง)

```sql
-- สินค้า
products
  id, name, sku, barcode, category, unit, price, cost,
  min_stock (threshold สำหรับ alert),
  created_at, updated_at, deleted_at

-- การเคลื่อนไหว stock
stock_movements
  id, product_id, type (IN/OUT/ADJUST),
  quantity, reason, reference_id, reference_type,
  before_qty, after_qty,
  created_by, created_at

-- stock คงเหลือ (denormalized เพื่อ query เร็ว)
stock_balances
  id, product_id, warehouse_id,
  quantity, last_updated_at

-- คลังสินค้า (ถ้ามีหลายคลัง)
warehouses
  id, name, location, created_at
```

---

## System Map ทั่วไป

```
[Supplier/PO] ──→ [Stock System] ──→ [ระบบบัญชี (ต้นทุน)]
[Admin Panel] ──→ [Stock System] ──→ [Report Dashboard]
[POS] ──────────→ [Stock System] ──→ [Alert (LINE/Email)]
[E-commerce] ───→ [Stock System]
                       │
                       ├── Database (PostgreSQL/MySQL)
                       ├── Cache (Redis - optional)
                       └── Auth Service
```

---

## Edge Cases ที่มักเจอ

| # | Edge Case | ต้องจัดการยังไง |
|---|---|---|
| 1 | Stock ติดลบ (ขายเกิน) | ใช้ DB constraint + validation ก่อน deduct |
| 2 | 2 คนตัด stock พร้อมกัน (race condition) | ใช้ pessimistic lock หรือ optimistic concurrency |
| 3 | สินค้ามี variant (size/color) | stock แยกตาม variant_id |
| 4 | Bundle (ขายรวมหลายชิ้น) | ตัด stock component ไม่ใช่ตัว bundle |
| 5 | Return (คืนของ) | stock movement type = RETURN → เพิ่ม stock กลับ |
| 6 | Stock audit ไม่ตรง | มี ADJUST type + ต้อง log เหตุผล |
| 7 | สินค้าหมดอายุ | separate field + alert ก่อนหมดอายุ |

---

## Tech Stack แนะนำ (สำหรับคนเดียว + AI)

| Layer | แนะนำ | เหตุผล |
|---|---|---|
| Frontend | Next.js + shadcn/ui | เร็ว, สวย, SEO ready |
| Backend | Next.js API Routes | ไม่ต้องแยก server |
| Database | Supabase (PostgreSQL) | managed, free tier, ย้ายออกได้ |
| ORM | Prisma | type-safe, migration ง่าย |
| Auth | Supabase Auth | ง่าย, built-in |
| Alert | LINE Notify API | ฟรี, คนไทยใช้ LINE |
| Deploy | Vercel | free tier, auto deploy |

---

## Estimation Reference (อ้างอิง)

| Feature | เวลาโดยประมาณ |
|---|---|
| Setup project | 2-3h |
| Database design + migration | 2-3h |
| CRUD Product (API + UI) | 4-6h |
| Stock Movement | 4-6h |
| Stock Dashboard | 3-4h |
| Auth (login/role) | 3-4h |
| Alert (LINE) | 2-3h |
| Report (basic) | 3-4h |
| Import/Export | 3-4h |
| **MVP Total** | **~25-35h (4-5 วัน)** |

---

## Risk ที่มักเจอ

| Risk | Impact | Mitigation |
|---|---|---|
| Stock ติดลบ | ขายเกิน → refund + เสียชื่อ | DB constraint + validation |
| Data migration ผิด | stock ผิดทั้งระบบ | validate ก่อน import + backup |
| Performance ตอน stock เยอะ | โหลดช้า | index + pagination + cache |
| Race condition | stock ผิด | DB lock / optimistic concurrency |
