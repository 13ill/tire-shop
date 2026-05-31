# Template: Prompt Structure
# ใช้เมื่อ: ต้องถาม AI — ใช้ structure นี้เพื่อให้ AI ได้ context ครบ ตอบได้ดี
# หลัก: ยิ่งให้ context มาก AI ยิ่งตอบดี

---

## โครงสร้าง Prompt ที่ดี (7 ส่วน)

```
[mode ที่ต้องการ]

Context (บริบท):
- ระบบอะไร
- ทำหน้าที่อะไร
- สถานการณ์ตอนนี้เป็นยังไง

Goal (เป้าหมาย):
- อยากได้อะไร
- ผลลัพธ์ที่ต้องการ

Current Behavior (ปัจจุบันเป็นยังไง):
- ตอนนี้ทำงานยังไง / มีปัญหาอะไร

Expected Behavior (ต้องการให้เป็นยังไง):
- ถ้าเสร็จแล้วต้องเห็นอะไร

Constraints (ข้อจำกัด):
- tech / budget / เวลา / กฎที่ต้องตาม

Risk (ความเสี่ยง):
- ถ้าผิดจะเกิดอะไร

What I Need (สิ่งที่ต้องการจาก AI):
- วิเคราะห์? เสนอทางเลือก? เขียนโค้ด? review?
```

---

## ตัวอย่าง Prompt ที่ดี

```
[architect-mode]

Context:
- ระบบ stock สำหรับร้านค้าปลีก 1 ร้าน
- ใช้ Next.js + Supabase
- user 5 คน (พนักงาน)

Goal:
- เพิ่ม feature "alert เมื่อ stock ต่ำกว่า threshold"

Current:
- ตอนนี้ต้องเปิดดู dashboard เอง ไม่มี alert

Expected:
- เมื่อ stock ลดลงจนต่ำกว่า threshold → ส่ง LINE notify ให้ owner

Constraints:
- ใช้ LINE Notify API (ฟรี)
- threshold กำหนดได้แต่ละสินค้า
- ไม่อยากเพิ่ม infra (ไม่อยากมี queue/worker)

Risk:
- ถ้า LINE API ล่ม → alert ไม่ส่ง → owner ไม่รู้ stock หมด

Need:
- เสนอ architecture 2 ทางเลือก (cron vs trigger)
- พร้อม tradeoff
- แนะนำทางที่เหมาะกับ constraints
```

---

## Prompt ที่ไม่ดี vs ดี

| ❌ ไม่ดี | ✅ ดี |
|---|---|
| "ทำ stock alert" | [ตัวอย่างข้างบน — มี context ครบ] |
| "แก้ bug นี้" | "API /stock/update return 500 เมื่อ quantity = 0, expected: return validation error" |
| "เลือก database ให้" | "เลือก DB สำหรับ stock system, user 5 คน, 500 SKU, budget ต่ำ, ดูแลคนเดียว" |
