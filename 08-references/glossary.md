# คลังศัพท์ (Glossary)
# รวมคำศัพท์ทั้งหมดที่ใช้ในระบบ AI-OS — พร้อมคำอธิบาย + ตัวอย่างจริง
# ถ้าเจอคำไหนไม่เข้าใจ ดูที่นี่

---

## A-Z

| คำ | ความหมาย (ภาษาง่ายๆ) | ตัวอย่างจริง (Stock/POS) |
|---|---|---|
| ADR | Architecture Decision Record = บันทึกว่าทำไมเลือกทางนี้ | "เลือก PostgreSQL เพราะ..." |
| API | ช่องทางที่ระบบคุยกัน — เหมือนพนักงานเสิร์ฟรับ order | POS เรียก API stock เพื่อดูจำนวนสินค้า |
| Authentication (Auth) | ยืนยันตัวตน — "คุณเป็นใคร?" | login ด้วย email + password |
| Authorization | ตรวจสิทธิ์ — "คุณมีสิทธิ์ทำสิ่งนี้ไหม?" | admin ลบ stock ได้ แต่พนักงานทั่วไปลบไม่ได้ |
| Backward Compatibility | ของเก่ายังใช้ได้หลังอัปเดต | barcode เดิมยัง scan ได้หลังอัปเดตระบบ |
| Breaking Change | การเปลี่ยนแปลงที่ทำให้ของเก่าพัง | เปลี่ยน API response → frontend เก่าพัง |
| Buffer | เวลา/ทรัพยากรที่เผื่อไว้ | ประเมิน 10h → เผื่อ buffer = 15h |
| Business Intent | สิ่งที่ธุรกิจต้องการจริงๆ (ไม่ใช่แค่สิ่งที่สั่ง) | owner บอก "ทำ stock" = จริงๆ ต้องการ "รู้ว่าของเหลือเท่าไร" |
| Cache | เก็บข้อมูลไว้ชั่วคราวเพื่อโหลดเร็วขึ้น | เก็บ stock count ใน Redis แทนดึง DB ทุกครั้ง |
| CI/CD | ระบบ auto build + deploy ทุกครั้งที่ push code | push code → auto test → auto deploy |
| Concurrency | หลายคน/process ทำงานพร้อมกัน | 2 คนขายสินค้าเดียวกันพร้อมกัน |
| Constraint | ข้อจำกัด — สิ่งที่ทำไม่ได้หรือห้ามทำ | "budget ไม่เกิน 500 บาท/เดือน" |
| CRUD | Create Read Update Delete = 4 operation พื้นฐาน | เพิ่ม/ดู/แก้/ลบ สินค้า |
| Dependency | สิ่งที่ระบบเราต้องพึ่งพา — ถ้ามันพัง เราก็พัง | ระบบ stock พึ่ง database |
| Deploy | นำ code ขึ้นใช้งานจริง | อัพโค้ดขึ้น server ให้ลูกค้าใช้ |
| Downstream | ระบบที่อยู่ "หลัง" เรา — รับข้อมูลจากเรา | ระบบบัญชีดึง stock ไปคำนวณต้นทุน |
| Edge Case | กรณีพิเศษที่ไม่ค่อยเกิด แต่ถ้าเกิดอาจพัง | ลูกค้าสั่ง 0 ชิ้น หรือ -1 ชิ้น |
| ERD | Entity Relationship Diagram = ภาพ table + ความสัมพันธ์ | products ←→ stock_movements |
| Evidence | หลักฐาน — สิ่งที่ยืนยันว่าสมมติฐานถูก/ผิด | error log ที่แสดง duplicate request |
| Fallback | ทางสำรอง — ถ้าทางหลักพัง ใช้ทางนี้แทน | LINE API ล่ม → ส่ง email แทน |
| Feature Flag | สวิตช์เปิด/ปิด feature โดยไม่ต้อง deploy ใหม่ | เปิด feature "stock alert" ให้แค่ร้าน A ก่อน |
| Gate | ด่านตรวจสอบ — ต้องผ่านก่อนไปขั้นตอนถัดไป | ต้องตอบคำถาม 5 ข้อก่อนเริ่ม code |
| Hotfix | แก้ bug ด่วนบน production โดยไม่ผ่าน process ปกติ | stock ติดลบ → แก้ทันทีไม่รอรอบ deploy ปกติ |
| Hypothesis | สมมติฐาน — "คิดว่าน่าจะเป็นเพราะ..." | "stock ลด 2 น่าจะเพราะ API ถูกเรียก 2 ครั้ง" |
| Idempotency | ทำซ้ำกี่ครั้งก็ได้ผลเหมือนเดิม | กดปุ่ม "ชำระเงิน" 2 ครั้ง → ตัดเงินครั้งเดียว |
| Impact | ผลกระทบ — ถ้าเกิดขึ้นจะกระทบอะไร/ใคร | "ถ้า stock ผิด → ขายเกิน → refund + เสียชื่อ" |
| KPI | Key Performance Indicator = ตัวเลขวัดว่าสำเร็จหรือยัง | "stock ตรง 99% ทุกสิ้นเดือน" |
| Latency | ความหน่วง — เวลาที่ระบบใช้ในการตอบ | "API ตอบภายใน 500ms" |
| Legacy | ระบบเดิมที่มีอยู่แล้ว (มักจะเก่า/ยากแก้ไข) | "ระบบบัญชีเดิมที่ใช้ MySQL" |
| Migration | ย้ายข้อมูล/โครงสร้างจากที่หนึ่งไปอีกที่ | ย้าย stock จาก Excel เข้าระบบใหม่ |
| Mitigation | แผนรับมือ — ถ้า risk เกิดจะทำยังไง | "ถ้า deploy พัง → rollback ใน 5 นาที" |
| Monitor | ดูผล/เฝ้าระวัง — ตรวจว่าระบบปกติไหมหลัง deploy | ดู error rate + response time |
| MVP | Minimum Viable Product = เวอร์ชันเล็กสุดที่ใช้ได้จริง | stock: แค่เพิ่ม/ลดจำนวน + ดู report |
| N+1 Query | ปัญหา performance — query DB ทีละ 1 record ใน loop | loop 100 สินค้า × query DB ทีละตัว = 101 queries |
| Peak Hour | ชั่วโมงที่คนใช้เยอะที่สุด | 11:00-14:00 + 17:00-20:00 สำหรับร้านอาหาร |
| Race Condition | 2 process แข่งกันทำ → ผลลัพธ์ผิดพลาด | 2 คนตัด stock พร้อมกัน → stock ติดลบ |
| Rollback | ย้อนกลับไปเวอร์ชันก่อนหน้า | deploy แล้วพัง → ย้อนไปโค้ดเดิมใน 5 นาที |
| Root Cause | สาเหตุที่แท้จริงของปัญหา (ไม่ใช่แค่อาการ) | "อาการ: stock ผิด / root cause: ไม่มี lock ตอน update" |
| Scale | รองรับการเติบโต | "ตอนนี้ 5 คนใช้ แต่อนาคตอาจ 50 คน" |
| Schema | โครงสร้างของ database (table, column, relation) | products table: id, name, price, sku |
| Scope Creep | งานบานออกเกินที่ตกลงไว้ | ลูกค้าบอก "ทำ stock" แล้วเพิ่ม "ทำบัญชีด้วย" |
| SLA | Service Level Agreement = สัญญาว่าระบบจะ uptime เท่าไร | "uptime 99.9% = ล่มได้ไม่เกิน 8.7 ชั่วโมง/ปี" |
| Stakeholder | ผู้มีส่วนได้ส่วนเสีย — คนที่ได้รับผลกระทบจากงาน | owner, พนักงาน, ลูกค้า |
| Symptom | อาการ — สิ่งที่เห็น (ไม่ใช่สาเหตุ) | "stock แสดงเลขผิด" (สาเหตุอาจเป็นอย่างอื่น) |
| Technical Debt | หนี้ทางเทคนิค = code ที่ต้องแก้ทีหลัง | "เขียนแบบ quick fix ไว้ก่อน ต้องกลับมา refactor" |
| Tradeoff | สิ่งที่ต้องแลก — ได้อย่างเสียอย่าง | "เร็วแต่ไม่สวย vs สวยแต่ช้า" |
| Upstream | ระบบที่อยู่ "ก่อน" เรา — ส่งข้อมูลเข้ามาให้ | POS ส่งยอดขายมาให้ stock ตัดจำนวน |
| Validation | ตรวจสอบว่าข้อมูลถูกต้อง/ครบถ้วนก่อนบันทึก | เช็คว่า quantity ≥ 0 ก่อน save stock |
| Vendor Lock-in | ติดกับผู้ให้บริการ — ย้ายออกยาก | ใช้ Firebase → ย้ายไป PostgreSQL ยากมาก |
