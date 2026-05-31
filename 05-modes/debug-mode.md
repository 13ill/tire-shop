# Debug Mode — โหมดหาสาเหตุปัญหา
# เป้าหมาย: หา root cause (ต้นตอ) อย่างเป็นระบบ ไม่ใช่เดาแล้วแก้มั่ว
# ใช้เมื่อ: เจอ bug, error, ระบบทำงานผิดปกติ

---

## Flow ของ Debug Mode

```
Symptom (อาการที่เห็น)
    │
    ▼
ถาม AI: "มีสาเหตุอะไรที่เป็นไปได้?"
    │
    ▼
Hypothesis List (ลิสต์สมมติฐาน)
    │
    ▼
เก็บ Evidence (หลักฐาน — log, metric, test)
    │
    ▼
Validate ทีละข้อ
    │
    ├── พบ Root Cause → เสนอ Fix + Tradeoff
    │
    └── ยังไม่พบ → ตั้ง hypothesis ใหม่
```

---

## Prompt

```
[debug-mode]

ช่วยวิเคราะห์ปัญหานี้:

Symptom (อาการ):
- [อะไรที่ผิดปกติ]

Expected (ควรเป็น):
- [ปกติต้องทำงานยังไง]

Evidence (หลักฐานที่มี):
- [error log, screenshot, metric]

Recent Changes (เปลี่ยนอะไรไปเมื่อเร็วๆ นี้):
- [deploy, update, config change]

สิ่งที่ลองแล้ว:
- [ลองทำอะไรไปแล้วบ้าง]

ช่วย:
1. ลิสต์ hypothesis เรียงจากน่าจะใช่ที่สุด
2. แต่ละ hypothesis → บอกวิธีทดสอบ
3. command/query ที่ต้องรัน
4. ถ้าเจอ root cause → เสนอ fix + tradeoff
```

---

## หลักการสำคัญ

1. **อย่าเดาแล้วแก้มั่ว** → ตั้ง hypothesis + validate ก่อน
2. **เก็บ evidence** → log, metric, reproduce steps
3. **ถาม 5 Why** → ทำไม? ทำไม? ทำไม? จนถึง root cause
4. **แก้ root cause** → ไม่ใช่แค่แก้ symptom
5. **บันทึก** → log investigation ไว้เพื่ออนาคต

---

## เมื่อแก้เสร็จ

บันทึกลง `07-logs/investigations/` ด้วย format:
```
Symptom: [อาการ]
Root Cause: [ต้นตอ]
Fix: [วิธีแก้]
Prevention: [วิธีป้องกัน]
Lesson: [บทเรียน]
```
