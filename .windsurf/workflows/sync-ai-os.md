---
description: Sync/update AI-OS files in current project — อัปเดต docs/ai-os/ จาก setup/ (เมื่อ rules เปลี่ยน)
---

# /sync-ai-os — อัปเดต AI-OS ใน project

## วิธีทำ:

1. ตรวจสอบว่า project มี `docs/ai-os/` folder ไหม
   - ไม่มี → แนะนำใช้ `/inject-ai-os` ก่อน

2. เทียบ version:
   - อ่าน `docs/ai-os/README.md` → ดู last_synced date
   - เทียบกับ `f:\Programming\setup\` → ดูว่ามีอะไรเปลี่ยน

3. อัปเดตไฟล์ที่เปลี่ยน:
   - แจ้งว่าไฟล์ไหนจะถูก update
   - ถาม confirm ก่อน overwrite

4. อัปเดต README.md → last_synced = วันนี้

## หมายเหตุ:
- ใช้เมื่อแก้ rules ใน setup/ แล้วอยากให้ project ได้ rules ใหม่
- ไม่จำเป็นต้องทำบ่อย — ทำเมื่อ rules เปลี่ยนจริงๆ
