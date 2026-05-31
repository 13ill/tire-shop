# Operational KPI — ตัวเลขวัดผลการพัฒนาตัวเอง
# ใช้เมื่อ: ทบทวนทุก 2 สัปดาห์ ว่าดีขึ้นจริงไหม
# หลัก: "ถ้าวัดไม่ได้ = พัฒนาไม่ได้"

---

## KPI หลัก (ติดตามทุก 2 สัปดาห์)

### A. Process KPI — "ใช้ระบบจริงไหม?"

| # | Metric | เป้าหมาย | วัดจาก |
|---|---|---|---|
| 1 | Gate pass rate | 100% tasks ผ่าน Gate 1 | นับ task ที่กรอก intake checklist |
| 2 | Decision logs | ≥2 ต่อสัปดาห์ | นับไฟล์ใน 07-logs/decisions/ |
| 3 | Structured prompt rate | 100% | ทุก prompt มี Context/Goal/Need |
| 4 | Question asked to owner | ≥3 คำถามต่อ task | นับจาก chat history |

### B. Quality KPI — "งานดีขึ้นไหม?"

| # | Metric | เป้าหมาย | วัดจาก |
|---|---|---|---|
| 5 | Rework rate | <20% | จำนวน task ที่ต้องแก้ / task ทั้งหมด |
| 6 | Bug after deploy | <1 ต่อ deploy | นับ bug ที่ user report หลัง deploy |
| 7 | Estimation accuracy | ±30% (Phase 1) → ±20% (Phase 2) | เทียบเวลาจริง vs ประเมิน |

### C. Speed KPI — "เร็วขึ้นไหม?"

| # | Metric | เป้าหมาย | วัดจาก |
|---|---|---|---|
| 8 | Time per task (avg) | ลดลง 20% ทุกเดือน | บันทึกเวลาเริ่ม-จบ |
| 9 | Gate 1-4 time | <60 นาที สำหรับ task ปกติ | จับเวลา intake→ready-to-code |
| 10 | AI delegation success | ≥80% | task ที่ AI ทำถูกต้อง / task ที่สั่ง |

### D. Growth KPI — "เติบโตไหม?"

| # | Metric | เป้าหมาย | วัดจาก |
|---|---|---|---|
| 11 | Maturity level | +1 level ทุก 3 เดือน | self-assessment |
| 12 | Negotiation success | ≥1 ครั้ง/เดือน | ต่อรอง scope/deadline สำเร็จ |
| 13 | Product progress | ตาม roadmap | milestone ที่ทำได้ |

---

## Tracking Template (กรอกทุก 2 สัปดาห์)

```
# KPI Review — สัปดาห์ที่ ___
# วันที่: _______________

## Process
- Gate pass rate: ___% 
- Decision logs: ___ entries
- Structured prompts: ___% 
- Questions to owner: ___ avg/task

## Quality
- Rework rate: ___%
- Bugs after deploy: ___
- Estimation accuracy: ±___%

## Speed
- Avg time/task: ___ hours
- Gate time: ___ minutes
- AI delegation success: ___%

## Growth
- Maturity level: ___/5
- Negotiation: ___ ครั้ง
- Product milestone: ___

## Reflection
- สิ่งที่ดีขึ้น: ___
- สิ่งที่ต้องปรับ: ___
- Focus สัปดาห์หน้า: ___
```

---

## หมายเหตุ

- ไม่ต้อง perfect ตั้งแต่วันแรก — ค่อยๆ ดีขึ้นเรื่อยๆ
- เทียบกับตัวเองเดือนก่อน ไม่ใช่คนอื่น
- ถ้า metric ไม่ขยับ → ดู process ว่าขาดตรงไหน
