# Delegation Framework — วิธีสั่งงาน AI อย่างเป็นระบบ
# ใช้เมื่อ: ต้องการให้ AI ทำงานแทน — สั่งอย่างไรให้ได้ผลลัพธ์ดี
# เป้าหมาย: ฝึกเป็น "คนสั่ง" ไม่ใช่ "คนทำ"

---

## หลักการ Delegate ให้ AI

```
คนสั่งที่ดี ≠ สั่งเยอะ
คนสั่งที่ดี = สั่งชัด + ให้ context ครบ + ตรวจผลลัพธ์เป็น
```

---

## 5 ขั้นตอนการ Delegate

### 1. Define — กำหนดชัดว่าต้องการอะไร
```
- Output ที่ต้องการคืออะไร?
- เสร็จแล้วต้องเห็นอะไร?
- quality ระดับไหน? (draft / production-ready)
```

### 2. Context — ให้ข้อมูลครบ
```
- ระบบ/project คืออะไร?
- tech stack คืออะไร?
- constraints คืออะไร?
- มีตัวอย่างที่คล้ายกันไหม?
```

### 3. Boundary — บอกขอบเขต
```
- ทำอะไร / ไม่ทำอะไร
- style/pattern ที่ต้องตาม
- สิ่งที่ห้ามทำ
```

### 4. Execute — ให้ AI ทำ
```
- ใช้ prompt structure (Context/Goal/Constraints/Need)
- ระบุ mode ที่ต้องการ
```

### 5. Verify — ตรวจผลลัพธ์
```
- ตรงกับที่ต้องการไหม?
- quality ดีพอไหม?
- มี bug / error / ข้อผิดพลาดไหม?
- ถ้าไม่ดี → feedback + ให้ทำใหม่
```

---

## ตัวอย่าง: สั่ง AI ทำ CRUD Product

```
[code-mode]

Context:
- ระบบ stock สำหรับร้านค้าปลีก
- Next.js 14 + Supabase + Prisma
- TypeScript

Task:
สร้าง CRUD API สำหรับ Product:
- GET /api/products — ลิสต์สินค้าทั้งหมด (pagination)
- GET /api/products/:id — ดูสินค้า 1 ชิ้น
- POST /api/products — สร้างสินค้าใหม่
- PUT /api/products/:id — แก้ไขสินค้า
- DELETE /api/products/:id — ลบสินค้า (soft delete)

Schema:
products: id, name, sku, price, category, created_at, updated_at, deleted_at

Constraints:
- ใช้ Prisma ORM
- input validation ด้วย zod
- error handling ครบ (400, 404, 500)
- return format: { success: boolean, data: ..., error: ... }

ไม่ต้องทำ:
- auth (ทำแยก)
- frontend (ทำทีหลัง)
```

---

## เทคนิคการ Delegate ที่ดี

1. **แบ่ง task เล็กๆ** — สั่งทีละ task ไม่ใช่ทีละ project
2. **ให้ตัวอย่าง** — "ทำแบบนี้" ดีกว่า "ทำอะไรก็ได้"
3. **ระบุ format** — "return เป็น JSON format นี้" ชัดกว่า "return อะไรก็ได้"
4. **ตรวจทันที** — อย่ารอจนเสร็จหมดแล้วค่อยตรวจ → ตรวจทีละ task
5. **feedback ชัด** — "ตรงนี้ผิดเพราะ..." ดีกว่า "ไม่ใช่ ทำใหม่"

---

## Level ของ Delegation

| Level | คุณทำอะไร | AI ทำอะไร |
|---|---|---|
| 1: Pair | คุณคิด + AI เขียน | AI เป็น typist |
| 2: Direct | คุณสั่งชัด + AI ทำ + คุณ review | AI เป็น junior dev |
| 3: Autonomous | คุณกำหนด goal + AI plan + ทำ + คุณ validate | AI เป็น mid dev |
| 4: Strategic | คุณกำหนด vision + AI ทำทุกอย่าง | AI เป็น senior dev |

**เป้าหมาย 9 เดือน: อยู่ที่ Level 3-4**
