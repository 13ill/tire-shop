---
description: Remove AI-OS files from current project — ลบ docs/ai-os/ folder ออกจาก project (ไม่กระทบ docs อื่น)
---

# /remove-ai-os — ลบ AI-OS ออกจาก project

## วิธีทำ:

1. ตรวจสอบว่า project มี `docs/ai-os/` folder ไหม
   - ไม่มี → แจ้งว่า "ไม่มี AI-OS ใน project นี้"

2. ถาม confirm: "ต้องการลบ docs/ai-os/ ออกจาก project นี้ใช่ไหม?"
   - แจ้งว่า: `.windsurfrules` ของ project จะยังคงอยู่ (ไม่ลบ)
   - แจ้งว่า: `docs/` อื่นๆ จะไม่ถูกกระทบ

3. ลบ folder `docs/ai-os/` ทั้งหมด

4. อัปเดต `.windsurfrules`:
   - ลบ section "AI-OS Reference" ที่ชี้ไป docs/ai-os/

5. แจ้งผู้ใช้ว่าลบสำเร็จ

## หมายเหตุ:
- ใช้เมื่อส่งงานให้ลูกค้าที่ไม่ต้องการ AI-OS rules ใน codebase
- หรือเมื่อ project ไม่ต้องการ gate system แล้ว
- `.windsurfrules` พื้นฐาน (tech stack, coding rules) จะยังอยู่
