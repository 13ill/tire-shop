# Project Playbook: ระบบ POS (Point of Sale)
# ใช้เป็น reference เมื่อทำ project ระบบ POS — ลดเวลาคิดใหม่จากศูนย์

---

## ภาพรวม

| รายการ | ข้อมูล |
|---|---|
| ประเภท | Point of Sale System |
| ลูกค้าเป้าหมาย | ร้านค้าปลีก/ร้านอาหาร ขนาดเล็ก-กลาง |
| Users ทั่วไป | พนักงานขาย (cashier), ผู้จัดการ, เจ้าของ |
| ระบบที่มักเชื่อม | Stock, บัญชี, Payment Gateway, Printer |

---

## Features ทั่วไป (เรียงตาม priority)

### MVP (ต้องมี)
- [ ] ค้นหาสินค้า / scan barcode
- [ ] เพิ่มสินค้าลง cart
- [ ] คำนวณราคา (subtotal, discount, tax, total)
- [ ] รับชำระเงิน (เงินสด + เงินทอน)
- [ ] ออก receipt (หน้าจอ / print)
- [ ] ตัด stock อัตโนมัติ
- [ ] สรุปยอดขาย (end of day)

### Phase 2 (ควรมี)
- [ ] รับชำระหลายช่องทาง (QR, บัตร, โอน)
- [ ] Discount (ส่วนลด %, บาท, coupon)
- [ ] Hold order (พักบิล)
- [ ] ยกเลิก / คืนสินค้า (void / return)
- [ ] Report (ยอดขายวัน/เดือน, สินค้าขายดี, พนักงาน)
- [ ] Multiple payment (จ่ายหลายวิธีรวมกัน)
- [ ] Cash drawer management (เปิด/ปิดลิ้นชัก)

### Phase 3 (Nice to have)
- [ ] Customer management (สมาชิก, สะสมแต้ม)
- [ ] Promotion engine (ซื้อ 2 แถม 1, ลด %)
- [ ] Table management (สำหรับร้านอาหาร)
- [ ] Kitchen display (สำหรับร้านอาหาร)
- [ ] Multi-branch (หลายสาขา)
- [ ] Offline mode (ใช้งานได้เมื่อ internet หลุด)
- [ ] Shift management (กะพนักงาน)
- [ ] Weighing scale integration

---

## Database Schema (ตัวอย่าง)

```sql
-- Order (บิลขาย)
orders
  id, order_number, status (pending/completed/void),
  subtotal, discount_amount, tax_amount, total,
  payment_method, payment_ref,
  cashier_id, branch_id,
  created_at, completed_at

-- รายการในบิล
order_items
  id, order_id, product_id,
  quantity, unit_price, discount, total,
  created_at

-- การชำระเงิน
payments
  id, order_id, method (cash/qr/card/transfer),
  amount, change_amount, reference,
  created_at

-- Cash drawer (ลิ้นชักเงินสด)
cash_sessions
  id, cashier_id, opened_at, closed_at,
  opening_amount, closing_amount, expected_amount,
  difference, note
```

---

## System Map ทั่วไป

```
[Customer] → [POS Frontend] → [POS API] → [Database]
                    │                │
                    ├── Printer      ├── [Stock System] (ตัด stock)
                    ├── Barcode Scanner   ├── [Payment Gateway]
                    └── Cash Drawer       └── [Accounting System]
```

---

## Edge Cases ที่มักเจอ

| # | Edge Case | ต้องจัดการยังไง |
|---|---|---|
| 1 | Internet หลุดระหว่างขาย | Offline mode + sync เมื่อ online |
| 2 | สินค้าหมด stock ระหว่างขาย | แจ้งเตือน + ให้เลือก "ขายต่อ" หรือ "ยกเลิก" |
| 3 | ลูกค้าจ่ายหลายวิธี (เงินสด + QR) | Multiple payment support |
| 4 | ยกเลิกบิลหลังจากชำระแล้ว (void) | Void + คืน stock + log เหตุผล + อนุมัติจาก manager |
| 5 | คืนสินค้า (return) | Return flow + เพิ่ม stock กลับ + refund |
| 6 | ส่วนลดซ้อนกัน (discount on discount) | กำหนด priority ของ discount |
| 7 | Printer พัง | Save receipt as PDF / re-print ได้ |
| 8 | พนักงานกดราคาผิด | ต้อง void ได้ + audit log |

---

## Tech Stack แนะนำ

| Layer | แนะนำ | เหตุผล |
|---|---|---|
| Frontend | Next.js + Tailwind | responsive, PWA support |
| Backend | Next.js API Routes | unified stack |
| Database | Supabase (PostgreSQL) | managed, real-time |
| ORM | Prisma | type-safe |
| Payment | PromptPay QR (พร้อมเพย์) | ฟรี สำหรับรับเงิน |
| Print | ESC/POS protocol | standard thermal printer |
| Deploy | Vercel + local fallback | หลัก cloud + fallback offline |

---

## Estimation Reference

| Feature | เวลาโดยประมาณ |
|---|---|
| Setup project | 2-3h |
| Product search + cart UI | 4-6h |
| Price calculation (discount, tax) | 3-4h |
| Payment (cash) | 2-3h |
| Receipt (screen) | 2-3h |
| Stock integration | 2-3h |
| End of day summary | 2-3h |
| Auth + role | 3-4h |
| **MVP Total** | **~25-35h (4-5 วัน)** |

---

## UX สำคัญสำหรับ POS

```
POS ≠ Website ทั่วไป

POS ต้อง:
- เร็ว — พนักงานใช้ทั้งวัน ถ้าช้า = เสียรายได้
- ง่าย — พนักงานใหม่ต้องใช้ได้ใน 5 นาที
- มั่นคง — ห้ามค้าง ห้าม crash ระหว่างขาย
- Touch-friendly — ใช้ tablet/touchscreen ได้
- Font ใหญ่ — อ่านง่าย ไม่ต้องเพ่ง
- Keyboard shortcut — สำหรับ power user
```

---

## Risk ที่มักเจอ

| Risk | Impact | Mitigation |
|---|---|---|
| Internet ล่ม | ขายไม่ได้ | PWA + offline mode |
| ข้อมูลไม่ sync | ยอดผิด | queue + retry + conflict resolution |
| Printer พัง | ออก receipt ไม่ได้ | digital receipt + re-print |
| Race condition | stock ผิด | pessimistic lock on stock |
| Performance ตอนลูกค้าเยอะ | POS ช้า | optimize query + cache |
