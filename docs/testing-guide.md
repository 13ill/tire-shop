# คู่มือการทดสอบระบบ Tire Shop POS

## 📋 ภาพรวมการทดสอบ

คู่มือนี้อธิบายขั้นตอนการติดตั้งและทดสอบระบบ POS+Stock สำหรับร้านยาง/อะไหล่/ซ่อมบำรุง

## 🛠️ ข้อกำหนดเบื้องต้น

### Software Requirements
- **Node.js** v18+ (แนะนำ v20 LTS)
- **MySQL** v8.0+ หรือ **MariaDB** v10.6+
- **Git** สำหรับ clone repository

### Hardware Requirements
- RAM: 最低 4GB (แนะนำ 8GB+)
- Storage: 最低 10GB ว่าง
- CPU: Modern dual-core processor

## 🚀 ขั้นตอนการติดตั้ง

### 1. Clone Repository
```bash
git clone <repository-url>
cd tire-shop-pos
```

### 2. Setup Database
```sql
-- สร้าง database ใหม่
CREATE DATABASE tire_shop_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- สร้าง user สำหรับ application (optional)
CREATE USER 'tire_shop'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON tire_shop_pos.* TO 'tire_shop'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Setup Backend
```bash
cd server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# แก้ไข .env file
nano .env
```

**ไฟล์ .env ตัวอย่าง:**
```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/tire_shop_pos"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Server
PORT=3000
NODE_ENV=development
```

### 4. Setup Frontend
```bash
cd ../client

# Install dependencies
npm install
```

### 5. Run Database Migrations
```bash
cd ../server

# Generate migrations (ถ้ายังไม่เคยทำ)
npm run db:migrate

# Run migrations
npm run db:migrate:run

