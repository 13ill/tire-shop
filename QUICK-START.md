# 🚀 QUICK START — อ่านจบใน 5 นาที
# ไม่ต้องกระโดดไปไฟล์อื่น ทุกอย่างอยู่ที่นี่

---

## คุณคือใคร + ระบบนี้คืออะไร

- คุณ = Developer → กำลัง level up เป็น Business Owner / Solution Architect
- ระบบนี้ = AI-OS (AI-Native Operational System)
- เป้าหมาย = ทำงานน้อยลง คิดมากขึ้น ใช้ AI ทำแทน 80% ของงาน
- Timeline = 9 เดือน (3 เดือนแรก = ฝึกคิด → 6 เดือนหลัง = สร้าง product)

---

## 3 สิ่งที่ต้องจำ

1. **ห้ามลงมือทำทันที** — คิดก่อนเสมอ (Gate System)
2. **AI จะถาม 5 คำถามทุก task ใหม่** — ตอบให้ครบก่อนเริ่ม
3. **ทุกการตัดสินใจต้อง log** — ไว้ดูย้อนหลัง

---

## เมื่อเริ่ม Project ใหม่ → ทำ 4 ขั้นตอนนี้

### ขั้นตอน 1: Setup Project

```
สร้าง .windsurfrules ที่ project root
(copy จาก f:\Programming\setup\08-references\project-windsurfrules-template.md)
```

### ขั้นตอน 2: สร้าง Architecture Doc

```
สั่ง AI:
"[architect-mode] อ่าน project นี้แล้วสร้าง docs/architecture.md"

→ AI จะสร้างไฟล์ที่มี: module map, data flow, tech stack, DB schema
→ ทุก session ถัดไป AI อ่านไฟล์นี้แทนอ่าน codebase ทั้งหมด (เร็ว+ประหยัด)
```

### ขั้นตอน 3: เริ่ม Task → ตอบ 5 คำถาม

AI จะถามอัตโนมัติ:
1. เป้าหมายจริงของงานนี้คืออะไร?
2. success วัดจากอะไร?
3. ระบบ/module ไหนที่เกี่ยวข้อง?
4. ถ้าพังจะเกิดอะไร?
5. scope คืออะไร อะไรที่ไม่ทำ?

→ ตอบครบ = ผ่าน Gate 1
→ ตอบไม่ได้ = ต้องถาม owner ก่อน

### ขั้นตอน 4: ทำงานตาม Flow

```
Gate 1: ถามจนชัด (Intake)
Gate 2: วิเคราะห์ระบบ + risk (Analysis)
Gate 3: เลือก approach (Tradeoff) → log decision
Gate 4: ออกแบบ architecture → เข้า code mode
```

---

## เมื่อกลับมาทำ Project เดิม → ทำ 2 ขั้นตอน

```
1. สั่ง AI: "กลับมาทำ [project] ต่อ อ่าน docs/architecture.md แล้วสรุปสถานะ"
2. ระบุ task → AI ถาม Active Reminder → ทำงาน
```

---

## เมื่อแก้ Module → AI จะ

```
1. เช็คว่ามี docs/modules/[module].md ไหม
   - ไม่มี → อ่าน module + สร้างให้
   - มี → อ่าน doc
2. ถาม Active Reminder
3. เช็ค Gate Status
4. เริ่มทำงาน
```

---

## เมื่อด่วน (Hotfix) → Quick Gate

```
สั่ง: "ด่วน [อาการ]"

AI จะถามแค่ 4 ข้อ:
1. อาการ (symptom)?
2. ผลกระทบ (impact)?
3. module ไหน?
4. rollback ได้ไหม?

→ แล้วเสนอ fix ทันที
```

---

## AI Commands สำเร็จรูป (copy ไปใช้ได้เลย)

| ต้องการทำ | สั่ง |
|---|---|
| เริ่ม task ใหม่ | `[intake-mode] ได้รับ task: "[req]"` |
| ให้คิดก่อนทำ | `[thinking-mode] ต้องทำ: "[task]"` |
| ออกแบบ | `[architect-mode] ออกแบบระบบ "[ชื่อ]"` |
| เปรียบเทียบทางเลือก | `[tradeoff-mode] ต้องเลือก: "[X]"` |
| ประเมินเวลา | `[estimation-mode] ประเมิน: "[งาน]"` |
| Debug | `[debug-mode] Symptom: "[อาการ]"` |
| Review code | `[review-mode] review code นี้` |
| ฝึกคิด | `[coaching-mode] ฉันต้อง: "[X]"` |
| Log decision | `ช่วย log decision: [อะไร]` |
| อ่าน project | `[architect-mode] อ่าน project แล้วสรุป` |
| อ่าน module | `[architect-mode] อ่าน module [X] แล้วสรุป` |

---

## โครงสร้างไฟล์ (reference — ไม่ต้องจำ)

```
f:\Programming\setup\
├── QUICK-START.md          ← 📍 คุณอยู่ที่นี่
├── .windsurfrules          ← กฎหลักของ AI
├── 00-identity/            ← ตัวตน + หลักคิด + roadmap
├── 01-intake/              ← วิธีรับ + ถาม requirement
├── 02-analysis/            ← วิธีวิเคราะห์ระบบ + risk
├── 03-architecture/        ← วิธีออกแบบ + investigation
├── 04-execution/           ← วิธีวาง plan + deploy
├── 05-modes/               ← AI modes ทั้งหมด
├── 06-templates/           ← template เอกสาร
├── 07-logs/                ← decision + lesson logs
├── 08-references/          ← คลังข้อมูล + คำสั่ง AI
└── 09-project-playbooks/   ← playbook ตาม project type
```

---

## ถ้าสงสัย → เปิดไฟล์เหล่านี้

| สงสัยเรื่อง | เปิด |
|---|---|
| ขั้นตอนทำงานละเอียด | `00-identity/workflow-guide.md` |
| ไม่รู้ศัพท์ | `08-references/glossary.md` |
| ไม่รู้จะถามอะไร | `08-references/question-bank.md` |
| ต้อง setup project ใหม่ | `08-references/per-project-setup.md` |
| ต้องต่อรอง | `08-references/negotiation-guide.md` |
| ต้องประเมินเวลา | `06-templates/estimation.md` |
| AI เตือนอะไร ทำไม | `08-references/gate-enforcement.md` |
