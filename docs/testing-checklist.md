# 📋 Comprehensive Testing Checklist - Tire Shop POS System

## 🎯 ภาพรวมการทดสอบ
คู่มือนี้สำหรับทดสอบระบบ POS+Stock สำหรับร้านยาง/อะไหล่/ซ่อมบำรุงอย่างครบถ้วน

---

## 📋 รายการตรวจสอบก่อนเริ่ม (Pre-Test Checklist)

### ✅ Environment Setup
- [ ] **Backend Server**: ทำงานที่ http://localhost:3000
- [ ] **Frontend Server**: ทำงานที่ http://localhost:5173  
- [ ] **Database**: MySQL/MariaDB ทำงานและมี tables ครบถ้วน
- [ ] **Seed Data**: มีข้อมูลเริ่มต้น (users, settings, etc.)
- [ ] **Network**: ไม่มีปัญหา connection ระหว่าง frontend-backend

### ✅ Browser & Tools
- [ ] **Browser**: Chrome/Firefox ล่าสุด
- [ ] **DevTools**: เปิด Console และ Network tabs
- [ ] **Screen Resolution**: ทดสอบที่ 1920x1080 และ responsive sizes

---

## 🔐 Phase 1: Authentication System

### 1.1 Login Functionality
**Test Case**: Login ด้วยข้อมูลถูกต้อง
- [ ] **Input**: Username: `owner`, Password: `admin123`
- [ ] **Expected**: Login สำเร็จ, redirect ไป Dashboard
- [ ] **Actual**: _________________________
- [ ] **Status**: ✅ Pass / ❌ Fail
- [ ] **Notes**: _________________________

**Test Case**: Login ด้วยข้อมูลผิด
- [ ] **Input**: Username: `wrong`, Password: `wrong`
- [ ] **Expected**: แสดง error message, ไม่ redirect
- [ ] **Actual**: _________________________
- [ ] **Status**: ✅ Pass / ❌ Fail
- [ ] **Notes**: _________________________

**Test Case**: Login ด้วย username ถูก password ผิด
- [ ] **Input**: Username: `owner`, Password: `wrong`
- [ ] **Expected**: แสดง error message
- [ ] **Actual**: _________________________
- [ ] **Status**: ✅ Pass / ❌ Fail
- [ ] **Notes**: _________________________

### 1.2 User Interface
- [ ] **User Avatar**: แสดงตัวอักษรแรกของ username/displayName
- [ ] **User Info**: แสดง "owner" และ "เจ้าของร้าน"
- [ ] **Logout Button**: ทำงานและกลับไปหน้า login
- [ ] **Menu Navigation**: เมนูทั้งหมดคลิกได้และไปหน้าที่ถูกต้อง

---

## ⚙️ Phase 2: Settings Module

### 2.1 General Settings Tab
**Test Case**: แก้ไขข้อมูลร้าน
- [ ] **Action**: แก้ไขชื่อร้าน: "ร้านยางทดสอบ"
- [ ] **Action**: แก้ไข VAT: 7% → 7.5%
- [ ] **Action**: แก้ไขสกุลเงิน: THB → USD
- [ ] **Expected**: บันทึกสำเร็จ, แสดงข้อมูลใหม่
- [ ] **Actual**: _________________________
- [ ] **Status**: ✅ Pass / ❌ Fail
- [ ] **Notes**: _________________________

### 2.2 Payment Methods Tab
**Test Case**: เพิ่มวิธีการชำระเงินใหม่
- [ ] **Action**: เพิ่ม "QR Code", surcharge 1%
- [ ] **Expected**: แสดงในรายการ, สถานะ active
- [ ] **Actual**: _________________________
- [ ] **Status**: ✅ Pass / ❌ Fail
- [ ] **Notes**: _________________________

**Test Case**: แก้ไขวิธีการชำระเงิน
- [ ] **Action**: แก้ไข "QR Code" เป็น "PromptPay", surcharge 1.5%
- [ ] **Expected**: อัพเดทข้อมูลสำเร็จ
- [ ] **Actual**: _________________________
- [ ] **Status**: ✅ Pass / ❌ Fail
- [ ] **Notes**: _________________________

**Test Case**: ลบวิธีการชำระเงิน
- [ ] **Action**: ลบ "PromptPay"
- [ ] **Expected**: ยืนยันการลบ, หายไปจากรายการ
- [ ] **Actual**: _________________________
- [ ] **Status**: ✅ Pass / ❌ Fail
- [ ] **Notes**: _________________________

