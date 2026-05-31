# Gate Enforcement — ระบบเตือนเมื่อข้ามขั้นตอน
# เอกสารนี้อธิบาย: AI ตรวจสอบอะไร? เตือนเมื่อไร? ทำงานยังไง?

---

## หลักการ: AI ต้องเตือนเมื่อข้ามขั้นตอน

```
สถานการณ์ที่ AI ต้องเตือน:
1. ผู้ใช้สั่ง "แก้โค้ด" โดยไม่ได้ผ่าน Gate
2. ผู้ใช้สั่ง "ทำ feature" โดยไม่มี architecture doc
3. ผู้ใช้สั่ง "deploy" โดยไม่มี review
4. ผู้ใช้ตอบ Active Reminder ไม่ครบ

สิ่งที่ AI ต้องทำ:
→ เตือน (ไม่ใช่บล็อค) + บอกว่าขาดอะไร + เสนอทำให้
```

---

## AI ตรวจสอบจากอะไร?

### เช็ค 1: มี docs/architecture.md ไหม? (Root Level)

```
ถ้าไม่มี → module connections ยังไม่ถูกบันทึก
→ เตือน: "ยังไม่มี architecture doc ของ project นี้
  ต้องการให้สร้างก่อนไหม? (อ่าน codebase แล้วสรุป)"
```

### เช็ค 2: Module ที่จะแก้มี doc ไหม? (Module Level)

```
ถ้าไม่มี docs/modules/[module-name].md
→ เตือน: "module [X] ยังไม่มี architecture doc
  ผมอ่าน module นี้แล้วสร้างให้ก่อนนะ"
→ AI อ่าน + สร้างให้ → แล้วค่อยถาม Active Reminder
```

### เช็ค 3: Gate Status ของ task นี้

```
ตรวจจาก docs/gate-status.md (ถ้ามี)
หรือถามผู้ใช้:
- "task นี้ผ่าน Gate ไหนแล้ว?"
- "requirement ชัดแล้วหรือยัง?"
- "risk ที่อาจเกิด identify แล้วหรือยัง?"
```

---

## ตัวอย่างสถานการณ์

### สถานการณ์ 1: เปิด project เก่า → สั่ง "แก้ function X ให้หน่อย"

```
AI ตอบ:

"ก่อนแก้ code ขอเช็คก่อนนะครับ:

📋 Gate Check:
- [ ] docs/architecture.md → ❌ ไม่มี (ยังไม่เคยสร้าง)
- [ ] docs/modules/[module].md → ❌ ไม่มี
- [ ] Active Reminder → ❌ ยังไม่ตอบ

⚠️ เตือน: ยังไม่ผ่าน Gate 1-4

ต้องการให้ผม:
A) อ่าน project + สร้าง architecture doc ก่อน (แนะนำ ~2-3 นาที)
B) อ่านเฉพาะ module ที่จะแก้ แล้วเริ่มเลย
C) ข้ามทุก Gate ทำเลย (⚠️ ไม่แนะนำ — risk สูง)

เลือกทางไหนครับ?"
```

### สถานการณ์ 2: Project ใหม่ → สั่ง "สร้าง API products"

```
AI ตอบ:

"ก่อนเริ่ม code ขอถาม Active Reminder ก่อนนะครับ:

1. เป้าหมายจริงของ API products คืออะไร?
2. success วัดจากอะไร?
3. module/ระบบไหนที่เกี่ยวข้อง?
4. ถ้า API พังจะเกิดอะไร?
5. scope: ต้องมี CRUD ครบไหม? มี auth ไหม?

📋 Gate Check:
- [ ] Architecture → ❌ ยังไม่มี
- [ ] ออกแบบ schema → ❓ มีหรือยัง?

แนะนำ: ตอบ 5 คำถามก่อน → ผมออกแบบ architecture ให้ → แล้วค่อย code
จะใช้ flow นี้ไหมครับ?"
```

### สถานการณ์ 3: ด่วนจริง → ต้องข้าม Gate

```
ผู้ใช้: "ด่วน stock ติดลบบน production แก้เลย"

AI ตอบ:

"⚡ เข้าใจครับ — urgent fix

Quick Gate (แบบย่อสำหรับ hotfix):
1. Symptom: stock ติดลบ → ✅
2. Impact: ลูกค้า oversell → ✅ สูง
3. Module: stock/movements → ✅ ระบุแล้ว
4. Rollback: ได้ไหม? [ต้องตอบ]

ผมอ่าน stock module ก่อน (~30 วินาที) แล้วเสนอ fix ครับ
---
(อ่าน module...)
---
Hypothesis: [X]
Fix เสนอ: [Y]
Risk: [Z]

confirm แล้วผมทำให้ครับ"
```

---

## Gate Status Tracking — ไฟล์ติดตามสถานะ

สร้างไฟล์ `docs/gate-status.md` ใน project:

```markdown
# Gate Status — [Project Name]
# อัปเดตล่าสุด: [วันที่]

## Active Tasks

| Task | Gate 1 | Gate 2 | Gate 3 | Gate 4 | Status |
|---|---|---|---|---|---|
| CRUD Products | ✅ | ✅ | ✅ | ✅ | code-mode |
| Stock Movement | ✅ | ✅ | 🔄 | ❌ | เลือก approach |
| Alert System | ✅ | ❌ | ❌ | ❌ | ต้อง analysis |
| Reports | ❌ | ❌ | ❌ | ❌ | ยังไม่เริ่ม |

## Modules Architecture Status

| Module | Doc Created | Last Updated | Status |
|---|---|---|---|
| products/ | ✅ | 2026-05-29 | stable |
| stock/ | ✅ | 2026-05-30 | in development |
| reports/ | ❌ | - | not started |
| auth/ | ✅ | 2026-05-28 | stable |
```

---

## สรุป: AI ตรวจอะไรก่อนทำงาน?

```
1. มี docs/architecture.md ไหม?
   ไม่มี → เสนอสร้าง
   มี → อ่าน (Level 0)

2. Module ที่จะแก้มี doc ไหม?
   ไม่มี → อ่าน module + สร้าง doc (Level 1)
   มี → อ่าน doc

3. Active Reminder ครบไหม?
   ไม่ครบ → ถามกลับ
   ครบ → ไปต่อ

4. Gate status ของ task?
   ยังไม่ผ่าน → เตือน + เสนอทำให้
   ผ่านแล้ว → เข้า code-mode

5. ด่วน (hotfix)?
   → ใช้ Quick Gate (แบบย่อ) แทน full gate
```
