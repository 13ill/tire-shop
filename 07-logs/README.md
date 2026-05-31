# 07-logs — บันทึกการตัดสินใจ + บทเรียน + การสืบค้น
# ทุกไฟล์ในโฟลเดอร์นี้ใช้ format: vXXX_YYYY-MM-DD_HHMM_หัวเรื่อง.md

---

## โครงสร้าง

```
07-logs/
├── decisions/        ← บันทึกการตัดสินใจสำคัญ (ทำไมเลือก A ไม่เลือก B)
├── lessons/          ← บทเรียนที่เรียนรู้ (สิ่งที่ผิดพลาด + วิธีป้องกัน)
└── investigations/   ← บันทึกการสืบค้นปัญหา (symptom → root cause → fix)
```

---

## Naming Convention (วิธีตั้งชื่อไฟล์)

```
vXXX_YYYY-MM-DD_HHMM_หัวเรื่อง.md

ตัวอย่าง:
v001_2026-05-29_1900_เลือก-database-supabase.md
v002_2026-06-01_1430_stock-ติดลบ-เพราะ-race-condition.md
v003_2026-06-05_1000_ไม่ควร-deploy-ตอน-peak.md
```

- **vXXX** = version number (เพิ่มทีละ 1)
- **YYYY-MM-DD** = วันที่
- **HHMM** = เวลา (24 ชั่วโมง)
- **หัวเรื่อง** = สรุปสั้นๆ ว่าเกี่ยวกับอะไร (ใช้ - แทนเว้นวรรค)

---

## เมื่อไรต้อง Log?

| สถานการณ์ | Log ที่ไหน | Template |
|---|---|---|
| ตัดสินใจ technology/approach | decisions/ | 06-templates/decision-record.md |
| เรียนรู้จากความผิดพลาด | lessons/ | 06-templates/post-mortem.md |
| สืบค้น bug/incident | investigations/ | 03-architecture/03-investigation-plan.md |
| จบ project | lessons/ | 06-templates/post-mortem.md |
| เปลี่ยน approach กลางทาง | decisions/ | 06-templates/decision-record.md |

---

## Tips

- ไม่ต้องสมบูรณ์ — เขียนสั้นๆ ก็ได้ ขอให้มี
- AI ช่วยเขียนได้ — บอก AI "ช่วย log decision นี้ให้หน่อย"
- อ่านย้อนหลังทุก 2 สัปดาห์ — ดู pattern ที่ทำผิดซ้ำ
