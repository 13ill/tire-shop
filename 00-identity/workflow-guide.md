# Workflow Guide — ขั้นตอนทำงานตั้งแต่เริ่มจนจบ Project
# เอกสารนี้อธิบายว่าคุณต้องทำอะไร เรียงตามลำดับ ห้ามข้าม

---

## ภาพรวม: 10 ขั้นตอน

```
1. รับ Requirement
2. ถามให้ชัด (Intake)
3. วิเคราะห์ระบบ (Analysis)
4. ตัดสินใจ Approach (Tradeoff)
5. ออกแบบ Architecture
6. วาง Execution Plan
7. เขียนโค้ด (Code)
8. Review + ทดสอบ
9. Deploy
10. บันทึก + สรุปบทเรียน
```

---

## ขั้นตอน 1: รับ Requirement

### สิ่งที่ได้มา
- owner / ลูกค้า บอกว่าต้องการอะไร (อาจไม่ชัด)

### สิ่งที่ต้องทำ
1. ฟัง/อ่าน requirement ทั้งหมดก่อน — ยังไม่ต้องคิดวิธีทำ
2. จดสิ่งที่ยังไม่เข้าใจ
3. ระบุว่า: "สิ่งที่ owner พูด" vs "สิ่งที่ owner ต้องการจริงๆ" ต่างกันไหม?

### ตัวอย่าง
```
owner พูด: "ทำระบบ stock"
owner ต้องการจริง: "รู้ว่าสินค้าเหลือเท่าไร real-time เพื่อไม่ให้ขายเกิน"
```

### เครื่องมือที่ใช้
- `06-templates/task-intake.md` — กรอก template

---

## ขั้นตอน 2: ถามให้ชัด (Gate 1: Intake)

### เป้าหมาย
เข้าใจ requirement จนตอบคำถามเหล่านี้ได้:
- ทำไปทำไม? (business intent)
- ทำเสร็จแล้วดูจากอะไรว่าสำเร็จ? (success metric)
- ขอบเขตคืออะไร? อะไรที่ไม่ทำ? (scope)
- มีข้อจำกัดอะไร? (constraints)
- deadline จริงหรือเทียม?

### สิ่งที่ต้องทำ
1. เปิด `01-intake/02-deep-requirement-intake.md`
2. วิ่งผ่าน checklist ทุกข้อ
3. ข้อไหนตอบไม่ได้ → ถาม owner (ใช้ `08-references/question-bank.md`)
4. ถ้ากลัวถาม → ดู `08-references/negotiation-guide.md` ส่วน "วิธีถาม owner"

### เครื่องมือที่ใช้
- `01-intake/` ทุกไฟล์
- AI: ใช้ intake-mode → "ช่วยถาม requirement เจาะลึก"

---

## ขั้นตอน 3: วิเคราะห์ระบบ (Gate 2: Analysis)

### เป้าหมาย
เข้าใจว่า:
- ระบบนี้อยู่ตรงไหนใน "ภาพใหญ่"
- ใครส่งข้อมูลมาให้เรา (upstream)
- ใครรอข้อมูลจากเรา (downstream)
- ถ้าเราเปลี่ยนอะไร ใครพัง (dependency + risk)

### สิ่งที่ต้องทำ
1. เปิด `02-analysis/01-system-mapping.md` — วาดแผนที่ระบบ
2. เปิด `02-analysis/02-dependency-analysis.md` — หา dependency
3. เปิด `02-analysis/03-risk-analysis.md` — ประเมินความเสี่ยง
4. ถ้าไม่รู้ระบบ → ใช้ AI architect-mode อ่านโค้ด/doc ให้

### เครื่องมือที่ใช้
- `02-analysis/` ทุกไฟล์
- AI: ใช้ architect-mode → "ช่วยอ่านระบบนี้แล้วสรุป architecture"

---

## ขั้นตอน 4: ตัดสินใจ Approach (Gate 3: Tradeoff)

### เป้าหมาย
เลือกวิธีทำ โดยเปรียบเทียบทางเลือก + ข้อดี/ข้อเสีย

### สิ่งที่ต้องทำ
1. ถาม AI: "มีกี่ทางเลือกในการทำเรื่องนี้?"
2. เปิด `02-analysis/04-tradeoff-discussion.md` — ใช้ format วิเคราะห์
3. เลือกทางที่เหมาะที่สุดตาม context (เวลา, budget, risk)
4. บันทึก decision → `07-logs/decisions/vXXX_วันที่_หัวเรื่อง.md`

### เครื่องมือที่ใช้
- AI: ใช้ tradeoff-mode → "ช่วยเสนอทางเลือก + tradeoff"
- `06-templates/decision-record.md` — template บันทึก

---

## ขั้นตอน 5: ออกแบบ Architecture (Gate 4)

### เป้าหมาย
ออกแบบโครงสร้างก่อนเขียนโค้ด:
- folder structure
- module ที่ต้องมี
- data flow (ข้อมูลไหลยังไง)
- API design (ถ้ามี)
- database schema (ถ้ามี)

### สิ่งที่ต้องทำ
1. เปิด `03-architecture/01-architect-discovery.md` — ให้ AI ช่วยออกแบบ
2. เปิด `03-architecture/02-pre-code-gate.md` — เช็ค checklist ก่อน code
3. ถ้ามีของเดิม → ให้ AI อ่านโค้ดเดิมก่อนแล้วสรุป

