# Workflows — Flow การทำงานทุก Use Case
# Updated: 2026-05-29

---

## 1. ขายสินค้าหน้าร้าน (POS Sale)

```
พนักงานเปิดกะ (Shift)
→ ใส่เงินทอนในลิ้นชัก
→ พร้อมขาย

ลูกค้ามาซื้อ:
→ scan barcode / ค้นหาสินค้า
→ เลือก variant (ถ้ามี)
→ ใส่จำนวน
→ เลือก pricing tier (ปลีก/ส่ง) หรือ ใส่ราคา custom (ต่อรอง)
→ เพิ่ม item ในบิล (ทำซ้ำได้)
→ [Hold bill ได้ ถ้าลูกค้ารอ]
→ คิดเงิน:
   → เลือกวิธีชำระ (สด/โอน/split)
   → ใส่จำนวนเงิน
   → คำนวณทอน (ถ้าเงินสด)
→ ออกเอกสาร (ใบเสร็จ / ใบกำกับภาษี / ใบส่งของ)
→ print thermal receipt
→ stock ตัดอัตโนมัติ
→ loyalty points เพิ่ม (ถ้าลูกค้ามีบัตร)

ปิดกะ:
→ สรุปยอดขาย (จำนวนบิล, ยอดรวม, แยกตามวิธีชำระ)
→ นับเงินในลิ้นชัก → เทียบกับระบบ → บันทึกส่วนต่าง
```

---

## 2. เปิด Job ซ่อม (Service Job)

```
ลูกค้ามา:
→ ค้นหา customer (ชื่อ/เบอร์) หรือสร้างใหม่
→ ค้นหา/เพิ่ม vehicle (ทะเบียน/ยี่ห้อ/รุ่น)
→ สร้าง visit (1 visit = หลาย jobs ได้)
→ เปิด job:
   → บันทึกอาการ (symptoms)
   → ประมาณการราคา (estimated_price)
   → ถ่ายรูป (before) — หลายมุม
   → assign ช่าง (optional)
   → เข้าคิว (status: queue)

ระหว่างซ่อม:
→ ช่าง/พนักงาน เบิกอะไหล่ (BOM pick)
   → เลือกสินค้า + จำนวน
   → stock ตัดทันที
   → status → in_progress
→ เบิกเพิ่มระหว่างทำ:
   → เลือกสินค้า + จำนวน + ใส่เหตุผล
   → stock ตัดทันที
→ คืนอะไหล่ (ถ้าไม่ได้ใช้):
   → เลือกรายการ + จำนวนคืน + ใส่เหตุผล
   → stock คืนทันที
→ ถ่ายรูป (during) — ระหว่างทำ

ซ่อมเสร็จ:
→ status → testing
→ ทดสอบ
→ ถ่ายรูป (after) — ผลงาน + ส่งมอบ
→ status → delivered

คิดเงิน (พนักงานหน้าเคาท์เตอร์):
→ ดู BOM ทั้งหมด (เบิก/คืน/เหตุผล)
→ กำหนดราคาแต่ละรายการ (unit_price + labor)
→ เพิ่มค่าบริการ (ถ้ามี)
→ เพิ่ม warranty (optional — ราคาแยก/รวม)
→ สร้าง sale → ชำระเงิน → ออกบิล
→ เทียบ ประมาณการ vs ค่าจริง
→ status → done
```

---

## 3. ค้นหาประวัติ (Service History)

```
Case A: เห็นทะเบียนรถ
→ ค้นหาทะเบียน "1กก 1234"
→ เจอ vehicle → เห็น jobs ทั้งหมดของรถคันนี้
→ แต่ละ job: วันที่ | อาการ | สถานะ | ราคา
→ เลือก job → เห็น:
   - อาการก่อนซ่อม
   - BOM (เบิก/คืน + เหตุผล + ใครเบิก)
   - ราคาแต่ละรายการ
   - รูป (before/during/after)
   - Warranty (ถ้ามี — วันหมดอายุ)
   - ช่างที่ทำ

Case B: รู้ชื่อ/เบอร์ลูกค้า (ไม่มีทะเบียน เช่น ซ่อมแอร์)
→ ค้นหาชื่อ/เบอร์
→ เจอ customer → เห็นรถทุกคัน + jobs ทุกอัน
→ เลือก job → เห็นรายละเอียดเหมือน Case A
```

---

## 4. Stock Management

