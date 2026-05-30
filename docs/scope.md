# Feature Scope — POS+Stock ร้านยาง
# Updated: 2026-05-29
# Status: Confirmed ✅

---

## ✅ ต้องมี (Phase 1 — 45 วัน)

### Products & Services
- [ ] CRUD สินค้า + บริการ
- [ ] Categories (หมวดหมู่ แบ่ง product/service)
- [ ] Variants (เช่น ยี่ห้อ × ขนาด)
- [ ] Pricing tiers (ปลีก/ส่ง/custom) — ต่อรองได้
- [ ] ค่าแรง (labor cost) — บางบริการมี บางบริการไม่มี
- [ ] หน่วยนับ configurable (เส้น, ชิ้น, ลิตร, งาน)
- [ ] Barcode / SKU
- [ ] ราคาทุน (cost price) — เลือก FIFO / ค่าเฉลี่ย
- [ ] เปิด/ปิด active

### Stock
- [ ] Stock movements (in/out/return/loss/damage/correction)
- [ ] Stock balances (real-time)
- [ ] Low stock alert + ignore list
- [ ] Stock count / audit (ตรวจนับ → approve)
- [ ] Stock loss / shrinkage + เหตุผล + approve
- [ ] Movement-based (ไม่ conflict offline)
- [ ] Storage locations — table เผื่อไว้ (UI ทำ Phase 2)

### Supplier & Procurement
- [ ] Supplier CRUD (ชื่อ/เบอร์/ที่อยู่)
- [ ] Purchase Order (PO)
- [ ] Goods Received Note (GRN) → เข้า stock
- [ ] ราคาทุนต่อ supplier

### POS
- [ ] ขายหน้าร้าน + ออกบิล
- [ ] เปิด-ปิดกะ (Shift) + เงินทอน
- [ ] Daily closing (สรุปยอด)
- [ ] Hold / Park bill
- [ ] Split payment (หลายวิธี 1 บิล)
- [ ] Barcode scan
- [ ] Thermal printer (ใบเสร็จ)
- [ ] VAT configurable

### Documents
- [ ] ใบเสร็จรับเงิน (Receipt)
- [ ] ใบกำกับภาษี (Tax Invoice)
- [ ] ใบส่งของ (Delivery Note)
- [ ] ใบสั่งงาน (Work Order) — print ให้ช่าง

### Financial
- [ ] เงินมัดจำ (Deposit)
- [ ] คืนสินค้า / Refund
- [ ] ยกเลิกบิล (Void) + เหตุผล
- [ ] Split payment

### Service Jobs
- [ ] เปิด/ปิด job + คิวซ่อม + สถานะ (queue→in_progress→testing→delivered→done)
- [ ] BOM movement-based:
  - ทุกคนมีสิทธิ์เลือกอะไหล่
  - เบิก → ตัด stock ทันที
  - เพิ่ม/คืนระหว่างทำ + ใส่เหตุผล
  - ราคาคำนวณโดยพนักงานหน้าเคาท์เตอร์
- [ ] หลาย job ต่อ 1 visit
- [ ] ประมาณการ vs ค่าจริง
- [ ] Follow up หลังซ่อม (แจ้งเตือน)
- [ ] ใบสั่งงาน (Work Order)

### Customers & Vehicles
- [ ] Customer CRUD (ชื่อ/เบอร์/ที่อยู่)
- [ ] Vehicle CRUD (ทะเบียน/ยี่ห้อ/รุ่น/ขนาดยาง)
- [ ] ค้นหาจากทะเบียน OR ชื่อ/เบอร์ลูกค้า
- [ ] ประวัติซ่อม + ประวัติซื้อ (ดู BOM + รูป + warranty)
- [ ] Loyalty / สะสมแต้ม

### Photos
- [ ] ถ่ายรูป ก่อน/ระหว่าง/หลัง (หลายมุม หลายขั้นตอน)
- [ ] Link to job
- [ ] Local → sync to server
- [ ] ดูรูปในประวัติซ่อม

### Warranty
- [ ] Configurable (จำนวนวัน + ราคา)
- [ ] ผูกกับ job / BOM item
- [ ] ราคาแยก หรือรวมในราคา (แล้วแต่กำหนดหน้างาน)
- [ ] สถานะ: active / claimed / expired

### Expenses (รายจ่ายร้าน)
- [ ] หมวดค่าใช้จ่าย (ค่าน้ำ ค่าไฟ เงินเดือน)
- [ ] บันทึกรายจ่าย + เก็บรูปใบเสร็จ

### Time Attendance
- [ ] เข้างาน-ออกงาน (clock in/out)

### Reports & Dashboard
- [ ] ยอดขายรายวัน/เดือน
- [ ] สินค้าขายดี
- [ ] กำไรต่อ job
- [ ] Stock status
- [ ] Owner dashboard (ภาพรวม)

### Auth & Settings
- [ ] Login (username + password)
- [ ] Roles: owner / staff
- [ ] Settings: VAT, payment methods, units, เปิด/ปิด features
- [ ] Payment methods configurable (เพิ่ม/ลด/เปิด/ปิด)

### Infrastructure
- [ ] Multi-device (3-5 เครื่อง browser)
- [ ] Offline (IndexedDB + sync queue)
- [ ] Status bar (🟢/🟡/🔴 + pending count)
- [ ] PWA installable
- [ ] Polling sync (ทุก 5-10 วินาที)
- [ ] Audit log (ใครทำอะไร เมื่อไร)

---

## 💡 ตัวเลือก (Phase 2)

- [ ] ใบเสนอราคา (Quotation)
- [ ] ใบแจ้งหนี้ (Invoice)
- [ ] เงินเชื่อ / ค้างจ่าย (Credit/AR)
- [ ] Storage locations UI
- [ ] แจ้งเตือนลูกค้า (LINE/SMS)
- [ ] Commission ช่าง/พนักงาน
- [ ] Boss approval flow (ดูรูปก่อนส่งมอบ)
- [ ] Multi-tenant (ขายหลายร้าน)
- [ ] VPS + Docker deployment

---

## ❌ ข้ามไปก่อน

- Stock reservation (จองของไว้สำหรับ job)
- กลุ่มลูกค้า (ปลีก/ส่ง/VIP) — ใช้ pricing tier แทนได้