### 2.3 Units Tab
**Test Case**: เพิ่มหน่วยนับใหม่
- [ ] **Action**: เพิ่ม "ชุด", ทำเป็น default
- [ ] **Expected**: แสดงในรายการ, มีเครื่องหมาย default
- [ ] **Actual**: _________________________
- [ ] **Status**: ✅ Pass / ❌ Fail
- [ ] **Notes**: _________________________

---

## 📦 Phase 3: Categories Module

### 3.1 Create Categories
**Test Case**: สร้างหมวดหมู่สินค้าหลัก
- [ ] **Action**: สร้าง "ยางรถยนต์" (product type)
- [ ] **Expected**: แสดงในรายการ, ไม่มี parent
- [ ] **Actual**: _________________________
- [ ] **Status**: ✅ Pass / ❌ Fail
- [ ] **Notes**: _________________________

**Test Case**: สร้างหมวดหมู่ย่อย
- [ ] **Action**: สร้าง "ล้อแม็กซ์" ใต้ "ยางรถยนต์"
- [ ] **Expected**: แสดงเป็น child, มี parent
- [ ] **Actual**: _________________________
- [ ] **Status**: ✅ Pass / ❌ Fail
- [ ] **Notes**: _________________________

**Test Case**: สร้างหมวดหมู่บริการ
- [ ] **Action**: สร้าง "บริการเปลี่ยนยาง" (service type)
- [ ] **Expected**: แสดงใน service categories
- [ ] **Actual**: _________________________
- [ ] **Status**: ✅ Pass / ❌ Fail
- [ ] **Notes**: _________________________

### 3.2 Edit & Delete Categories
- [ ] **Edit**: แก้ไขชื่อหมวดหมู่สำเร็จ
- [ ] **Delete**: ลบหมวดหมู่ที่ไม่มีลูกสำเร็จ
- [ ] **Delete Prevention**: ไม่สามารถลบหมวดหมู่ที่มีลูก

---

## 🛍️ Phase 4: Products & Services Module

### 4.1 Add Products
**Test Case**: เพิ่มสินค้าใหม่
- [ ] **Action**: 
  - ชื่อ: "ยาง Bridgestone 205/55R16"
  - ประเภท: สินค้า
  - หมวดหมู่: "ยางรถยนต์"
  - ราคาขายปลีก: 2,500
  - ราคาทุน: 1,800
  - SKU: BS20555R16
  - สต็อกขั้นต่ำ: 10
- [ ] **Expected**: บันทึกสำเร็จ, แสดงในรายการ
- [ ] **Actual**: _________________________
- [ ] **Status**: ✅ Pass / ❌ Fail
- [ ] **Notes**: _________________________

**Test Case**: เพิ่มสินค้าที่มี variants
- [ ] **Action**: เพิ่ม "น้ำมันเครื่อง Mobil" มีขนาด 1L, 4L, 20L
- [ ] **Expected**: แสดง has_variants = true
- [ ] **Actual**: _________________________
- [ ] **Status**: ✅ Pass / ❌ Fail
- [ ] **Notes**: _________________________

### 4.2 Add Services
**Test Case**: เพิ่มบริการใหม่
- [ ] **Action**:
  - ชื่อ: "บริการเปลี่ยนยาง 4 ล้อ"
  - ประเภท: บริการ
  - หมวดหมู่: "บริการเปลี่ยนยาง"
  - ราคาแรงงาน: 200
  - เปิด "มีค่าแรงงาน"
- [ ] **Expected**: บันทึกสำเร็จ, แสดงราคาแรงงาน
- [ ] **Actual**: _________________________
- [ ] **Status**: ✅ Pass / ❌ Fail
- [ ] **Notes**: _________________________

### 4.3 Search & Filter
- [ ] **Search by Name**: ค้นหา "Bridgestone" พบสินค้า
- [ ] **Filter by Type**: กรองเฉพาะ "สินค้า"
- [ ] **Filter by Category**: กรองตามหมวดหมู่
- [ ] **Pagination**: ทำงานถูกต้อง
- [ ] **Sort**: เรียงตามชื่อ/ราคา/วันที่สร้าง

---

## 📊 Phase 5: Stock Management Module

### 5.1 Stock Balance Tab
**Test Case**: ดูคงเหลือปัจจุบัน
- [ ] **Expected**: แสดงสินค้าทั้งหมดที่สร้างไว้
- [ ] **Expected**: สต็อกเริ่มต้น = 0 ทั้งหมด
- [ ] **Expected**: แสดงสถานะ "ต่ำ" ถ้า < min_stock
- [ ] **Actual**: _________________________
- [ ] **Status**: ✅ Pass / ❌ Fail
- [ ] **Notes**: _________________________

