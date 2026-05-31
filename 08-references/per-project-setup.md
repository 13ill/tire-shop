# Per-Project Setup — วิธีให้ AI-OS มีผลกับทุกโปรเจค
# ใช้เมื่อ: เริ่ม project ใหม่ / ต้องการให้ AI เข้าใจ project เดิม
# หลัก: ทุก project ต้องมี "context layer" ของตัวเอง

---

## ปัญหา: ทำไม AI-OS ไม่มีผลกับ project อื่น?

```
f:\Programming\setup\.windsurfrules    ← มีผลแค่ workspace นี้
f:\projects\stock-system\              ← workspace นี้ไม่มี rules!
f:\projects\pos\                       ← workspace นี้ก็ไม่มี!
```

---

## วิธีแก้: Layered Context Architecture

### Layer 1: Global Rules (มีผลทุก session)
```
ที่: Windsurf Memory / User Rules
ใส่อะไร: กฎหลัก 7 ข้อ + Gate System + Active Reminder
สถานะ: ✅ ทำแล้ว (อยู่ใน Windsurf Memory)
```

### Layer 2: Project Context (มีผลเฉพาะ project นั้น)
```
ที่: [project-root]/.windsurfrules + [project-root]/docs/
ใส่อะไร: architecture, decisions, tech stack เฉพาะ project
สถานะ: ต้องสร้างเมื่อเริ่ม project ใหม่
```

### Layer 3: Session Context (มีผลเฉพาะ session นั้น)
```
ที่: AI chat (prompt ตอนเริ่ม session)
ใส่อะไร: task ปัจจุบัน, สิ่งที่ทำไปแล้ว, สิ่งที่ต้องทำต่อ
สถานะ: ทำทุกครั้งที่เริ่ม session ใหม่
```

---

## Checklist: เริ่ม Project ใหม่

### Step 1: สร้าง .windsurfrules ใน project

Copy จาก `f:\Programming\setup\.windsurfrules` ไปวางที่ project root:
```
f:\projects\stock-system\.windsurfrules
```

หรือสร้างเวอร์ชันย่อ:
```markdown
# Project: [ชื่อ]
# Rules: ใช้ Gate System ก่อน code เสมอ
# Context: อ่าน docs/architecture.md ก่อนเริ่มงาน
# Mode: บอก mode ที่ใช้ทุกครั้ง
# Log: บันทึก decision + lesson ใน docs/
```

### Step 2: สร้าง docs/ folder

```
[project-root]/
├── .windsurfrules
├── docs/
│   ├── project-brief.md       ← สรุป project (จาก template)
│   ├── architecture.md        ← architecture (ให้ AI สร้าง/อัปเดต)
│   ├── system-map.md          ← upstream/downstream/dependency
│   ├── decisions/             ← decision logs
│   │   └── v001_xxxx.md
│   └── lessons/               ← lessons learned
│       └── v001_xxxx.md
```

### Step 3: ให้ AI สร้าง Architecture Doc

```
[architect-mode]

โปรเจคนี้คือ [ชื่อ], ใช้ [tech stack]
ช่วยอ่าน codebase แล้วสร้าง docs/architecture.md ที่มี:
1. ภาพรวมระบบ
2. Module list + หน้าที่
3. Data flow
4. Database schema
5. API endpoints
6. Deployment
```

### Step 4: เริ่มทุก session ด้วย context

```
กลับมาทำ [project] ต่อ
อ่าน docs/architecture.md แล้วสรุปสถานะให้หน่อย
task ที่ต้องทำ: [อะไร]
```

---

## Checklist: กลับมาแก้ Project เดิม

1. เปิด project ใน Windsurf
2. ถ้ามี `docs/architecture.md` → สั่ง AI อ่านก่อน
3. ถ้าไม่มี → สั่ง AI สร้างให้ (ใช้ context-loading-commands Level 1)
4. ระบุ task ที่ต้องทำ
5. ผ่าน Gate System ตามปกติ

---

## เมื่อไรต้องอัปเดต docs/?

| เหตุการณ์ | อัปเดตอะไร |
|---|---|
| เพิ่ม module ใหม่ | architecture.md |
| เปลี่ยน tech/approach | architecture.md + decision log |
| เจอ bug สำคัญ | lessons/ |
| ตัดสินใจสำคัญ | decisions/ |
| เปลี่ยน DB schema | architecture.md |
| เพิ่ม API | architecture.md |

---

## สรุป Flow

```
เริ่ม Project ใหม่:
  copy .windsurfrules → สร้าง docs/ → AI สร้าง architecture.md → เริ่ม Gate

กลับมาทำต่อ:
  เปิด project → AI อ่าน docs/ → ระบุ task → Gate System → ทำงาน

จบ task:
  log decision/lesson → อัปเดต docs/ ถ้าจำเป็น
```
