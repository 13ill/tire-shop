# Setup Guide — ติดตั้ง Project บน Windows/macOS

---

## วัตถุประสงค์
คู่มือนี้ใช้ติดตั้ง development environment สำหรับ POS+Stock ร้านยาง บนทุก OS

---

## Prerequisites

### ทุก OS:
- Node.js 18+ 
- Git
- VS Code หรือ Windsurf
- MySQL/MariaDB (สำหรับ local development) หรือใช้ remote DB

### Windows เพิ่มเติม:
- Terminal (PowerShell หรือ CMD)

### macOS เพิ่มเติม:
- Homebrew (แนะนำ)
- Terminal

---

## Step 1: Environment Variable

### Windows (PowerShell):
```powershell
# ชั่วคราว (session ปัจจุบัน)
$env:AI_OS_PATH = "f:\Programming\setup"

# Permanent (ทุก session)
[System.Environment]::SetEnvironmentVariable('AI_OS_PATH', 'f:\Programming\setup', 'User')
# รีสตาร์ท PowerShell หรือเปิดใหม่
```

### macOS (Terminal):
```bash
# ชั่วคราว (session ปัจจุบัน)
export AI_OS_PATH="/Users/[name]/Programming/setup"

# Permanent (ทุก session)
echo 'export AI_OS_PATH="/Users/[name]/Programming/setup"' >> ~/.zshrc
# หรือถ้าใช้ bash:
# echo 'export AI_OS_PATH="/Users/[name]/Programming/setup"' >> ~/.bashrc
source ~/.zshrc  # หรือ source ~/.bashrc
```

### ตรวจสอบ:
```bash
# Windows
echo $env:AI_OS_PATH

# macOS
echo $AI_OS_PATH
```

---

## Step 2: Clone Repositories

### Clone AI-OS Rules:
```bash
# Windows
git clone [YOUR_PRIVATE_REPO_URL] $env:AI_OS_PATH

# macOS
git clone [YOUR_PRIVATE_REPO_URL] $AI_OS_PATH
```

### Clone Project:
```bash
git clone [PROJECT_REPO_URL] f:\Programming\tire-shop-pos
# หรือ path อื่นตามต้องการ
```

---

## Step 3: Install Dependencies

### Frontend (client):
```bash
cd f:\Programming\tire-shop-pos\client
npm install
```

### Backend (server):
```bash
cd f:\Programming\tire-shop-pos\server
npm install
```

### Shared Types:
```bash
cd f:\Programming\tire-shop-pos\shared
npm install
```

---

## Step 4: Database Setup

### Option A: Local MySQL/MariaDB
```bash
# Windows (มี XAMPP/MAMP/WAMP)
# สร้าง database:
CREATE DATABASE tire_shop_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# macOS (Homebrew)
brew install mysql
brew services start mysql
mysql -u root -p
CREATE DATABASE tire_shop_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Option B: Remote Database
- ใช้ shared hosting MySQL
- แก้ connection string ใน `server/src/db/connection.ts`

---

## Step 5: Environment Configuration

สร้างไฟล์ `.env` ใน `server/`:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tire_shop_pos

# JWT
JWT_SECRET=your-super-secret-key-here

# Server
PORT=3000
NODE_ENV=development
```

---

## Step 6: Run Migrations

```bash
cd f:\Programming\tire-shop-pos\server
npm run db:migrate
npm run db:seed  # optional
```

---

## Step 7: Start Development

### Terminal 1 - Backend:
```bash
cd f:\Programming\tire-shop-pos\server
npm run dev
# Server ที่ http://localhost:3000
```

### Terminal 2 - Frontend:
```bash
cd f:\Programming\tire-shop-pos\client
npm run dev
# App ที่ http://localhost:5173
```

---

## Step 8: Verify Setup

1. เปิด http://localhost:5173 → ควรเห็น login page
2. เปิด http://localhost:3000/api/health → ควร return "OK"
3. ลอง login (username: admin, password: admin123)
4. เช็ค status bar → ควรแสดง 🟢 Online

---

## Troubleshooting

### "AI_OS_PATH not found"
- ตรวจสอบว่า set environment variable แล้ว
- รีสตาร์ท terminal/IDE

### "Cannot connect to database"
- ตรวจสอบว่า MySQL รันอยู่
- ตรวจสอบ connection string ใน .env
- ลอง connect ด้วย client ก่อน

### "Module not found"
- รัน `npm install` ในทุก folder (client, server, shared)
- ตรวจสอดว่า Node.js version >= 18

### Port conflict
- เปลี่ยน port ใน .env หรือ vite.config.ts
- หรือ kill process: `netstat -ano | findstr :3000` (Windows)

---

## Next Steps

อ่าน `docs/status.md` → ดูว่าต้องทำ module ไหนต่อ

แนะนำเริ่มจาก:
1. Settings module (configurable values)
2. Auth module (login/logout)
3. Products module (CRUD)

ทุก module ให้อ่าน `docs/modules/[module].md` ก่อน code