### 5.2 Stock Movements Tab
**Test Case**: บันทึกการรับเข้าสต็อก
- [ ] **Action**:
  - เลือกสินค้า: "ยาง Bridgestone 205/55R16"
  - ประเภท: "รับเข้า"
  - จำนวน: 100
  - ราคาทุน: 1,800
  - หมายเหตุ: "รับยางเข้า stock ครั้งแรก"
- [ ] **Expected**: บันทึกสำเร็จ, แสดงในประวัติ
- [ ] **Actual**: _________________________
- [ ] **Status**: ✅ Pass / ❌ Fail
- [ ] **Notes**: _________________________

**Test Case**: บันทึกการเบิกออกสต็อก
- [ ] **Action**:
  - เลือกสินค้า: "ยาง Bridgestone 205/55R16"
  - ประเภท: "เบิกออก"
  - จำนวน: 2
  - หมายเหตุ: "ทดสอบการเบิก"
- [ ] **Expected**: บันทึกสำเร็จ, คงเหลือ = 98
- [ ] **Actual**: _________________________
- [ ] **Status**: ✅ Pass / ❌ Fail
- [ ] **Notes**: _________________________

**Test Case**: บันทึกการคืนสินค้า
- [ ] **Action**: ประเภท "คืนสินค้า", จำนวน 1
- [ ] **Expected**: คงเหลือ = 99
- [ ] **Actual**: _________________________
- [ ] **Status**: ✅ Pass / ❌ Fail
- [ ] **Notes**: _________________________

**Test Case**: บันทึกการสูญเสีย/เสียหาย
- [ ] **Action**: ประเภท "เสียหาย", จำนวน 1, เหตุผล: "ชำรุด"
- [ ] **Expected**: บันทึกสำเร็จ, คงเหลือ = 98
- [ ] **Actual**: _________________________
- [ ] **Status**: ✅ Pass / ❌ Fail
- [ ] **Notes**: _________________________

**Test Case**: บันทึกการปรับปรุงสต็อก
- [ ] **Action**: ประเภท "ปรับปรุง", จำนวน 2, เหตุผล: "ตรวจนับพบความคลาดเคลื่อน"
- [ ] **Expected**: คงเหลือ = 100
- [ ] **Actual**: _________________________
- [ ] **Status**: ✅ Pass / ❌ Fail
- [ ] **Notes**: _________________________

### 5.3 Movement History Features
- [ ] **Filter by Type**: กรองตามประเภทการเคลื่อนไหว
- [ ] **Search**: ค้นหาตามชื่อสินค้า
- [ ] **Pagination**: ทำงานถูกต้อง
- [ ] **Date Range**: กรองตามช่วงวันที่
- [ ] **Icons & Colors**: แสดงสีและไอคอนตามประเภท

### 5.4 Stock Alerts Tab
**Test Case**: ทดสอบระบบแจ้งเตือน
- [ ] **Setup**: แก้ไขสินค้าให้ min_stock = 50
- [ ] **Expected**: แสดงใน alerts tab
- [ ] **Expected**: แสดงประเภท "สต็อกต่ำ"
- [ ] **Actual**: _________________________
- [ ] **Status**: ✅ Pass / ❌ Fail
- [ ] **Notes**: _________________________

---

## 🎯 Phase 6: Cross-Module Integration

### 6.1 Stock-Products Integration
- [ ] **Auto Update**: สต็อคอัพเดทอัตโนมัติเมื่อมีการเคลื่อนไหว
- [ ] **Real-time**: คงเหลือปัจจุบันแสดงข้อมูลล่าสุด
- [ ] **Alert Trigger**: แจ้งเตือนทำงานเมื่อสต็อกต่ำ

### 6.2 Settings Integration
- [ ] **Currency**: สกุลเงินแสดงถูกต้องในทุกหน้า
- [ ] **VAT**: คำนวณ VAT ถูกต้อง (ถ้ามีการแสดง)
- [ ] **Units**: หน่วยนับแสดงถูกต้องในสินค้า

---

## 📱 Phase 7: Responsive Design & UX

### 7.1 Desktop (1920x1080)
- [ ] **Layout**: Sidebar แสดงถูกต้อง
- [ ] **Tables**: แสดงข้อมูลครบถ้วน
- [ ] **Forms**: แสดงในตำแหน่งที่เหมาะสม
- [ ] **Modals**: ขนาดพอดีกับหน้าจอ

### 7.2 Tablet (768x1024)
- [ ] **Sidebar**: ยุบได้/ขยายได้
- [ ] **Tables**: Scroll แนวนอนถ้าจำเป็น
- [ ] **Forms**: แสดงถูกต้อง

