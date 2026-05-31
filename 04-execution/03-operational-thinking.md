# Operational Thinking — คิดเชิงปฏิบัติการ
# ใช้เมื่อ: ต้องคิดว่า "หลังจาก deploy แล้ว ต้องทำอะไรต่อ?"
# หลัก: งานไม่จบที่ deploy — ต้อง monitor, maintain, respond

---

## ทำไมต้องคิดเรื่อง Operations?

```
Developer คิด: "deploy เสร็จ = จบ"
Operator คิด:  "deploy เสร็จ = เพิ่งเริ่ม"
```

เพราะหลัง deploy:
- ระบบอาจ slow ลง
- user อาจใช้ผิด
- bug อาจโผล่
- data อาจผิด
- ต้องมีคนดูแล

---

## Operational Checklist

### A. Monitoring — ดูอะไรหลัง deploy?

| # | สิ่งที่ต้อง monitor | หมายความว่า | ตัวอย่าง Stock | ดูจากไหน |
|---|---|---|---|---|
| 1 | Error rate | มี error กี่ครั้ง/นาที | error เพิ่มหลัง deploy ไหม | error log |
| 2 | Response time | ระบบตอบเร็วแค่ไหน | API ช้าลงไหม | metrics dashboard |
| 3 | Business metrics | ตัวเลขธุรกิจปกติไหม | ยอดขายยังเข้าปกติไหม | report |
| 4 | User behavior | user ใช้งานปกติไหม | มี user ที่ติดหน้าไหนนานผิดปกติ | analytics |
| 5 | Resource usage | server ทำงานหนักไหม | CPU/Memory สูงผิดปกติไหม | server dashboard |

### B. Alerting — ถ้ามีปัญหาจะรู้ได้ยังไง?

| เงื่อนไข | แจ้งเตือนยังไง | ใครรับ |
|---|---|---|
| Error rate > X ต่อนาที | LINE notify / email | เรา |
| API response > 3 วินาที | LINE notify | เรา |
| Server CPU > 80% | email | เรา |
| Stock ติดลบ | LINE notify | เรา + owner |

### C. Communication — ต้องแจ้งใครบ้าง?

| เหตุการณ์ | แจ้งใคร | แจ้งยังไง | เมื่อไร |
|---|---|---|---|
| Deploy สำเร็จ | owner / ทีม | LINE / email | ทันทีหลัง deploy |
| มี downtime | ผู้ใช้ทั้งหมด | ประกาศในแอป | ก่อน downtime |
| เจอ bug หลัง deploy | owner | LINE + สรุปสถานการณ์ | ทันทีที่พบ |
| แก้ bug เสร็จ | owner + ผู้ใช้ที่ได้รับผลกระทบ | LINE | หลังแก้เสร็จ |

### D. Peak Hours — ชั่วโมงที่ต้องระวัง

```
ระบบ Stock/POS:
- Peak: 11:00-14:00 (เวลากิน) + 17:00-20:00 (เย็น-ค่ำ)
- ห้าม deploy ตอน peak
- ถ้ามี issue ตอน peak → แก้เร็วที่สุดหรือ rollback
```

### E. Incident Response — ถ้าพังทำยังไง?

```
1. Detect  → รู้ว่าพัง (จาก alert หรือ user แจ้ง)
2. Assess  → ประเมิน impact (กระทบกี่คน? เสียเงินไหม?)
3. Decide  → rollback ทันที หรือ hotfix?
4. Act     → ทำตามที่ตัดสินใจ
5. Communicate → แจ้ง stakeholders (เจ้าของ, ผู้ใช้)
6. Fix     → แก้ root cause
7. Document → บันทึก investigation + lesson learned
```

---

## คำถามที่ต้องตอบได้ก่อนถือว่า "งานจบ"

- [ ] monitor อะไรบ้างหลัง deploy?
- [ ] ถ้าพังจะรู้ได้ยังไง? (alert)
- [ ] ถ้าพังจะแจ้งใคร? (communication plan)
- [ ] peak hour คือเมื่อไร? (ห้ามทำอะไร risky)
- [ ] ถ้าพังจะทำยังไง step by step? (incident response)
- [ ] maintenance plan มีไหม? (backup, update, ดูแลต่อ)
