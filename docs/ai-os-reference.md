# AI-OS Reference — ระบบปฏิบัติการร่วมกับ AI

---

## นี่คืออะไร?

Project นี้ใช้ **AI-Native Operational System (AI-OS)** — ระบบที่บังคับให้ AI ทำตาม gate system, ถามก่อนทำ, เสนอ tradeoff, และบันทึกทุก decision

## Global AI-OS อยู่ที่ไหน?

```
Source of truth: f:\Programming\setup\
(private repo — clone ทุกเครื่องที่ทำงาน)

ถ้าเครื่องนี้ไม่มี setup/ folder:
1. Clone from: [YOUR_PRIVATE_REPO_URL]
2. วางที่: f:\Programming\setup\
3. หรือ path อื่น → แก้ .windsurfrules ให้ชี้ถูก
```

## Setup เครื่องใหม่ (ทำครั้งเดียว):

### Step 1: Set Environment Variable
```bash
# Windows
set AI_OS_PATH=f:\Programming\setup

# macOS / Linux
export AI_OS_PATH="/Users/[name]/Programming/setup"

# ถ้าต้องการให้ permanent:
# Windows → เพิ่มใน System Environment Variables
# macOS → เพิ่มใน ~/.zshrc หรือ ~/.bashrc:
#   export AI_OS_PATH="/Users/[name]/Programming/setup"
```

### Step 2: Clone Repositories
```bash
# 1. Clone AI-OS rules
git clone [YOUR_PRIVATE_REPO_URL] %AI_OS_PATH%

# 2. Clone project
git clone [PROJECT_REPO_URL] f:\Programming\tire-shop-pos

# 3. เปิด project → AI อ่าน .windsurfrules อัตโนมัติ
#    ถ้า setup/ อยู่ในเครื่อง → AI ใช้ global rules ได้
#    ถ้าไม่มี → ใช้ .windsurfrules + docs/ ของ project (เพียงพอ)
```

## โครงสร้าง AI-OS (Global):

| Folder | เนื้อหา | ใช้เมื่อไร |
|---|---|---|
| 00-identity/ | ตัวตน, workflow guide, principles | ทุก session |
| 01-intake/ | Checklist Gate 1, deep intake | เริ่ม project/feature ใหม่ |
| 02-analysis/ | Template วิเคราะห์ระบบ | Gate 2 |
| 03-architecture/ | Guide ออกแบบ | Gate 4 |
| 04-execution/ | กฎ coding, quality | ขณะ code |
| 05-modes/ | AI modes (coaching, architect, debug) | ตลอด |
| 06-templates/ | Doc templates | สร้าง docs |
| 07-logs/ | Decision/lesson logs | ทุก decision |
| 08-references/ | References, checklists | อ้างอิง |
| 09-project-playbooks/ | Playbook per project type | เริ่ม project ใหม่ |

## Commands:

| Command | ทำอะไร |
|---|---|
| `/inject-ai-os` | Copy AI-OS skills เข้า project (สร้าง docs/ai-os/) |
| `/remove-ai-os` | ลบ AI-OS ออกจาก project |
| `/sync-ai-os` | Update AI-OS ใน project จาก setup/ |

## ถ้าไม่มี setup/ ใช้อะไรแทน?

Project นี้มีกฎพื้นฐานอยู่ใน:
- `.windsurfrules` — gate system + coding rules + tech stack
- `docs/scope.md` — feature scope
- `docs/workflows.md` — ทุก use case flow
- `docs/architecture.md` — system design
- `docs/status.md` — progress tracking

**เพียงพอสำหรับทำงานต่อได้** — แต่จะไม่มี coaching mode, deep checklists, modes ต่างๆ
