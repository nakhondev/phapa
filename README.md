# 🙏 ระบบบริหารจัดการงานผ้าป่า (Pha Pa Donation Management)

ระบบบริหารจัดการงานผ้าป่าออนไลน์ ติดตามยอดบริจาคแบบ **Realtime**

## Tech Stack

- **Frontend**: Next.js + HeroUI v3 + Tailwind CSS v4
- **Backend**: Express.js + Supabase (Realtime)
- **Database**: Supabase (PostgreSQL)

## โครงสร้างโปรเจค

```
phapa/
├── frontend/          # Next.js App
│   ├── src/
│   │   ├── app/       # Pages (landing, admin)
│   │   ├── components/# UI Components
│   │   ├── hooks/     # Realtime hooks
│   │   └── lib/       # Supabase client, API, types
│   └── ...
├── backend/           # Express API Server
│   ├── src/
│   │   ├── routes/    # API routes (events, donations)
│   │   ├── supabaseClient.js
│   │   └── index.js   # Express server entry
│   └── supabase/
│       └── schema.sql # Database schema
└── README.md
```

## Setup

### 1. Supabase
- สร้างโปรเจคที่ [supabase.com](https://supabase.com)
- รัน SQL จากไฟล์ `backend/supabase/schema.sql` ใน SQL Editor
- เปิด Realtime ให้ตาราง `donations` และ `events`

### 2. Backend
```bash
cd backend
cp .env.example .env   # แก้ไข env ให้ตรงกับ Supabase
npm install
npm run dev             # http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env.local  # แก้ไข env ให้ตรงกับ Supabase
npm install
npm run dev                  # http://localhost:3000
```

## หน้าเว็บ

- `/` — รายการงานผ้าป่าทั้งหมด + สร้างงานใหม่
- `/?event=<id>` — Landing Page แสดงยอดบริจาค Realtime
- `/admin?event=<id>` — Admin Dashboard จัดการรายการบริจาค

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | รายการงานผ้าป่าทั้งหมด |
| GET | `/api/events/:id` | ดึงงานผ้าป่าตาม ID |
| GET | `/api/events/:id/summary` | สรุปยอดบริจาค |
| POST | `/api/events` | สร้างงานใหม่ |
| PUT | `/api/events/:id` | อัพเดทงาน |
| GET | `/api/donations?event_id=xxx` | รายการบริจาค |
| GET | `/api/donations/recent` | บริจาคล่าสุด |
| POST | `/api/donations` | เพิ่มรายการบริจาค |
| DELETE | `/api/donations/:id` | ลบรายการบริจาค |