# Seed initial data
npm run db:seed
```

## 🎯 การทดสอบระบบ

### Phase 1: Basic Setup Testing

#### 1.1 Start Services
```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start frontend (ใน terminal ใหม่)
cd client
npm run dev
```

#### 1.2 Verify Services
- **Backend**: http://localhost:3000/health
  - ควรแสดง: `{"status":"ok","timestamp":"...","env":"development"}`
- **Frontend**: http://localhost:5173
  - ควรแสดงหน้า login

#### 1.3 Test Authentication
1. **Login ครั้งแรก**:
   - Username: `owner`
   - Password: `admin123`
2. **สร้าง user ใหม่** (ถ้าต้องการ):
   - คลิก "สร้างบัญชีใหม่"
   - กรอกข้อมูลและสร้าง staff account

### Phase 2: Core Modules Testing

#### 2.1 Settings Module
1. ไปที่เมนู "ตั้งค่าระบบ"
2. **ทดสอบ Tab ทั่วไป**:
   - แก้ไขชื่อร้าน: "ร้านยางของฉัน" → "ร้านยางทดสอบ"
   - แก้ไข VAT: 7% → 7.5%
   - บันทึกและตรวจสอบว่าบันทึกสำเร็จ
3. **ทดสอบ Tab วิธีการชำระเงิน**:
   - เพิ่มวิธีการชำระเงิน: "QR Code"
   - ตั้งค่าค่าธรรมเนียม: 1%
   - ลองแก้ไขและลบ
4. **ทดสอบ Tab หน่วยนับ**:
   - เพิ่มหน่วย: "ชุด"
   - ทำเป็นค่าเริ่มต้น
   - ตรวจสอบการทำงาน

#### 2.2 Categories Module
1. ไปที่เมนู "สินค้าและบริการ" → "หมวดหมู่"
2. **ทดสอบสร้างหมวดหมู่สินค้า**:
   - สร้าง "ยางรถยนต์"
   - สร้าง "ล้อแม็กซ์" เป็นลูกของ "ยางรถยนต์"
3. **ทดสอบสร้างหมวดหมู่บริการ**:
   - สร้าง "บริการเปลี่ยนยาง"
   - สร้าง "บริการถ่วงล้อ"
4. **ทดสอบการแก้ไขและลบ**

#### 2.3 Products Module
1. ไปที่เมนู "สินค้าและบริการ"
2. **ทดสอบเพิ่มสินค้า**:
   - ชื่อ: "ยาง Bridgestone 205/55R16"
   - ประเภท: สินค้า
   - หมวดหมู่: "ยางรถยนต์"
   - ราคาขายปลีก: 2,500
   - ราคาทุน: 1,800
   - SKU: BS20555R16
   - สต็อกขั้นต่ำ: 10
3. **ทดสอบเพิ่มบริการ**:
   - ชื่อ: "บริการเปลี่ยนยาง 4 ล้อ"
   - ประเภท: บริการ
   - หมวดหมู่: "บริการเปลี่ยนยาง"
   - ราคาแรงงาน: 200
   - เปิดใช้งาน "มีค่าแรงงาน"
4. **ทดสอบการค้นหาและกรอง**:
   - ค้นหาด้วยชื่อ "Bridgestone"
   - กรองเฉพาะ "สินค้า"
   - กรองตามหมวดหมู่

#### 2.4 Stock Management
1. ไปที่เมนู "จัดการสต็อก"
2. **ทดสอบ Tab คงเหลือปัจจุบัน**:
   - ตรวจสอบว่าแสดงสินค้าที่สร้างไว้
   - ตรวจสอบสถานะสต็อก (ควรเป็น 0 เริ่มต้น)
3. **ทดสอบบันทึกการเคลื่อนไหวสต็อก**:
   - คลิก "บันทึกการเคลื่อนไหวสต็อก"
   - เลือกสินค้า "ยาง Bridgestone 205/55R16"
   - ประเภท: "รับเข้า"
   - จำนวน: 100
   - ราคาทุน: 1,800
   - หมายเหตุ: "รับยางเข้า stock ครั้งแรก"
   - บันทึก
4. **ทดสอบ Tab ประวัติการเคลื่อนไหว**:
   - ตรวจสอบว่าแสดงรายการที่เพิ่งบันทึก
   - กรองตามประเภท "รับเข้า"
5. **ทดสอบ Tab การแจ้งเตือน**:
   - ควรไม่มีการแจ้งเตือน (เนื่องจากมีสต็อกเพียพ)
6. **ทดสอบการเบิกสต็อก**:
   - บันทึกการเคลื่อนไหวประเภท "เบิกออก"
   - จำนวน: 2
   - หมายเหตุ: "ทดสอบการเบิก"
   - ตรวจสอบว่าคงเหลือเป็น 98

### Phase 3: Advanced Testing

#### 3.1 Test Stock Alerts
1. แก้ไขสินค้าให้สต็อกขั้นต่ำสูงกว่าปัจจุบัน
   - แก้ไข "ยาง Bridgestone" ตั้งสต็อกขั้นต่ำเป็น 50
2. ตรวจสอบ Tab การแจ้งเตือนว่ามีการแจ้งเตือนสต็อกต่ำ

#### 3.2 Test Stock Corrections
1. บันทึกการเคลื่อนไหวประเภท "ปรับปรุง"
2. กรอกเหตุผล: "ตรวจนับพบความคลาดเคลื่อน"
3. ตรวจสอบว่าปรากฏในประวัติ

#### 3.3 Test Loss/Damage Recording
1. บันทึกการเคลื่อนไหวประเภท "เสียหาย"
2. กรอกเหตุผล: "สินค้าเสียหายระหว่างขนส่ง"
3. ตรวจสอบการแสดงผล

## 🔍 การตรวจสอบผลลัพธ์

### Checklists สำหรับแต่ละ Module

#### Authentication ✅
- [ ] Login สำเร็จด้วย user/password ถูกต้อง
- [ ] Login ล้มเหลวด้วย user/password ผิด
- [ ] Register user ใหม่สำเร็จ
- [ ] Logout ทำงาน
- [ ] Token หมดอายุ/invalid ไม่สามารถเข้าใช้งานได้

#### Settings ✅
- [ ] แก้ไขข้อมูลร้านสำเร็จ
- [ ] เพิ่ม/แก้ไข/ลบวิธีการชำระเงิน
- [ ] เพิ่ม/แก้ไข/ลบหน่วยนับ
- [ ] ตั้งค่าหน่วยนับเริ่มต้นทำงาน
- [ ] VAT และสกุลเงินอัพเดท

#### Categories ✅
- [ ] สร้างหมวดหมู่หลักสำเร็จ
- [ ] สร้างหมวดหมู่ย่อยสำเร็จ
- [ ] แก้ไขชื่อหมวดหมู่
- [ ] ลบหมวดหมู่ (ที่ไม่มีลูก)
- [ ] แยกประเภทสินค้า/บริการ

#### Products ✅
- [ ] เพิ่มสินค้าพร้อมรายละเอียดครบ
- [ ] เพิ่มบริการพร้อมค่าแรงงาน
- [ ] แก้ไขข้อมูลสินค้า
- [ ] ค้นหาสินค้าทำงาน
- [ ] กรองตามประเภทและหมวดหมู่
- [ ] Pagination ทำงาน
- [ ] SKU/Barcode บันทึก

#### Stock Management ✅
- [ ] บันทึกการรับเข้าสต็อก
- [ ] บันทึกการเบิกออกสต็อก
- [ ] บันทึกการคืนสินค้า
- [ ] บันทึกการสูญเสีย/เสียหาย
- [ ] บันทึกการปรับปรุงสต็อก
- [ ] คำนวณคงเหลือปัจจุบัน
- [ ] แจ้งเตือนสต็อกต่ำ
- [ ] ประวัติการเคลื่อนไหวแสดงถูกต้อง

## 🐛 การแก้ไขปัญหาที่พบบ่อย

### Database Connection Issues
```bash
# ตรวจสอบว่า MySQL กำลังทำงาน
sudo systemctl status mysql

