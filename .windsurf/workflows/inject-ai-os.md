---
description: Inject AI-OS skills into current project — copy essential rules, checklists, and workflows from setup/ into the project's docs/ai-os/ folder
---

# /inject-ai-os — ฉีด AI-OS เข้า project

## วิธีทำ:

1. ตรวจสอบว่า project ปัจจุบันมี `docs/ai-os/` folder ไหม
   - ถ้ามี → ถามว่าจะ overwrite หรือ skip

2. สร้าง folder `docs/ai-os/` ใน project ปัจจุบัน

3. Copy ไฟล์สำคัญจาก `f:\Programming\setup\` ไปวาง:

```
docs/ai-os/
├── gate-system.md          ← จาก .windsurfrules (ส่วน gate)
├── active-reminders.md     ← 5 คำถามที่ต้องถามทุก task
├── intake-checklist.md     ← จาก 01-intake/05-deep-intake-checklist.md
├── coding-rules.md         ← จาก 04-execution/
├── modes.md                ← จาก 05-modes/ (สรุปทุก mode)
├── workflow-guide.md       ← จาก 00-identity/workflow-guide.md (สรุป)
└── README.md               ← อธิบายว่าไฟล์เหล่านี้คืออะไร + วิธี update
```

4. อัปเดต `.windsurfrules` ของ project:
   - เพิ่ม section "AI-OS Reference" ที่ชี้ไป `docs/ai-os/`
   - เพิ่มกฎ: "ก่อน task ใหม่ ให้อ่าน docs/ai-os/gate-system.md"

5. แจ้งผู้ใช้ว่า inject สำเร็จ + บอกว่าต้อง update เมื่อไร

## หมายเหตุ:
- ไฟล์ที่ copy คือ **condensed version** (สรุปสั้น) ไม่ใช่ copy ทั้งหมด
- ถ้า setup/ มี update → ใช้คำสั่ง `/sync-ai-os` เพื่ออัปเดต
- ไม่ copy ข้อมูลส่วนตัว (07-logs, operator-profile) — เฉพาะ skills/rules
