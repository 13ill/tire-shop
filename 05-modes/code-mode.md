# Code Mode — โหมดเขียนโค้ด
# เป้าหมาย: เขียนโค้ดตาม architecture ที่ออกแบบไว้
# ใช้เมื่อ: ผ่าน Gate 1-4 + Pre-Code Gate แล้วเท่านั้น
# กฎ: ห้ามเข้า code-mode ถ้ายังไม่ผ่าน pre-code-gate

---

## กฎของ Code Mode

1. **เขียนตาม design** — ห้ามเปลี่ยน architecture กลางทาง
2. **ถ้าเจอสิ่งไม่คาดคิด** → หยุด → กลับไป thinking-mode
3. **ใช้ AI เป็น pair programmer** — ให้ context + สั่ง AI เขียน
4. **code ต้อง clean** — ไม่ใช่แค่ "ทำงานได้" แต่ต้อง maintain ได้
5. **commit บ่อย** — ทุก task ย่อยที่เสร็จ ต้อง commit

---

## Prompt Structure สำหรับ Code Mode

```
[code-mode]

Context:
- ระบบ: [ชื่อ]
- Module ที่กำลังทำ: [ชื่อ module]
- Tech stack: [ภาษา/framework]
- Architecture: [pattern ที่ใช้]

Task:
- [อธิบายสิ่งที่ต้อง implement]

Constraints:
- [ข้อจำกัด / style guide / pattern ที่ต้องตาม]

Expected Output:
- [อธิบายว่าผลลัพธ์ต้องเป็นยังไง]

Reference:
- [ตัวอย่าง code ที่คล้ายกันในโปรเจค / ไฟล์ที่เกี่ยวข้อง]
```

---

## Best Practices ใน Code Mode

### ก่อนเริ่มเขียน
- [ ] Pre-code gate ผ่านแล้ว
- [ ] รู้ว่า task นี้ทำอะไร (scope ชัด)
- [ ] รู้ว่าเสร็จแล้วเทสต์ยังไง

### ระหว่างเขียน
- [ ] ทำทีละ task เดียว (ไม่กระโดดข้าม)
- [ ] ทดสอบทุก task ที่ทำเสร็จ
- [ ] ถ้าติด → ถาม AI พร้อม context เต็ม
- [ ] ถ้าเจอปัญหาที่ไม่คาดคิด → หยุด → คิดก่อน

### หลังเขียน
- [ ] code review (ให้ AI review)
- [ ] test ผ่าน
- [ ] commit + push
- [ ] อัปเดต task status ใน execution plan

---

## เมื่อเจอปัญหาระหว่าง Code

```
ถ้าปัญหาเล็ก (< 30 นาที):
→ แก้เลย + บันทึก lesson

ถ้าปัญหาใหญ่ (ต้องเปลี่ยน approach):
→ หยุด code
→ กลับไป thinking-mode
→ อาจต้องย้อนไป tradeoff-mode
→ ตัดสินใจใหม่ → log decision
→ กลับมา code-mode
```
