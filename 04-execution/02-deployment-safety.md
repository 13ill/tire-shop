# Deployment Safety — Checklist ก่อน Deploy
# ใช้เมื่อ: จะนำโค้ดขึ้นใช้งานจริง (production)
# กฎ: ห้าม deploy ถ้ายังตอบ "ไม่" ในข้อที่มี ⚠️

---

## ก่อน Deploy

### A. Code Ready ✅
- [ ] code review ผ่านแล้ว (AI review หรือ self review)
- [ ] test ผ่านแล้ว (อย่างน้อย happy path + edge cases)
- [ ] ไม่มี console.log / debug code ค้างอยู่
- [ ] environment variables (ค่า config) ตั้งค่าครบ
- [ ] ไม่มี hardcode secrets (password, API key ใน code)

### B. Database Ready ✅
- [ ] migration (เปลี่ยนโครงสร้าง DB) ทดสอบแล้ว
- [ ] ⚠️ migration ไม่ทำลายข้อมูลเดิม (non-destructive)
- [ ] backup database ล่าสุดมีแล้ว
- [ ] ถ้า migration พัง → rollback script มีไหม?

### C. Rollback Plan ✅
- [ ] ⚠️ ถ้า deploy แล้วพัง → ย้อนกลับได้ยังไง?
- [ ] revert deploy ใช้เวลากี่นาที?
- [ ] ข้อมูลที่เปลี่ยนไประหว่าง deploy → กู้คืนได้ไหม?

### D. Monitoring Ready ✅
- [ ] รู้ว่าดูอะไรหลัง deploy (metric/log ไหน)
- [ ] alert ตั้งไว้ไหม (ถ้าพังจะรู้ทันที)
- [ ] ใครรับผิดชอบ monitor หลัง deploy?

### E. Timing & Communication ✅
- [ ] ⚠️ ไม่ deploy ตอน peak hour (ชั่วโมงที่คนใช้เยอะ)
- [ ] แจ้งคนที่เกี่ยวข้องแล้ว (ถ้ามี downtime)
- [ ] มี feature flag (สวิตช์เปิด/ปิด feature) ไหม? → ปิดไว้ก่อนได้ไหม?

---

## ระหว่าง Deploy

- [ ] ดู deploy log — มี error ไหม?
- [ ] ทดสอบ critical path (ทดลองใช้งานหลักๆ 1 รอบ)
- [ ] เช็ค metric — ปกติไหม?

---

## หลัง Deploy (30 นาทีแรก)

- [ ] ระบบทำงานปกติไหม?
- [ ] error rate สูงขึ้นไหม?
- [ ] performance (ความเร็ว) ปกติไหม?
- [ ] user report ปัญหาไหม?
- [ ] ถ้าทุกอย่างปกติ → ✅ deploy สำเร็จ

---

## ถ้ามีปัญหาหลัง Deploy

```
1. อย่า panic — ใจเย็น
2. ดู error log → ปัญหาคืออะไร?
3. impact มากไหม? (กระทบผู้ใช้กี่คน?)
4. ถ้า impact สูง → rollback ทันที → investigate ทีหลัง
5. ถ้า impact ต่ำ → investigate → hotfix
6. บันทึกลง 07-logs/investigations/
```

---

## ตัวอย่าง: Deploy ระบบ Stock

```
✅ Code: AI review ผ่าน, test 5 cases ผ่าน
✅ DB: migration เพิ่ม table stock_movements (ไม่กระทบของเดิม)
✅ Rollback: revert git + drop table ใหม่ได้ใน 5 นาที
✅ Monitor: ดู error log + stock count ว่าตรง
✅ Timing: deploy ตอน 21:00 (ร้านปิดแล้ว)
```