# ตรวจสอบ port
netstat -tlnp | grep :3306

# ทดสอบ connection
mysql -u username -p -h localhost tire_shop_pos
```

### Port Conflicts
```bash
# ตรวจสอบ ports ที่ใช้
netstat -tlnp | grep :3000
netstat -tlnp | grep :5173

# เปลี่ยน port ใน .env หรือ vite.config.ts
```

### Permission Issues
```bash
# ตรวจสอบ file permissions
ls -la

# แก้ไข permissions (ถ้าจำเป็น)
chmod +x scripts/*.sh
```

### Node.js Version Issues
```bash
# ตรวจสอบ Node.js version
node --version
npm --version

# ใช้ nvm ถ้าต้องการเปลี่ยน version
nvm use 20
```

## 📊 การทดสอบ Performance

### Load Testing (Optional)
```bash
# Install artillery สำหรับ load testing
npm install -g artillery

# สร้าง test script
cat > load-test.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Health Check"
    requests:
      - get:
          url: "/health"
EOF

# Run load test
artillery run load-test.yml
```

## 📝 การบันทึกผลการทดสอบ

สร้างไฟล์ `test-results.md` สำหรับบันทึกผล:

```markdown
# ผลการทดสอบวันที่ [วันที่]

## ✅ ผ่าน
- Authentication: Login/Logout ทำงาน
- Settings: บันทึกข้อมูลร้านสำเร็จ
- Categories: สร้างหมวดหมู่สำเร็จ
- Products: เพิ่มสินค้า 5 รายการ
- Stock: รับ-เบิกสต็อกถูกต้อง

## ❌ ไม่ผ่าน
- [รายการที่ไม่ผ่านพร้อมรายละเอียด]

## 🐛 ปัญหาที่พบ
- [ปัญหาและวิธีแก้ไข]

## 💡 ข้อเสนอแนะ
- [ข้อเสนอแนะสำหรับปรับปรุง]
```

## 🎯 ขั้นตอนถัดไป

หลังจากทดสอบ core modules สำเร็จ:

1. **ทดสอบ POS Module** - สร้างใบเสร็จและการขาย
2. **ทดสอบ Customers Module** - จัดการลูกค้าและรถยนต์
3. **ทดสอบ Offline Features** - ทำงานขณะ offline
4. **ทดสอบ PWA** - ติดตั้งและใช้งานบนมือถือ
5. **ทดสอบ Sync** - การ sync ข้อมูล offline/online

## 📞 การขอความช่วยเหลือ

หากพบปัญหา:

1. ตรวจสอบ console logs ใน browser และ terminal
2. ตรวจสอบ network requests ใน DevTools
3. ตรวจสอบ database logs: `tail -f /var/log/mysql/error.log`
4. สร้าง issue ใน repository พร้อมรายละเอียดปัญหา

---

**📌 จำไว้**: นี่คือระบบที่พัฒนาขึ้นสำหรับการทดสอบ อาจมี bugs หรือ features ที่ยังไม่สมบูรณ์ รบกวนแจ้งกลับเพื่อปรับปรุงครับ!
