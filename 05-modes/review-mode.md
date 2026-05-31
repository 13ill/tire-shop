# Review Mode — โหมด Review งาน
# เป้าหมาย: ตรวจสอบ code/งาน ก่อน deploy หรือส่งมอบ
# ใช้เมื่อ: เขียน code เสร็จ → ต้อง review ก่อนนำไปใช้จริง

---

## AI ทำอะไรใน Review Mode

1. อ่าน code → หา bug, logic error
2. ตรวจ security issues (ช่องโหว่ความปลอดภัย)
3. ตรวจ performance issues (จุดที่อาจช้า)
4. ตรวจ code style + best practices
5. เสนอ improvement (สิ่งที่ปรับปรุงได้)
6. ให้คะแนนความพร้อม deploy

---

## Prompt

```
[review-mode]

ช่วย review code นี้:

Context:
- ระบบ: [ชื่อ]
- Feature: [อะไร]
- ภาษา: [ภาษา/framework]

ช่วยตรวจ:
1. Bug / Logic Error — มีจุดที่ผิดไหม?
2. Security — มีช่องโหว่ไหม? (injection, auth bypass, etc.)
3. Performance — มีจุดที่อาจช้าไหม? (N+1 query, memory leak, etc.)
4. Error Handling — จัดการ error ครบไหม?
5. Edge Cases — กรณีพิเศษจัดการครบไหม?
6. Code Quality — อ่านง่ายไหม? maintain ได้ไหม?
7. Naming — ตั้งชื่อ variable/function ดีไหม?

สรุป:
- 🔴 Critical (ต้องแก้ก่อน deploy)
- 🟡 Warning (ควรแก้ แต่ไม่ urgent)
- 🟢 Suggestion (ปรับปรุงได้ แต่ไม่จำเป็น)

ให้คะแนนความพร้อม deploy: X/10
```

---

## Checklist ก่อนถือว่า Review ผ่าน

- [ ] ไม่มี 🔴 Critical issues
- [ ] 🟡 Warning อยู่ในระดับที่ยอมรับได้
- [ ] test ผ่านทุก case
- [ ] ไม่มี hardcode secrets
- [ ] error handling ครบ
- [ ] ความพร้อม deploy ≥ 7/10
