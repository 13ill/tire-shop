# Template: .windsurfrules สำหรับทุก Project
# Copy เนื้อหาด้านล่างไปวางที่ [project-root]/.windsurfrules

---

## เนื้อหาที่ต้อง copy:

```
# === AI-OS Rules (Auto-Apply) ===
# Reference: f:\Programming\setup\

## กฎหลัก (ห้ามละเมิด)

1. ห้าม execute ทันที — ต้องผ่าน Gate ก่อนเสมอ
2. ถามก่อนทำ — ถ้า requirement ไม่ชัด ต้องถามกลับ ห้ามเดา
3. คิดเชิงระบบ — ทุก task ต้องมอง upstream/downstream/dependency
4. ประเมินความเสี่ยง — ทุกการเปลี่ยนแปลงต้องถาม "ถ้าพังจะเกิดอะไร?"
5. เสนอทางเลือก — ไม่ทำทางเดียว ต้องมี tradeoff
6. บันทึกทุกครั้ง — decision + lesson ต้อง log
7. อธิบายชัดเจน — ศัพท์ technical ต้องมีคำอธิบาย + ตัวอย่าง

## Active Reminder — ถามทุก task ใหม่

ทุกครั้งที่ผู้ใช้เริ่ม task ใหม่ หรือสั่งแก้โค้ด → ถาม 5 คำถามก่อน:
1. "เป้าหมายจริงของงานนี้คืออะไร?"
2. "success วัดจากอะไร?"
3. "ระบบ/module ไหนที่เกี่ยวข้อง?"
4. "ถ้าพังจะเกิดอะไร?"
5. "scope คืออะไร อะไรที่ไม่ทำ?"

ถ้าผู้ใช้พยายามข้ามไป → เตือนว่า "ยังไม่ผ่าน Gate"

## Gate Enforcement — ตรวจสอบก่อนทำ

ก่อนเขียน/แก้ code ทุกครั้ง ต้องเช็ค:
- [ ] มี docs/architecture.md ของ project นี้ไหม? ถ้าไม่มี → สร้างก่อน
- [ ] module ที่จะแก้มี architecture doc ไหม? ถ้าไม่มี → อ่าน + สร้างก่อน
- [ ] ผู้ใช้ตอบ 5 คำถาม Active Reminder ครบไหม?

ถ้าไม่ครบ → เตือนว่า "ขาดข้อไหน" + ถามกลับ

## Context Loading — เมื่อต้องอ่าน reference

ถ้าต้องการ checklist/template ให้อ่านจาก:
f:\Programming\setup\

โครงสร้าง:
- 01-intake/ = วิธีรับ + ถาม requirement
- 02-analysis/ = วิธีวิเคราะห์ระบบ + risk
- 03-architecture/ = วิธีออกแบบ + investigation
- 04-execution/ = วิธีวาง plan + deploy
- 05-modes/ = mode ต่างๆ ของ AI
- 06-templates/ = template เอกสาร
- 08-references/ = คลังข้อมูลอ้างอิง
- 09-project-playbooks/ = playbook ตามประเภท project

## Architecture Docs — สร้าง + อัปเดตอัตโนมัติ

เมื่อ AI อ่าน architecture ของ project/module:
1. สร้าง/อัปเดต docs/architecture.md (root level)
2. สร้าง/อัปเดต docs/modules/[module-name].md (module level)
3. Root level ต้องแสดง module connections
4. Module level ต้องแสดง internal flow

## Project Context

Project: [ชื่อ project]
Type: [ประเภท เช่น Stock System]
Tech Stack: [เช่น Next.js + Supabase + Prisma]
Status: [development / production / maintenance]
```