### เครื่องมือที่ใช้
- AI: ใช้ architect-mode → "ช่วยออกแบบ architecture ของระบบ [ชื่อ]"

---

## ขั้นตอน 6: วาง Execution Plan

### เป้าหมาย
แบ่งงานเป็น task ย่อย เรียงลำดับ ประเมินเวลา

### สิ่งที่ต้องทำ
1. แบ่ง feature เป็น task ย่อยๆ (แต่ละ task ไม่เกิน 2-4 ชั่วโมง)
2. เรียงลำดับ: อะไรทำก่อน-หลัง
3. ประเมินเวลาแต่ละ task
4. ระบุ risk/blockers ของแต่ละ task

### เครื่องมือที่ใช้
- `04-execution/01-execution-plan.md`
- AI: ใช้ estimation-mode → "ช่วยประเมินเวลางานนี้"

---

## ขั้นตอน 7: เขียนโค้ด (Code Mode)

### เป้าหมาย
เขียนโค้ดตาม architecture ที่ออกแบบไว้

### กฎ
- ห้ามเปลี่ยน architecture กลางทาง โดยไม่กลับไป Gate 3-4
- ถ้าเจออะไรไม่คาดคิด → หยุด → กลับไปวิเคราะห์
- ใช้ AI เป็น pair programmer — ให้ context + สั่ง AI เขียน
- code ต้อง clean + maintainable — ไม่ใช่แค่ "ทำงานได้"

### เครื่องมือที่ใช้
- AI: ใช้ code-mode → ให้ prompt structure (Context/Goal/Constraints/Need)

---

## ขั้นตอน 8: Review + ทดสอบ

### เป้าหมาย
ตรวจสอบว่าโค้ดถูกต้อง ปลอดภัย ไม่มี bug

### สิ่งที่ต้องทำ
1. ให้ AI review code → "review โค้ดนี้ หา bug, security issue, performance issue"
2. เขียน test (อย่างน้อย happy path + edge cases)
3. ทดสอบด้วยตัวเอง — ลอง break ระบบ

### เครื่องมือที่ใช้
- AI: ใช้ review-mode → "ช่วย review code + หา risk"

---

## ขั้นตอน 9: Deploy

### เป้าหมาย
นำขึ้นใช้งานจริงอย่างปลอดภัย

### สิ่งที่ต้องทำ
1. เปิด `04-execution/02-deployment-safety.md` — เช็ค checklist
2. ตอบคำถาม:
   - rollback (ย้อนกลับ) ได้ไหม? ทำยังไง?
   - monitor (ดูผล) อะไรหลัง deploy?
   - ถ้าพังจะแจ้งใคร?
   - deploy ตอนไหนดีที่สุด? (ไม่ใช่ peak hour)

### เครื่องมือที่ใช้
- `04-execution/02-deployment-safety.md`
- `04-execution/03-operational-thinking.md`

---

## ขั้นตอน 10: บันทึก + สรุปบทเรียน

### เป้าหมาย
เก็บสิ่งที่เรียนรู้เพื่อใช้ในอนาคต

### สิ่งที่ต้องทำ
1. บันทึก decision ที่สำคัญ → `07-logs/decisions/`
2. บันทึก lesson learned → `07-logs/lessons/`
3. ถ้ามี bug/incident → `07-logs/investigations/`
4. อัปเดต playbook ถ้ามีข้อมูลใหม่

### ตัวอย่าง lesson
```
# สิ่งที่เรียนรู้: ต้อง validate input ก่อน save เสมอ
# เพราะ: stock ติดลบเพราะไม่ได้เช็คว่าจำนวน ≥ 0
# วิธีป้องกัน: เพิ่ม validation layer ก่อน database
```

### เครื่องมือที่ใช้
- `06-templates/post-mortem.md`
- `06-templates/decision-record.md`

---

## สรุป: ทุกขั้นตอนบน 1 หน้า

```
1. รับ Req          → ฟัง + จด สิ่งที่ไม่เข้าใจ
2. Intake (Gate 1)  → ถามจนชัด ห้ามเดา
3. Analysis (Gate 2)→ วาดระบบ + หา risk
4. Tradeoff (Gate 3)→ เสนอทางเลือก → ตัดสินใจ → log
5. Architecture (Gate 4) → ออกแบบก่อน code
6. Execution Plan   → แบ่ง task + ประเมินเวลา
7. Code             → เขียนตาม design ห้ามเปลี่ยนกลางทาง
8. Review + Test    → AI review + ทดสอบเอง
9. Deploy           → checklist safety + monitor
10. Log + Learn     → บันทึก decision + lesson
```

---

## เคล็ดลับ

- ขั้นตอน 1-5 ใช้เวลา **30-60 นาที** ต่อ task
- แต่ประหยัดเวลา **หลายชั่วโมง** ที่จะต้องย้อนกลับมาแก้
- ถ้า task เล็กมาก (< 1 ชั่วโมง) → ทำ Gate 1-2 อย่างย่อก็พอ
- ถ้า task ใหญ่ (> 1 สัปดาห์) → ทำทุก Gate อย่างละเอียด