```
รับสินค้าเข้า:
→ สร้าง PO (Purchase Order) — เลือก supplier + สินค้า + จำนวน + ราคาทุน
→ สินค้ามาถึง → สร้าง GRN (Goods Received)
→ ตรวจนับ → confirm → stock เข้าอัตโนมัติ
→ ราคาทุนอัปเดต (ตาม FIFO/average ที่เลือก)

ตรวจนับ stock:
→ Owner เลือก "ตรวจนับ"
→ เลือก category/สินค้า
→ ใส่จำนวนนับจริง
→ ระบบแสดงส่วนต่าง (system vs actual)
→ Owner review + approve
→ สร้าง movement type='correction' + เหตุผล

สินค้าหาย/เสียหาย:
→ สร้าง movement type='loss'/'damage'
→ ใส่เหตุผล
→ Owner approve
→ stock ลดอัตโนมัติ
→ log ไว้ตรวจสอบ

Low stock alert:
→ ระบบเช็ค balance < min_stock
→ แจ้งเตือน (ยกเว้นสินค้าที่ ignore)
```

---

## 5. Offline + Sync

```
ทุก action ที่ user ทำ:
→ บันทึก IndexedDB (local) ทันที → UI อัปเดตทันที
→ เพิ่มลง sync queue

Background sync (ทุก 5-10 วินาที):
→ เช็ค online? 
   → Yes: ส่ง queue items ไป server (POST /api/sync)
      → server ตอบ ok → ลบจาก queue
      → server ตอบ conflict → แจ้ง user
   → No: เก็บไว้ใน queue → retry เมื่อ online

Pull changes:
→ poll GET /api/changes?since=[last_sync_timestamp]
→ ได้ data ใหม่จากเครื่องอื่น → อัปเดต IndexedDB → UI อัปเดต

Status bar:
→ 🟢 Online + synced (0 pending)
→ 🟡 Online + syncing (3 pending)
→ 🔴 Offline (5 queued)

Conflict (เมื่อ 2 เครื่อง edit พร้อมกัน offline):
→ Stock movements: ไม่ conflict (movement-based — แต่ละ device สร้าง movement แยก)
→ Edit เดียวกัน: last-write-wins + แจ้ง user ว่า "ข้อมูลถูกแก้จากเครื่องอื่น"
```

---

## 6. เงินมัดจำ (Deposit)

```
เปิด job → ลูกค้าจ่ายมัดจำ:
→ สร้าง sale (deposit_amount = X)
→ payment_status = 'partial'
→ เก็บเงินมัดจำ

ซ่อมเสร็จ → จ่ายส่วนที่เหลือ:
→ total - deposit_amount = ยอดที่ต้องจ่าย
→ ชำระ → payment_status = 'paid'
```

---

## 7. คืนสินค้า / Refund

```
ลูกค้ามาคืน:
→ ค้นหาบิลเดิม (sale_number)
→ เลือก item ที่จะคืน + จำนวน
→ ใส่เหตุผล
→ สร้าง refund → stock คืนอัตโนมัติ
→ คืนเงิน (สด/โอน)
```

---

## 8. ยกเลิกบิล (Void)

```
พบว่าออกบิลผิด:
→ ค้นหาบิล
→ กด Void + ใส่เหตุผล
→ payment_status = 'voided'
→ stock คืนอัตโนมัติ
→ บันทึก audit log
```

---

## 9. Warranty Claim

```
ลูกค้ากลับมาเคลม:
→ ค้นหาจาก ทะเบียน/ชื่อ/เบอร์
→ เห็น warranty ที่ active
→ เปิด job ใหม่ (link to warranty)
→ ซ่อม/เปลี่ยน → ไม่คิดเงิน (หรือลดราคา)
→ warranty status → 'claimed'
```

---

## 10. Follow-up หลังซ่อม

```
job done → ระบบสร้าง follow_up record:
→ follow_up_date = completed_at + X วัน (configurable)
→ type: warranty_check / service_reminder / custom
→ แสดงใน dashboard owner/staff "ต้อง follow up วันนี้"
→ ติดต่อลูกค้า → mark done/skipped
```

---

## 11. รายจ่ายร้าน (Expenses)

```
มีค่าใช้จ่าย:
→ เลือกหมวด (ค่าน้ำ/ค่าไฟ/เงินเดือน/อื่นๆ)
→ ใส่จำนวนเงิน + วันที่ + รายละเอียด
→ ถ่ายรูปใบเสร็จ (optional)
→ บันทึก
→ แสดงในรายงานกำไร-ขาดทุน
```

---

## 12. เข้างาน-ออกงาน (Attendance)

```
พนักงานมาถึง:
→ login → กด clock in
→ บันทึกเวลา

เลิกงาน:
→ กด clock out
→ บันทึกเวลา

Owner ดู:
→ report ใครมากี่โมง / ขาดวันไหน
```
