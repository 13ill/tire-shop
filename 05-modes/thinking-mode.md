# Thinking Mode — โหมดคิดวิเคราะห์
# เป้าหมาย: คิดก่อนทำ ห้าม execute ห้ามเขียนโค้ด
# ใช้เมื่อ: เริ่มต้น task ใหม่ / เจอปัญหาที่ยังไม่เข้าใจ / ต้องวิเคราะห์

---

## กฎของ Thinking Mode

1. **ห้ามเขียนโค้ด** — คิดอย่างเดียว
2. **ห้ามตัดสินใจทันที** — ลิสต์ทางเลือกก่อน
3. **ถามคำถาม** — อะไรที่ยังไม่รู้?
4. **วาดภาพ** — system map, flow, diagram
5. **Output = สรุปความเข้าใจ + คำถามที่ต้องตอบ**

---

## AI ต้องทำอะไรใน Thinking Mode

```
1. สรุปว่าเข้าใจอะไร (จาก context ที่ได้)
2. ลิสต์สิ่งที่ยังไม่รู้ / ไม่ชัด
3. ตั้งคำถามกลับ (ถ้าข้อมูลไม่พอ)
4. วิเคราะห์ upstream/downstream/dependency
5. ระบุ risk เบื้องต้น
6. เสนอทิศทาง (ไม่ใช่ solution ตรงๆ)
```

---

## Prompt สำหรับเข้า Thinking Mode

```
[thinking-mode]

ช่วยคิดเรื่องนี้ก่อน อย่าเพิ่งลงมือทำ:

Context: [อธิบายสถานการณ์]
Task: [สิ่งที่ต้องทำ]

สิ่งที่อยากได้:
1. สรุปว่าเข้าใจอะไร
2. อะไรที่ยังไม่ชัด
3. ระบบ/module ไหนที่เกี่ยว
4. risk เบื้องต้น
5. ทิศทางที่เป็นไปได้ (ยังไม่ต้องตัดสินใจ)
```

---

## ตัวอย่าง Output

```
📋 สรุปที่เข้าใจ:
- ต้องเพิ่ม feature "alert stock ต่ำ" ในระบบ stock
- ส่ง LINE notify เมื่อ stock ต่ำกว่า threshold

❓ สิ่งที่ยังไม่ชัด:
- threshold เป็นค่าเดียวกันทุกสินค้า หรือกำหนดแยก?
- alert ส่งถึงใคร? owner คนเดียว หรือหลายคน?
- ตรวจ stock ทุกกี่นาที? หรือ trigger ตอน stock เปลี่ยน?

🔗 ระบบที่เกี่ยว:
- stock_movements table (upstream — เป็น trigger)
- LINE Notify API (dependency)
- User settings (ต้องเก็บ LINE token)

⚠️ Risk:
- ถ้า LINE API ล่ม → alert ไม่ส่ง → ต้องมี retry/fallback
- ถ้า threshold ผิด → alert spam → user ปิด notification

🧭 ทิศทาง:
- ทาง A: cron job ตรวจทุก 5 นาที (ง่าย แต่ delay)
- ทาง B: trigger เมื่อ stock_movement เกิด (real-time แต่ซับซ้อนกว่า)
→ ต้องตัดสินใจใน tradeoff-mode
```
