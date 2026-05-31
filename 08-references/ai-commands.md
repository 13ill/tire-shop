# AI Commands — คำสั่ง AI สำเร็จรูป
# ใช้เมื่อ: ต้องการสั่ง AI เร็วๆ โดยไม่ต้องพิมพ์ยาว
# วิธีใช้: copy prompt ไปวางใน chat แล้วเติมข้อมูล

---

## Quick Commands

### เริ่ม Task ใหม่
```
[intake-mode] ได้รับ task: "[วาง requirement]"
ช่วยถาม requirement เจาะลึก + ลิสต์สิ่งที่ยังไม่ชัด
```

### คิดก่อนทำ
```
[thinking-mode] ต้องทำ: "[task]"
ช่วยวิเคราะห์ก่อน: system ที่เกี่ยว, risk, ทิศทาง — อย่าเพิ่ง execute
```

### ออกแบบ Architecture
```
[architect-mode] ช่วยออกแบบระบบ "[ชื่อ]":
Features: [ลิสต์]
Users: [จำนวน]
Tech: [stack]
เสนอ 2 ทางเลือก + tradeoff
```

### เสนอ Tradeoff
```
[tradeoff-mode] ต้องเลือก: "[สิ่งที่ต้องตัดสินใจ]"
Context: [สถานการณ์]
Constraints: [ข้อจำกัด]
ช่วยเสนอทางเลือก + เปรียบเทียบ 6 มิติ
```

### ประเมินเวลา
```
[estimation-mode] ช่วยประเมิน: "[งาน]"
Scope: [ขอบเขต]
Tech: [technology]
ช่วยแบ่ง task + ประเมินเวลา + แนะนำราคา
```

### Debug
```
[debug-mode]
Symptom: [อาการ]
Expected: [ควรเป็นยังไง]
Evidence: [log/screenshot]
Recent changes: [เปลี่ยนอะไรไป]
ช่วยลิสต์ hypothesis + วิธีทดสอบ
```

### Review Code
```
[review-mode] ช่วย review code นี้:
ตรวจ: bug, security, performance, error handling, edge cases
สรุปเป็น 🔴 Critical / 🟡 Warning / 🟢 Suggestion
ให้คะแนนพร้อม deploy: X/10
```

### Coach ฉัน
```
[coaching-mode] ฉันต้อง: "[สิ่งที่ต้องทำ]"
ช่วยถามคำถามกลับเพื่อฝึกให้ฉันคิดเอง
อย่าตอบตรง — ถามก่อน
```

### Log Decision
```
ช่วย log decision:
ตัดสินใจ: [อะไร]
ทางเลือก: [A vs B vs C]
เลือก: [ทางไหน]
เหตุผล: [ทำไม]
บันทึกเป็น format decision-record ที่ 07-logs/decisions/
```

### สรุป Lesson
```
ช่วย log lesson learned:
เกิดอะไร: [สรุป]
ผิดตรงไหน: [อะไร]
เรียนรู้อะไร: [บทเรียน]
ป้องกันยังไง: [วิธี]
บันทึกที่ 07-logs/lessons/
```

### ช่วยตั้งคำถามถาม owner
```
ต้องถาม owner เรื่อง: "[หัวข้อ]"
ช่วยร่าง 5 คำถามที่ดี ภาษาไทย ใช้ส่ง LINE/chat ได้เลย
```

---

## ปิด Mode

```
"ตอบเลย" — ปิด coaching mode ตอบตรง
"ไม่ต้อง coach" — AI ตอบปกติ
"ด่วน" — ข้าม gate ทำเลย (ใช้เมื่อจำเป็นจริงๆ)
```
