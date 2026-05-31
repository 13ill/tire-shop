# Dependency Analysis — วิเคราะห์สิ่งที่ระบบพึ่งพา
# ใช้เมื่อ: ทำ System Map แล้ว → ต้องเข้าใจลึกว่าพึ่งพาอะไรบ้าง + ถ้าพังจะเกิดอะไร

---

## Dependency คืออะไร?

สิ่งที่ระบบเรา **ต้องพึ่งพา** เพื่อทำงานได้ — ถ้ามันพัง/ล่ม/เปลี่ยน → ระบบเราก็ทำงานไม่ได้

### ประเภทของ Dependency

| ประเภท | หมายความว่า | ตัวอย่าง |
|---|---|---|
| Infrastructure | โครงสร้างพื้นฐาน (เซิร์ฟเวอร์, database) | PostgreSQL, Redis, AWS |
| Internal Service | service อื่นในบริษัทเดียวกัน | auth service, notification service |
| External API | API จากภายนอกที่เราเรียกใช้ | Payment gateway, LINE API, SMS |
| Library/Package | library ที่ใช้ใน code | express, prisma, react |
| Data | ข้อมูลที่ต้องมีก่อนระบบจะทำงาน | product master, user list |
| Human | คนที่ต้องทำอะไรบางอย่างก่อน | admin ต้อง approve, owner ต้อง confirm |

---

## Template: Dependency Analysis

### ระบบ: _______________

| # | Dependency | ประเภท | ทำหน้าที่อะไรให้เรา | ถ้ามันพัง เราจะเป็นยังไง | มี fallback ไหม | ใครดูแล |
|---|---|---|---|---|---|---|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |
| 5 | | | | | | |

---

### ตัวอย่าง: ระบบ Stock

| # | Dependency | ประเภท | ทำหน้าที่อะไร | ถ้าพัง เราเป็นยังไง | Fallback | ใครดูแล |
|---|---|---|---|---|---|---|
| 1 | PostgreSQL | Infrastructure | เก็บข้อมูล stock ทั้งหมด | stock ใช้ไม่ได้เลย, ขายไม่ได้ | ไม่มี (critical) | เรา |
| 2 | Redis | Infrastructure | cache stock count ให้โหลดเร็ว | โหลดช้าลง แต่ยังทำงานได้ | fallback อ่านจาก DB ตรง | เรา |
| 3 | Auth Service | Internal | ยืนยันตัวตนผู้ใช้ | login ไม่ได้ = ใช้ระบบไม่ได้ | ไม่มี (critical) | ทีม platform |
| 4 | LINE Notify API | External | ส่ง alert เมื่อ stock ต่ำ | alert ไม่ส่ง แต่ระบบหลักยังทำงาน | retry 3 ครั้ง | LINE (ควบคุมไม่ได้) |
| 5 | Product Master data | Data | รายชื่อสินค้าทั้งหมด | ถ้าไม่มี → สร้าง stock record ไม่ได้ | ต้อง import ก่อน | admin |

---

## Dependency Risk Matrix

จัดลำดับ dependency ตาม **ความเสี่ยง**:

| Dependency | ถ้าพัง (Impact) | โอกาสพัง (Likelihood) | ระดับ Risk | ต้องทำอะไร |
|---|---|---|---|---|
| PostgreSQL | สูงมาก (ระบบล่ม) | ต่ำ (มี managed service) | 🟡 Medium | backup ทุกวัน |
| Auth Service | สูงมาก (ใช้ไม่ได้) | ต่ำ | 🟡 Medium | monitor uptime |
| LINE API | ต่ำ (แค่ alert ไม่ส่ง) | กลาง (third-party) | 🟢 Low | retry + fallback email |
| Redis | กลาง (ช้าลง) | ต่ำ | 🟢 Low | fallback ไป DB |

---

## คำถามที่ต้องตอบได้

- [ ] ระบบเราพึ่งพาอะไรบ้าง? (ลิสต์ครบ)
- [ ] ถ้าแต่ละ dependency พัง → ระบบเราเป็นยังไง?
- [ ] มี fallback (ทางสำรอง) สำหรับ dependency สำคัญไหม?
- [ ] dependency ไหนที่เราควบคุมไม่ได้? (third-party)
- [ ] มี dependency ซ่อนอยู่ที่มองข้ามไหม? (เช่น DNS, SSL cert, cron job)

---

## เมื่อเสร็จ → ไปขั้นตอนถัดไป

ไปที่ `02-analysis/03-risk-analysis.md` เพื่อประเมินความเสี่ยงโดยรวม