### 7.3 Mobile (375x667)
- [ ] **Sidebar**: เป็น hamburger menu
- [ ] **Tables**: Responsive แสดงข้อมูลสำคัญ
- [ ] **Forms**: Full-width และง่ายต่อการใช้

---

## ⚡ Phase 8: Performance & Error Handling

### 8.1 Performance
- [ ] **Load Time**: หน้าแรกโหลด < 3 วินาที
- [ ] **API Response**: API calls < 1 วินาที
- [ ] **Search**: ค้นหาทำงานไว
- [ ] **Pagination**: เปลี่ยนหน้าไว

### 8.2 Error Handling
- [ ] **Network Error**: แสดงข้อความเมื่อ offline
- [ ] **Validation**: แสดง error ถ้าข้อมูลไม่ถูกต้อง
- [ ] **404 Pages**: แสดงหน้า 404 ถ้าไม่พบ
- [ ] **Server Error**: แสดงข้อความ error ที่เข้าใจง่าย

### 8.3 Data Validation
- [ ] **Required Fields**: ต้องกรอกข้อมูลที่จำเป็น
- [ ] **Numeric Fields**: รับเฉพาะตัวเลข
- [ ] **Email Format**: ตรวจสอบรูปแบบ email
- [ ] **Length Limits**: จำกัดความยาวข้อมูล

---

## 🔧 Phase 9: Advanced Features

### 9.1 Search Functionality
- [ ] **Real-time Search**: ค้นหาขณะพิมพ์
- [ ] **Fuzzy Search**: ค้นหาแม้สะกดผิด
- [ ] **Multiple Fields**: ค้นหาจากหลายฟิลด์
- [ ] **Search History**: จดจำการค้นหา

### 9.2 Data Export/Import
- [ ] **Export CSV**: ส่งออกข้อมูลเป็น CSV
- [ ] **Export PDF**: ส่งออกรายงานเป็น PDF
- [ ] **Import CSV**: นำเข้าข้อมูลจาก CSV
- [ ] **Bulk Operations**: ดำเนินการหลายรายการพร้อมกัน

---

## 📋 Phase 10: Final System Validation

### 10.1 Complete Workflow
**Test Case**: ทดสอบ workflow ตั้งแต่เริ่มจนจบ
1. [ ] **Setup**: Login และตั้งค่าร้าน
2. [ ] **Categories**: สร้างหมวดหมู่
3. [ ] **Products**: เพิ่มสินค้าและบริการ
4. [ ] **Stock**: รับเข้าสต็อก
5. [ ] **Operations**: บันทึกการเคลื่อนไหวสต็อก
6. [ ] **Reports**: ดูรายงานและสรุป
- [ ] **Expected**: Workflow ทำงานต่อเนื่องไม่มีปัญหา
- [ ] **Actual**: _________________________
- [ ] **Status**: ✅ Pass / ❌ Fail
- [ ] **Notes**: _________________________

### 10.2 Data Integrity
- [ ] **No Data Loss**: ข้อมูลไม่หายระหว่างการทำงาน
- [ ] **Consistency**: ข้อมูลสอดคล้องกันทุก module
- [ ] **Backup**: สามารถ backup/restore ข้อมูล
- [ ] **Concurrency**: หลายคนใช้งานพร้อมกันได้

---

## 📊 สรุปผลการทดสอบ

### 🎯 สถิติการทดสอบ
- **Total Test Cases**: ____
- **Passed**: ____
- **Failed**: ____
- **Success Rate**: __%

### 📝 ปัญหาที่พบ
1. **Critical Issues**: _________________________
2. **Major Issues**: _________________________
3. **Minor Issues**: _________________________
4. **Suggestions**: _________________________

### 🚀 ขั้นตอนถัดไป
- [ ] **Fix Critical Issues**: แก้ไขปัญหาระดับ Critical
- [ ] **User Acceptance Testing**: ทดสอบกับผู้ใช้จริง
- [ ] **Performance Optimization**: ปรับปรุงประสิทธิภาพ
- [ ] **Documentation**: อัพเดทเอกสารประกอบ

---

## 📞 ข้อมูลติดต่อ
- **Tester**: _________________________
- **Date**: _________________________
- **Environment**: _________________________
- **Browser**: _________________________
- **Notes**: _________________________

**📌 คู่มือนี้ควรใช้ร่วมกับ `docs/testing-guide.md` สำหรับขั้นตอนการติดตั้งและการทดสอบพื้นฐาน**
