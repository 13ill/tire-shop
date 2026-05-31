# Pre-Code Gate — สิ่งที่ต้องจบก่อนเขียนโค้ด
# ใช้เมื่อ: ผ่าน Gate 1-3 แล้ว กำลังจะเข้า code-mode
# กฎ: ถ้ายังตอบไม่ได้ข้อไหน = ยังไม่พร้อม code → กลับไปทำ Gate ก่อนหน้า

---

## ⚠️ ห้ามเริ่มเขียนโค้ด ถ้ายังไม่ผ่าน Checklist นี้

### A. เข้าใจ Requirement ✅

- [ ] เป้าหมาย (business intent) ชัดเจน
- [ ] scope ชัด — รู้ว่าอะไรทำ อะไรไม่ทำ
- [ ] success metric (ตัวชี้วัดความสำเร็จ) ชัด
- [ ] edge cases (กรณีพิเศษ) ระบุแล้ว
- [ ] constraints (ข้อจำกัด) รู้ครบ

### B. เข้าใจระบบ ✅

- [ ] รู้ว่าระบบนี้อยู่ตรงไหนในภาพใหญ่
- [ ] upstream/downstream ชัด
- [ ] dependency ลิสต์ครบ
- [ ] รู้ impact ถ้าแก้ผิด

### C. ตัดสินใจแล้ว ✅

- [ ] เลือก approach/technology แล้ว
- [ ] รู้ tradeoff ของทางที่เลือก
- [ ] บันทึก decision แล้ว (หรือจะบันทึกหลัง)
- [ ] รู้ว่าถ้าเลือกผิด ย้อนกลับยังไง

### D. ออกแบบแล้ว ✅

- [ ] folder structure ชัด
- [ ] module/layer ที่ต้องมีชัด
- [ ] data flow ชัด
- [ ] database schema ชัด (ถ้ามี)
- [ ] API design ชัด (ถ้ามี)

### E. พร้อม Execute ✅

- [ ] แบ่ง task ย่อยแล้ว (แต่ละ task ไม่เกิน 2-4 ชั่วโมง)
- [ ] รู้ว่าจะเริ่มจากอะไรก่อน
- [ ] มี test criteria (รู้ว่าจะเทสต์ยังไง)
- [ ] มี rollback plan (ถ้าพังจะย้อนกลับยังไง)

---

## ผ่านหมดแล้ว?

```
✅ ทุกข้อ checked → เข้า code-mode ได้
❌ มีข้อไม่ผ่าน → กลับไปทำ Gate ที่เกี่ยวข้อง
```

---

## เคล็ดลับ

### สำหรับ task เล็ก (< 2 ชั่วโมง):
- ทำ Section A + E อย่างย่อก็พอ
- ไม่ต้องทำทุกข้อ แต่ต้องตอบได้ว่า "รู้ว่ากำลังจะทำอะไร"

### สำหรับ task ใหญ่ (> 1 วัน):
- ทำทุก Section อย่างละเอียด
- ถ้าข้ามไป → โอกาสต้องย้อนกลับมาแก้สูงมาก

### ตัวอย่าง: ก่อนทำระบบ Stock

```
✅ A: เข้าใจว่าต้องทำระบบ stock สำหรับร้าน 1 ร้าน, 5 คนใช้, 500 SKU
✅ B: upstream = POS, downstream = บัญชี, dependency = PostgreSQL + Auth
✅ C: เลือก Supabase เพราะ free + managed + ย้ายออกได้
✅ D: folder structure เป็น Next.js + API routes + Prisma ORM
✅ E: เริ่มจาก product CRUD → stock movement → report
```
