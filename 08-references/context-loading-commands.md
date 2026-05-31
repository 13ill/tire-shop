# Context Loading Commands — คำสั่งให้ AI อ่าน + เข้าใจ project
# ใช้เมื่อ: เริ่ม session ใหม่ / เปิด project ใหม่ / กลับมาทำต่อ
# เป้าหมาย: AI ต้องเข้าใจ context ก่อนช่วยงาน

---

## หลักการ: Layered Loading (ไม่โหลดทั้งหมดทีเดียว)

```
ทำไมต้อง layered?
- โหลดทั้ง project ทีเดียว = เปลือง context window
- AI มี memory จำกัด (~100K tokens) → ต้องใช้อย่างฉลาด
- โหลดแค่ที่จำเป็นสำหรับ task ปัจจุบัน

Flow:
  Level 0: Root Overview (ทุก session)
    → เห็น module connections + สถานะรวม
    → ประหยัด context (~500 tokens)

  Level 1: Module ที่เกี่ยวข้อง (เมื่อสั่งทำ task)
    → เจาะลึกเฉพาะ module ที่จะแก้
    → ประหยัดกว่าอ่านทั้ง project

  Level 2: Flow/File (เมื่อต้อง debug หรือ trace)
    → ลึกสุด เจาะ flow หรือ ไฟล์เดียว
```

---

## Level 0: Root Overview — "module connections + สถานะ"

**เมื่อไร:** ทุกครั้งที่เริ่ม session ใหม่ / เปิด project
**ทำอะไร:** อ่าน `docs/architecture.md` (root level)
**ถ้ายังไม่มี:** สั่ง AI สร้างให้

```
[architect-mode]

อ่าน project นี้แล้วสร้าง docs/architecture.md ที่มี:

1. ภาพรวม: project นี้คืออะไร (1-2 ประโยค)
2. Tech Stack
3. Module Map:
   - module อะไรบ้าง
   - แต่ละ module ทำอะไร (1 บรรทัด)
   - module ไหนเชื่อมกับ module ไหน (connections)
4. Data Flow ภาพรวม (user → system → output)
5. Database: tables หลัก + relations
6. External: API/services ภายนอก

format เป็น diagram ที่อ่านเร็ว (ไม่ต้อง paragraph ยาว)
```

**Output ที่ได้ (ตัวอย่าง docs/architecture.md):**
```markdown
# Architecture: Stock System

## Tech Stack
Next.js 14 + Supabase + Prisma + TypeScript

## Module Map
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Products  │────→│   Stock     │────→│   Reports   │
└─────────────┘     └─────────────┘     └─────────────┘
       ↑                   ↑                    
┌─────────────┐     ┌─────────────┐     
│    Auth     │     │    POS      │     
└─────────────┘     └─────────────┘     

## Modules
- products/ → CRUD สินค้า, master data
- stock/ → stock movements, balances, alerts
- reports/ → dashboard, summary
- auth/ → login, roles, permissions
- pos/ → (future) point of sale integration

## Data Flow
User → Frontend → API Routes → Service Layer → Prisma → Supabase (PostgreSQL)

## Database (key tables)
products, stock_movements, stock_balances, users, roles
```

---

## Level 1: Module Level — "เจาะลึก 1 module"

**เมื่อไร:** เมื่อจะแก้ไข/เพิ่ม feature ใน module นั้น
**ทำอะไร:** อ่าน module + สร้าง `docs/modules/[module-name].md`

```
[architect-mode]

อ่าน module [ชื่อ / path] แล้วสร้าง docs/modules/[module-name].md ที่มี:

1. หน้าที่ของ module (1-2 ประโยค)
2. Files + หน้าที่แต่ละไฟล์
3. Interface:
   - Input (รับอะไรจากไหน)
   - Output (ส่งอะไรให้ใคร)
4. Dependencies (พึ่งพา module/service ไหน)
5. Dependents (module ไหนพึ่งพา module นี้)
6. Internal Flow (data ไหลข้างในยังไง)
7. Edge Cases / จุดที่ต้องระวัง
8. Gate Status: module นี้ผ่าน gate ไหนแล้ว

อัปเดต docs/architecture.md (root) ด้วยถ้ามีข้อมูลใหม่
```

---

## Level 2: Flow Level — "trace 1 action ตั้งแต่ต้นจนจบ"

```
[architect-mode]

ช่วย trace flow ของ [ชื่อ feature/action]:

ตัวอย่าง: "ตาม flow ตั้งแต่ user กดปุ่มขาย จนถึง stock ถูกตัด"

สิ่งที่อยากรู้:
1. User action → trigger อะไร?
2. Frontend ทำอะไร? (component ไหน, call API ไหน)
3. Backend ทำอะไร? (controller → service → repository)
4. Database operations (query อะไร, table ไหน)
5. Side effects (event, notification, cache invalidation)
6. Response กลับ user ยังไง?

วาดเป็น sequence diagram ด้วย
```

---

## Level 3: File Level — "เจาะลึก 1 ไฟล์"

```
[architect-mode]

ช่วยอ่านไฟล์ [path] แล้วอธิบาย:
1. ไฟล์นี้ทำอะไร?
2. function/class หลักมีอะไรบ้าง?
3. dependency ที่ import มา
4. logic ที่ซับซ้อน / ต้องระวัง
5. technical debt / ของที่ควรปรับ
```

---

## Context Loading สำหรับ "กลับมาทำต่อ"

```
ผมกลับมาทำ project [ชื่อ] ต่อ

สิ่งที่ทำไปแล้ว:
- [สรุปสั้นๆ]

สิ่งที่ต้องทำต่อ:
- [task ที่เหลือ]

ช่วย:
1. อ่าน code ส่วนที่เกี่ยวข้อง
2. สรุปสถานะปัจจุบัน
3. เสนอ next steps
```

---

## Context Loading สำหรับ "แก้ bug ในโปรเจคเดิม"

```
[debug-mode]

โปรเจค: [ชื่อ/path]
Module ที่มีปัญหา: [ชื่อ module]

ก่อนจะแก้ ช่วย:
1. อ่าน module นี้ให้เข้าใจก่อน
2. สรุปว่ามันทำงานยังไง (flow)
3. dependency คืออะไร
4. จากนั้นค่อยมาดู bug

Symptom: [อาการ]
```

---

## สร้าง Context สำหรับ Project ใหม่

เมื่อเริ่ม project ใหม่ → สร้างไฟล์ context ไว้ใน project:

```
[project-root]/
├── .windsurfrules          ← copy จาก f:\Programming\setup\.windsurfrules
├── docs/
│   ├── project-brief.md   ← สรุป project (จาก 06-templates)
│   ├── architecture.md    ← architecture ที่ AI สรุปให้
│   ├── decisions/          ← decision logs เฉพาะ project นี้
│   └── lessons/            ← lessons เฉพาะ project นี้
```

### Prompt สำหรับให้ AI สร้าง architecture doc:

```
[architect-mode]

ช่วยสร้าง architecture document สำหรับ project นี้:

Project: [ชื่อ]
Tech Stack: [stack]

สร้างเป็น docs/architecture.md ที่มี:
1. System Overview (ภาพรวม)
2. Module List (module + หน้าที่)
3. Data Flow Diagram
4. Database Schema (ERD)
5. API Endpoints
6. Deployment Architecture
7. Key Decisions

เขียนให้ AI ในอนาคตอ่านแล้วเข้าใจ project ได้ทันที
```
