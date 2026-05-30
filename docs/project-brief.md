# Project Brief: POS+Stock ร้านยาง/อะไหล่/ซ่อมบำรุง
# Created: 2026-05-29
# Status: Gate 1 ✅ → Gate 2 🔄

---

## Overview

ระบบ POS + Stock สำหรับร้านขายยาง อะไหล่รถยนต์ ซ่อมบำรุง และงานจิปาถะ (ซ่อมแอร์, ล้างแอร์)

## Business Context

- **ปัจจุบัน:** จดมือทั้งหมด ลูกค้าจำเอา ไม่มี digital
- **เป้าหมาย:** ขาย / ทำเป็น product (ร้านแรกก่อน → productize)
- **Users:** Owner + พนักงาน (ช่างไม่ยุ่งกับระบบ)

## Modules

| # | Module | คำอธิบาย | Priority |
|---|---|---|---|
| 1 | Products & Services | สินค้า+บริการ, variant, pricing tiers, custom price | Core |
| 2 | Stock | movements, balance, alerts | Core |
| 3 | POS | ขายหน้าร้าน, ออกบิล, ชำระเงิน | Core |
| 4 | Service Jobs | เปิด/ปิด job, คิว, สถานะ, test→deliver | Core |
| 5 | Customers | ชื่อ/เบอร์, ประวัติ, ค้นหา | Core |
| 6 | Vehicles | ทะเบียน/รุ่น, ประวัติรถ, ค้นหาแยก | Core |
| 7 | Photos | ก่อน/ระหว่าง/หลัง, หลายมุม, link to job | Core |
| 8 | Warranty | configurable, ผูกกับ job, เป็นรายการเพิ่ม | Important |
| 9 | Auth | owner/staff roles | Core |
| 10 | Settings | VAT, payment methods, units, custom config | Core |
| 11 | Reports | สรุปยอด, กำไร | Phase 2 |
| 12 | Boss Approval | เช็ครูปก่อนส่งมอบ | Phase 2 |
| 13 | Offline/PWA | ใช้งาน offline | Phase 2 |

## Special Requirements

- **ราคา:** ต่อรองได้ + tier (ส่ง/ปลีก) + custom
- **ค่าแรง:** บางบริการมี บางบริการไม่มี
- **หน่วยนับ:** เลือก/เพิ่มได้
- **VAT:** configurable
- **ชำระเงิน:** เปิด-ปิดช่องทาง + ราคาต่างตามช่องทางได้
- **รับประกัน:** เป็นรายการเพิ่ม ราคาแล้วแต่กำหนดหน้างาน
- **Service history:** ค้นหาทั้งทะเบียนรถ + ชื่อ/เบอร์ลูกค้า
- **Photos:** ก่อน/ระหว่าง/หลัง + หลายมุม

## Architecture Decisions

- **Offline:** Local-first (SQLite/PGlite) — data อยู่ local, sync to server
- **Photos:** Hybrid — local first → sync ไป server host (มี retention policy)
- **Product Strategy:** ทำร้านแรกก่อน → productize (แต่ออกแบบรองรับ SaaS/license)

## Tech Stack

(pending — Gate 3)

## Timeline

(pending — estimation)
