# คำถามเมื่อ: ต้อง Deploy
# สถานการณ์: จะนำโค้ดขึ้น production — ต้องเช็คก่อน

---

## 5 คำถามก่อน Deploy

1. **rollback ได้ไหม? ทำยังไง?** — ถ้าพังต้องย้อนกลับได้
2. **ถ้าพังจะรู้ได้ยังไง?** — monitor/alert อะไร
3. **deploy ตอนไหนปลอดภัย?** — ไม่ใช่ peak hour
4. **ต้องแจ้งใครไหม?** — owner, user, ทีม
5. **มี breaking change ไหม?** — ของเก่าจะพังไหม

---

## Checklist ย่อ

```
- [ ] test ผ่าน
- [ ] review ผ่าน
- [ ] env vars ตั้งครบ
- [ ] backup DB แล้ว
- [ ] rollback plan มี
- [ ] ไม่ใช่ peak hour
- [ ] monitor พร้อม
```
