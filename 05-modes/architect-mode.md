# Architect Mode — โหมดออกแบบระบบ
# เป้าหมาย: AI ช่วยอ่านโค้ด/ระบบ แล้วสรุป architecture หรือออกแบบใหม่
# ใช้เมื่อ: ต้องเข้าใจระบบเดิม / ต้องออกแบบระบบใหม่ / ต้องเพิ่ม feature

---

## AI ทำอะไรใน Architect Mode

1. อ่านโค้ด/doc → สรุป architecture ปัจจุบัน
2. วาด system diagram
3. ระบุ module + หน้าที่
4. ระบุ data flow
5. ระบุ risk points (จุดที่อาจมีปัญหา)
6. เสนอ design ใหม่ (ถ้าต้องการ) พร้อม tradeoff

---

## Prompt Templates

### อ่านโค้ดเดิม
```
[architect-mode]

ช่วยอ่านโค้ดของ [ชื่อ project/module] แล้วสรุป:
1. โครงสร้าง folder
2. architecture pattern ที่ใช้ (MVC? layered? etc.)
3. data flow ตั้งแต่ request เข้ามา → response ออกไป
4. database schema
5. จุดที่เป็น risk / technical debt (หนี้ทางเทคนิค = code ที่ต้องแก้ทีหลัง)
```

### ออกแบบระบบใหม่
```
[architect-mode]

ออกแบบ architecture สำหรับ:
- ระบบ: [ชื่อ]
- Features: [ลิสต์]
- Users: [จำนวน + ประเภท]
- Constraints: [ข้อจำกัด]

เสนอ 2 ทางเลือก พร้อม tradeoff
```

### เพิ่ม Feature
```
[architect-mode]

ระบบปัจจุบัน: [สรุป]
ต้องเพิ่ม: [feature]

ช่วยบอก:
1. ต้องแก้ไฟล์/module ไหน?
2. ต้องเพิ่ม table/field อะไร?
3. impact กับ module อื่น?
4. risk?
```

---

## Output ที่ต้องได้

- [ ] System Diagram
- [ ] Module List + หน้าที่
- [ ] Data Flow
- [ ] Database Schema (ถ้ามี)
- [ ] Risk Points
- [ ] Recommendations / Options
