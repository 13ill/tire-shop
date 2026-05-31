# Architect Discovery — ให้ AI อ่านระบบ + สรุป Architecture
# ใช้เมื่อ: ต้องเข้าใจระบบที่มีอยู่แล้ว หรือต้องออกแบบระบบใหม่
# วิธีใช้: ส่ง prompt ตาม template ด้านล่างให้ AI

---

## สถานการณ์ที่ใช้

| สถานการณ์ | ทำอะไร |
|---|---|
| มีโค้ดเดิมอยู่ แต่ไม่เข้าใจ | ให้ AI อ่านโค้ด → สรุป architecture |
| ต้องออกแบบระบบใหม่ | ให้ AI ช่วยออกแบบ → ถามกลับ → ปรับ |
| ต้องเพิ่ม feature ในระบบเดิม | ให้ AI อ่านส่วนที่เกี่ยวข้อง → เสนอจุดที่ต้องแก้ |

---

## Prompt Template: อ่านระบบเดิม

```
[architect-mode]

ช่วยอ่านโค้ดนี้แล้วสรุป architecture ให้หน่อย:

Context:
- ระบบนี้คือ: [ชื่อระบบ]
- ทำหน้าที่: [หน้าที่หลัก]
- Tech stack: [ภาษา/framework]

สิ่งที่อยากรู้:
1. โครงสร้าง folder/module เป็นยังไง?
2. data flow (ข้อมูลไหลยังไง) ตั้งแต่ user request → response?
3. มี layer (ชั้น) อะไรบ้าง? (controller/service/repository?)
4. dependency ภายในเป็นยังไง? module ไหนพึ่ง module ไหน?
5. database schema เป็นยังไง? (ถ้ามี)
6. มีจุดไหนที่เป็น bottleneck (คอขวด) หรือ risk?

ช่วยสรุปเป็น diagram ด้วยนะ
```

---

## Prompt Template: ออกแบบระบบใหม่

```
[architect-mode]

ช่วยออกแบบ architecture สำหรับระบบนี้:

ระบบ: [ชื่อ]
เป้าหมาย: [business intent]
Users: [จำนวน + ประเภท user]
Features หลัก:
- [feature 1]
- [feature 2]
- [feature 3]

Constraints:
- Tech: [ภาษา/framework ที่ต้องใช้]
- Budget: [งบ]
- Timeline: [เวลา]
- Team: [คนทำ — ตอนนี้ 1 คน + AI]

สิ่งที่ต้องการ:
1. แนะนำ tech stack + เหตุผล
2. folder structure
3. module/layer ที่ต้องมี
4. database schema (ERD)
5. API design (endpoints หลัก)
6. data flow diagram
7. deployment strategy

ช่วยเสนอมา 2 ทางเลือก พร้อม tradeoff
```

---

## Prompt Template: เพิ่ม Feature ในระบบเดิม

```
[architect-mode]

ต้องการเพิ่ม feature นี้ในระบบเดิม:

ระบบปัจจุบัน: [สรุปสั้นๆ]
Feature ใหม่: [อธิบาย feature]
Expected behavior: [ถ้าเสร็จแล้วต้องเห็นอะไร]

สิ่งที่อยากรู้:
1. ต้องแก้ module/file ไหนบ้าง?
2. ต้องเพิ่ม table/field อะไรใน database?
3. มี API ใหม่ที่ต้องสร้างไหม?
4. impact กับ module อื่นคืออะไร?
5. risk ของการเพิ่ม feature นี้?
6. ประเมินเวลา?
```

---

## Output ที่ควรได้จาก AI

หลังจาก AI สรุป architecture เสร็จ → ต้องได้:

- [ ] **System Diagram** — ภาพรวมระบบ
- [ ] **Module List** — แต่ละ module ทำอะไร
- [ ] **Data Flow** — ข้อมูลไหลยังไง
- [ ] **Tech Stack** — ใช้อะไรบ้าง
- [ ] **Risk Points** — จุดที่อาจมีปัญหา
- [ ] **Recommendations** — คำแนะนำ

---

## เมื่อเข้าใจ Architecture แล้ว → ไปต่อ

ไปที่ `03-architecture/02-pre-code-gate.md` เพื่อเช็คว่าพร้อม code หรือยัง
